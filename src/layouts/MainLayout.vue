<template>
  <q-layout view="hHh LpR lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <breadcrumbs
          :absolutePath="selectedFolder"
          @selected="onSelectedFolder"
        />

        <q-btn
          flat
          dense
          round
          :icon="listType === 'grid' ? 'format_list_bulleted' : 'border_all'"
          aria-label="toggle between grid and list modes"
          @click="toggleListType"
        />

      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      side="left"
      show-if-above
      behavior="desktop"
      bordered
      content-class="bg-grey-1"
    >
      <shortcuts
        @selected="onShortcutSelected"
      />
      <folder-tree
        :rootDir="rootDir"
        :folder.sync="selectedFolder"
        :lazyLoad="onLazyLoad"
        @selected="onSelectedFolder"
      />
    </q-drawer>

    <q-page-container>
      <!-- <router-view /> -->

      <contents
        :contents="contents"
        :listType="listType"
        @click="onClicked"
        @dblClick="onDblClicked"
      />

    </q-page-container>
  </q-layout>
</template>

<script>
// This gives us access to the underlying Electron
// object from the "main" process
const { ipcRenderer } = require('electron')
const app = require('@electron/remote').app

// identify mime types
const mime = require('mime-types')

const fs = require('fs')
const path = require('path')

// file watcher
const chokidar = require('chokidar')

import walkFolders from '../util/walkFolders'
import getWindowsDrives from '../util/getWindowsDrives'

export default {
  name: 'MainLayout',
  components: {
    Breadcrumbs: () => import('../components/breadcrumbs'),
    Shortcuts: () => import('../components/shortcuts'),
    FolderTree: () => import('../components/folderTree'),
    Contents: () => import('../pages/contents')
  },

  data () {
    return {
      leftDrawerOpen: false,
      toolbarLinks: [], // toolbar pathway (links to each folder in path)
      drive: process.platform === 'win32' ? 'C:' : '',
      drives: [],
      listType: 'grid', // default ['grid', 'list']
      selectedFolder: null, // the selected node (label)
      rootDir: [], // tree view
      contents: [], // children of a node
      watcher: null
    }
  },

  created () {
    ipcRenderer.send('message', 'We have liftoff!')

    if (process.platform === 'win32') {
      getWindowsDrives((error, drives) => {
        if (!error) {
          this.drives = drives
          // work through the drives backwards
          for (let index = this.drives.length - 1; index >= 0; --index) {
            try {
              const stat = fs.statSync(this.drives[index] + path.sep)
              const fileInfo = {}
              fileInfo.rootDir = this.drives[index]
              fileInfo.fileName = path.sep
              fileInfo.isDir = stat.isDirectory()
              fileInfo.stat = stat
              const node = this.createNode(fileInfo)
              this.rootDir.unshift(node)
            }
            catch (error) {
              // remove from (bad/phantom) drive list
              this.drives.splice(index, 1)
              console.error(error)
            }
          }
        }
      })
    }
    else {
      // set and get root folder's folders
      this.setSelectedFolder(this.drive + path.sep)
      this.rootDir.push(...this.getFolders(this.selectedFolder))
    }

    this.$root.$on('rescan-current-folder', this.rescanCurrentFolder)
  },

  beforeDestroy () {
    this.$root.$off('rescan-current-folder', this.rescanCurrentFolder)
  },

  watch: {
    selectedFolder (newFolder, oldFolder) {
      // The User can de-select a folder, in which case
      // value will be null, so use root folder
      if (!newFolder) {
        newFolder = this.drive + path.sep
      }

      // tell back-end to serve files from this folder
      ipcRenderer.send('folder', newFolder)

      // folder watcher handler
      this.folderWatcherHandler(newFolder, oldFolder)

      this.clearAllContentItems()
      this.contents.push(...this.getFolderContents(newFolder))
    }
  },

  methods: {
    onSelectedFolder (absolutePath) {
      this.setSelectedFolder(absolutePath)
    },

    onShortcutSelected (type) {
      // console.log('onShortcutSelected type:', type)
      const absolutePath = app.getPath(type)
      this.setSelectedFolder(absolutePath)
    },

    // called by folderTree component
    onLazyLoad ({ node, key, done, fail }) {
      if (this.loadChildren(node, key)) {
        done()
      }
      else {
        // if we don't call done, then the tree will
        // allow user to try and expand node again
        done()
      }
    },

    loadChildren (node, key) {
      try {
        if (node.children.length) {
          node.children.splice(0, node.children.length)
        }
        for (const fileInfo of walkFolders(key, 0)) {
          // we only want folders
          if (!fileInfo.isDir) {
            continue
          }
          // create a new node
          const n = this.createNode(fileInfo)
          // add child to parent
          node.children.push(n)
        }
        return true
      }
      catch (err) {
        // usually access error
        console.error('Error: ', err)
      }
      return false
    },

    onClicked (node) {
      // on single-clicks we don't do anything here
      // if we wanted to drill-down into folders, we
      // can call this.onDblClicked function.
    },

    onDblClicked (node) {
      // This causes a drill-down if it's a folder
      if (node.data.isDir) {
        this.setSelectedFolder(node.nodeKey)
      }
      else {
        this.onFileSelected(node)
      }
    },

    onFileSelected (node) {
      // do something with the selected file
      console.log('selected:', node)
    },

    checkForDrive: async function (drives, index) {
      return new Promise(function (resolve, reject) {
        try {
          const stat = fs.statSync(drives[index] + ':' + path.sep)
          drives[index] += ':\\'
          resolve(stat)
        }
        catch (error) {
          // remove from drives list
          drives.splice(index, 1)
          reject(error)
        }
      })
    },

    rescanCurrentFolder () {
      this.clearAllContentItems()
      this.contents.push(...this.getFolderContents(this.selectedFolder))
    },

    toggleListType () {
      if (this.listType === 'grid') {
        this.listType = 'list'
      }
      else {
        this.listType = 'grid'
      }
    },

    clearAllContentItems () {
      this.contents.splice(0, this.contents.length)
    },

    addContentItem (item) {
      this.contents.push(item)
    },

    setSelectedFolder (folder) {
      this.selectedFolder = folder
      // handle windows drive
      if (process.platform === 'win32') {
        if (this.selectedFolder.charAt(this.selectedFolder.length - 1) === ':') {
          this.selectedFolder += path.sep
        }
      }
    },

    getFolders (absolutePath) {
      const folders = []

      // check incoming arg
      if (!absolutePath || typeof absolutePath !== 'string') {
        return folders
      }

      for (const fileInfo of walkFolders(absolutePath, 0)) {
        // all files and folders
        if ('error' in fileInfo) {
          console.error(`Error: ${fileInfo.rootDir} - ${fileInfo.error}`)
          continue
        }
        // we only want folders
        if (!fileInfo.isDir) {
          continue
        }
        const node = this.createNode(fileInfo)
        folders.push(node)
      }
      return folders
    },

    getFolderContents (folder) {
      const contents = []

      // check incoming arg
      if (!folder || typeof folder !== 'string') {
        return contents
      }

      for (const fileInfo of walkFolders(folder, 0)) {
        // all files and folders
        if ('error' in fileInfo) {
          console.error(`Error: ${fileInfo.rootDir} - ${fileInfo.error}`)
          continue
        }
        const node = this.createNode(fileInfo)
        contents.push(node)
      }

      return contents
    },

    createNode (fileInfo) {
      let nodeKey = fileInfo.rootDir
      if (nodeKey.charAt(nodeKey.length - 1) !== path.sep) {
        nodeKey += path.sep
      }
      if (fileInfo.fileName === path.sep) {
        fileInfo.fileName = nodeKey
      }
      else {
        nodeKey += fileInfo.fileName
      }
      // get file mime type
      const mimeType = mime.lookup(nodeKey)
      // create object
      return {
        label: fileInfo.fileName,
        nodeKey: nodeKey,
        expandable: fileInfo.isDir,
        tickable: true,
        lazy: true,
        children: [],
        data: {
          rootDir: fileInfo.rootDir,
          isDir: fileInfo.isDir,
          mimeType: mimeType,
          stat: fileInfo.stat
        }
      }
    },

    folderWatcherHandler (newFolder, oldFolder) {
      if (oldFolder && this.watcher) {
        this.watcher.close()
      }
      if (newFolder) {
        // let backend know to statically serve files from this folder
        ipcRenderer.send('folder', newFolder)

        this.watcher = chokidar.watch(newFolder, {
          depth: 0,
          ignorePermissionErrors: true
        })
        if (this.watcher) {
          this.watcher.on('ready', () => { // initial scan done
            // watch for additions
            this.watcher.on('raw', (event, path, details) => {
              this.$root.$emit('rescan-current-folder')
            })
          })
          this.watcher.on('error', (error) => { // initial scan done
            console.error(error)
          })
        }
      }
    }
  }
}
</script>

<style>
.breadcrumbs {
  width: calc(100% - 150px);
  height: 20px;
  margin-left: 5px;
  background-color: rgba(0, 0, 0, .3);
  border-radius: 4px;
}

.breadcrumb {
  cursor: pointer;
}

.breadcrumb:hover {
  text-decoration: underline;
}

.border {
  border-style: solid;
  border-radius: 2px;
  border-width: 1px;
  border-color: rgb(158, 158, 158);
  background-color: rgba(158, 158, 158, 0.1);
}

.q-layout-drawer {
  height: calc(100vh - 50px) !important;
}

.drawer-wrapper {
  position: relative;
  width: 100%;
  height: calc(100vh - 50px) !important;
}

.drawer-container {
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
}

</style>
