<template>
  <div class="griditemcontainer" :style="gridItemContainerStyleObject" @dblclick.prevent="onDblClick" @click="onClick">
    <div class="griditemimage" :style="gridItemImageStyleObject">
      <img v-if="node.data.isDir" :size="width + 'px'" :width="width + 'px'" src="images/folder.png">
      <grid-item-image
        v-else
        :node="node"
        :width="width"
      />
    </div>
    <div class="griditemtext" :style="gridItemTextStyleObject">{{ node.label }}</div>
  </div>
</template>

<script>
export default {
  name: 'GridItem',

  components: {
    'grid-item-image': () => import('./gridItemImage')
  },

  props: {
    node: {
      // type: Object,
      required: true
    },
    selectedNode: {
      // type: Object,
      required: true
    },
    viewType: {
      type: String
      // required: true
    }
  },

  data () {
    return {
      width: 75,
      fontSize: 12,
      delay: 200,
      timer: null
    }
  },

  computed: {
    gridItemContainerStyleObject () {
      if (this.node === this.selectedNode) {
        // current node is selected
        return {
          backgroundColor: '#C0C0C0',
          width: this.width + 'px'
        }
      }
      else {
        return {
          backgroundColor: 'inherit',
          width: this.width + 'px'
        }
      }
    },

    gridItemImageStyleObject () {
      return {
        width: this.width + 'px',
        height: this.width + 'px'
      }
    },

    gridItemTextStyleObject () {
      return {
        fontSize: this.fontSize + 'px'
      }
    }
  },

  watch: {
    viewType () {
      if (this.viewType === 'nodes' && (this.node === this.selectedNode)) {
        this.$el.scrollIntoView()
      }
    }
  },

  methods: {
    onClick () {
      if (this.timer) {
        return
      }

      // emit the click
      this.$emit('click', this.node)

      // prevent multiple single-clicks
      this.timer = setTimeout(() => {
        clearTimeout(this.timer)
      }, this.delay)
    },

    onDblClick () {
      if (this.timer) {
        clearTimeout(this.timer)
      }
      // eslint-disable-next-line vue/custom-event-name-casing
      this.$emit('dblClick', this.node)
    }
  }
}
</script>

<style scoped>
.selected {
  background-color: '#C0C0C0';
}
.griditemcontainer {
  margin: 5px;
  height: auto;
  word-wrap: break-word;
  border-radius: 4px;
  -webkit-transition: 'all 0.5s ease-in-out';
  transition: 'all 0.5s ease-in-out';
}
.griditemcontainer:hover {
  background-color: rgba(0, 0, 0, .05);
  box-shadow: 0 1px 5px rgba(0,0,0,0.2), 0 2px 2px rgba(0,0,0,0.14), 0 3px 1px -2px rgba(0,0,0,0.12);
  -webkit-transition: 'all 0.5s ease-in-out';
  transition: 'all 0.5s ease-in-out';
}
.griditemimage {
  display:flex;
  align-items:center;
  justify-content:center;
}
.griditemimage:hover {
  -webkit-filter: brightness(108%);
  filter: brightness(108%);
}
.griditemtext {
  text-align: center;
  word-wrap: break-word;
}
</style>
