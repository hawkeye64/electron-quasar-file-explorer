<template>
  <div class="square" :style="gridItemImageContainerStyleObject">
    <span class="img-helper"></span><img :src="getImage" :style="gridItemImageStyleObject">
  </div>
</template>

<script>
export default {
  name: 'GridItemImage',

  props: {
    node: {
      type: Object,
      required: true
    },
    width: {
      type: Number,
      required: true
    }
  },

  data () {
    return {
      basePath: 'statics/images/'
    }
  },

  computed: {
    gridItemImageContainerStyleObject: function () {
      return {
        height: this.width + 'px',
        width: this.width + 'px'
      }
    },

    gridItemImageStyleObject: function () {
      return {
        'max-height': this.width + 'px',
        'max-width': this.width + 'px',
        'vertical-align': 'middle'
      }
    },

    getImage: function () {
      // is this a folder?
      if (this.node.data.isDir) {
        return this.basePath + 'folder.png'
      }
      // mimeType can be false if it was not recognized
      else if (this.node.data.mimeType) {
        const type = this.node.data.mimeType.split('/')[0]
        // console.log('type:', type)
        if (type === 'text' ||
          this.node.data.mimeType === 'application/x-sql' ||
          this.node.data.mimeType === 'application/javascript' ||
          this.node.data.mimeType === 'application/json') {
          return this.basePath + 'text.png'
        }
        else if (this.node.data.mimeType === 'application/pdf') {
          return this.basePath + 'pdf.png'
        }
        else if (type === 'video') {
          return this.basePath + 'movie.png'
        }
        else if (type === 'application') {
          return this.basePath + 'binary.png'
        }
        else if (type === 'image') {
          return 'http://localhost:8000/file/' + this.node.label
        }
      }

      // for all "unrecongized" types
      return this.basePath + 'blank.png'
    }
  },

  mounted: function () {
    // console.log('GridItemImage:', this.node)
  }
}
</script>

<style>
.square {
  text-align: center;
}

.img-helper {
  display: inline-block;
  height: 100%;
  vertical-align: middle;
}
</style>
