<template>
  <div v-if="contents && contents.length" class="contents-container">
    <div class="contents-wrapper">
      <div v-show="listType === 'grid'" class="row justify-left">
        <div v-for="node in contents" :key="node.nodeKey">
          <grid-item
            :node="node"
            :selectedNode="selectedNode"
            :viewType="viewType"
            @click="onClick"
            @dblClick="onDblClick"
            class="non-selectable"
          />
        </div>
      </div>
      <div v-show="listType === 'list'" id="content-scroll" style="min-height: 100%;">
        <q-table
          id="content"
          dense
          hide-bottom
          flat
          :data="contents"
          :columns="columns"
          row-key="label"
          :pagination.sync="pagination"
          separator="none"
          class="no-border-radius"
          style="min-height: 100%;"
        >
          <q-tr :id="props.row.nodeKey" slot="body" slot-scope="props" :props="props" @click.native.stop="rowClick(props.row)" @dblclick.native.stop="dblRowClick(props.row)" :style="selectedStyleObject(props.row)" class="non-selectable cursor-pointer">
            <q-td key="type" :props="props" :style="'width: ' + imageWidth + 'px;'">
              <img v-if="props.row.data.isDir" :size="imageWidth + 'px'" :width="imageWidth + 'px'" src="images/folder.png">
              <grid-item-image
                v-else
                :node="props.row"
                :width="imageWidth"
              />
            </q-td>
            <q-td key="label" :props="props">
              {{ props.row.label }}
            </q-td>
            <q-td key="size" :props="props">
              {{ getSize(props.row) }}
            </q-td>
            <q-td key="modified" :props="props">
              {{ getModified(props.row) }}
            </q-td>
          </q-tr>
        </q-table>
      </div>
    </div>
  </div>
</template>

<script>
const prettyBytes = require('pretty-bytes')
const moment = require('moment')

export default {
  name: 'Contents',

  props: {
    contents: {
      type: Array
      // required: true
    },
    listType: {
      type: String
      // required: true
    },
    viewType: {
      type: String
      // required: true
    }
  },

  components: {
    'grid-item': () => import('../components/gridItem'),
    'grid-item-image': () => import('../components/gridItemImage')
  },

  data () {
    return {
      imageWidth: 25,
      selectedNode: null,
      columns: [
        {
          name: 'type',
          required: true,
          label: '',
          field: 'label',
          align: 'center',
          sortable: false
        },
        {
          name: 'label',
          required: true,
          label: 'Name',
          field: 'label',
          align: 'left',
          sortable: true
        },
        {
          name: 'size',
          label: 'Size',
          field: (row) => row.data,
          format: this.getSize,
          align: 'left',
          sortable: true,
          sort: (a, b) => parseInt(a.stat.size) - parseInt(b.stat.size)
        },
        {
          name: 'modified',
          label: 'Modified',
          field: (row) => row.data,
          format: this.getModified,
          align: 'left',
          sortable: true,
          sort: (a, b) => parseFloat(a.stat.mtimeMs) - parseFloat(b.stat.mtimeMs)
        }
      ],
      pagination: {
        page: 1,
        rowsPerPage: 0,
        sortBy: 'name',
        descending: false
      }
    }
  },

  methods: {
    // when a node is single-clicked
    onClick (node) {
      this.selectedNode = node
      this.$emit('click', node)
    },

    // when a node is double-clicked
    onDblClick (node) {
      this.selectedNode = node
      // eslint-disable-next-line vue/custom-event-name-casing
      this.$emit('dblClick', node)
    },

    rowClick (node) {
      this.onClick(node)
    },

    dblRowClick (node) {
      this.onDblClick(node)
    },

    getSize (node) {
      if (node.data.isDir) {
        return ''
      }
      return prettyBytes(node.data.stat.size)
    },

    getModified (node) {
      if (node.data.isDir) {
        return ''
      }
      return moment.utc(node.data.stat.mtime).local().format('YYYY-DD-MM h:mm:ss a')
    },

    selectedStyleObject (node) {
      if (node === this.selectedNode) {
        return {
          backgroundColor: '#C0C0C0'
        }
      }
      else {
        return {
          backgroundColor: 'inherit'
        }
      }
    },

    getIcon (node) {
      return 'menu'
    }
  }
}
</script>

<style scoped>
.contents-container {
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  height: calc(100vh - 50px);
  overflow: auto;
}

.contents-wrapper {
  position: relative;
  width: 100%;
  height: calc(100vh - 50px);
}

#content .q-table-container {
    border-radius: 0 !important;
    -webkit-box-shadow: inherit !important;
    box-shadow: inherit !important;
    position: relative;
    min-height: 100vh;
}

#content-scroll >>> #content .q-table-container {
  box-shadow: none;
}

#content-scroll >>> #content .q-table-middle.scroll {
  overflow: auto;
}

#content-scroll >>> #content thead tr th {
  position: sticky;
  position: -webkit-sticky;
  background: lightgrey;
  top: 0px;
  z-index: 1
}

#content-scroll >>> #content .q-table table {
  display: block;
  width: 100%;
  min-width: 100%;
}

#content-scroll >>> #content .q-table thead,
#content-scroll >>> #content .q-table tr,
#content-scroll >>> #content .q-table th,
#content-scroll >>> #content .q-table td {
  height: 24px !important;
}

#content-scroll >>> #content .q-table thead,
#content-scroll >>> #content .q-table tr {
  width: 100% !important;
  display: inline-table !important;
}

#content-scroll >>> #content .q-table tbody {
  display: block;
  position: relative;
  overflow: auto;
  width: 100%;
  min-width: 100%;
  min-height: 200px;
  max-height: calc(100vh - 80px);
}

</style>
