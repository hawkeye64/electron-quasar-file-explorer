<template>
  <div v-if="contents && contents.length">
    <div class="contents-container">
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
        <div v-show="listType === 'list'" style="min-height: 100%;">
          <q-table
            id="content"
            dense
            hide-bottom
            :data="contents"
            :columns="columns"
            row-key="label"
            :pagination.sync="pagination"
            separator="none"
            style="min-height: 100%;"
          >
            <q-tr :id="props.row.nodeKey" slot="body" slot-scope="props" :props="props" @click.native.stop="rowClick(props.row)" @dblclick.native.stop="dblRowClick(props.row)" :style="selectedStyleObject(props.row)" class="non-selectable cursor-pointer">
              <q-td key="type" :props="props" :style="'width: ' + imageWidth + 'px;'">
                <img v-if="props.row.data.isDir" :size="imageWidth + 'px'" :width="imageWidth + 'px'" src="statics/images/folder.png">
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
  </div>
</template>

<script>
const prettyBytes = require('pretty-bytes')
const moment = require('moment')

export default {
  name: 'Contents',

  props: {
    contents: {
      type: Array,
      required: true
    },
    listType: {
      type: String,
      required: true
    },
    viewType: {
      type: String,
      required: true
    }
  },

  components: {
    'grid-item': require('../components/gridItem').default,
    'grid-item-image': require('../components/gridItemImage').default
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

  watch: {
  },

  methods: {
    // when a node is single-clicked
    onClick: function (node) {
      this.selectedNode = node
      this.$emit('click', node)
    },

    // when a node is double-clicked
    onDblClick: function (node) {
      this.selectedNode = node
      this.$emit('dblClick', node)
    },

    rowClick: function (node) {
      this.onClick(node)
    },

    dblRowClick: function (node) {
      this.onDblClick(node)
    },

    getSize: function (node) {
      if (node.data.isDir) {
        return ''
      }
      return prettyBytes(node.data.stat.size)
    },

    getModified: function (node) {
      if (node.data.isDir) {
        return ''
      }
      return moment.utc(node.data.stat.mtime).local().format('YYYY-DD-MM h:mm:ss a')
    },

    selectedStyleObject: function (node) {
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

    getIcon: function (node) {
      return 'menu'
    }
  }
}
</script>

<style>
.contents-wrapper {
  position: relative;
  width: 100%;
  height: calc(100vh - 50px);
}

.contents-container {
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
}

#content .q-table-container {
    border-radius: 0 !important;
    -webkit-box-shadow: inherit !important;
    box-shadow: inherit !important;
    position: relative;
}
</style>
