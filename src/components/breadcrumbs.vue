<template>
  <div class="breadcrumbs">
    <span v-for="object in toolbarLinks" :key="object.nodeKey" class="breadcrumb" @click="onFolderSelected(object)">{{object.label}}</span>
  </div>
</template>

<script>
const path = require('path')

export default {
  name: 'Breadcrumbs',

  props: {
    absolutePath: {
      type: String | null,
      required: true
    }

  },

  data () {
    return {
      toolbarLinks: [] // toolbar pathway (links to each folder in path)
    }
  },

  mounted: function () {
    if (this.absolutePath) {
      this.buildToolbarPath(this.absolutePath)
    }
  },

  watch: {
    absolutePath: function () {
      this.buildToolbarPath(this.absolutePath)
    }
  },

  methods: {
    onFolderSelected: function (node) {
      this.$emit('selected', node.nodeKey)
    },

    buildToolbarPath: function (absolutePath) {
      this.toolbarLinks.splice(0, this.toolbarLinks.length)
      let toolbarLinks = []
      let nodeKey = ''
      let parts = absolutePath.split(path.sep)
      if (parts.length > 1 && parts[parts.length - 1].trim() === '') {
        parts.pop()
      }
      for (let index = 0; index < parts.length; ++index) {
        let label = ''
        if (index === 0) {
          if (process.platform !== 'win32') {
            label += '(root)'
            nodeKey = path.sep
          }
          if (process.platform === 'win32') {
            nodeKey += parts[index] // + path.sep
            label += nodeKey
            if (parts.length === 1) {
              label += path.sep
            }
          }
        }
        else {
          if (nodeKey.charAt(nodeKey.length - 1) !== path.sep) {
            nodeKey += path.sep
            label += path.sep
          }
          nodeKey += parts[index]
          if (process.platform !== 'win32' && index === 1) {
            label += path.sep
          }
          label += parts[index]
        }

        let object = {
          nodeKey: nodeKey,
          label: label
        }
        toolbarLinks.push(object)
      }
      this.toolbarLinks.push(...toolbarLinks)
    }
  }
}
</script>

<style>
.breadcrumbs {
  width: 100%;
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
</style>
