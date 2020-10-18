<template>
  <q-expansion-item
    v-model="expanded"
    icon="bookmarks"
    label="Shortcuts"
  >
    <q-separator />
    <q-item clickable v-ripple @click.native="onHome">
      <q-item-section avatar>
        <q-icon name="home" />
      </q-item-section>
      <q-item-section>Home</q-item-section>
    </q-item>
    <q-item clickable v-ripple @click.native="onDesktop">
      <q-item-section avatar>
        <q-icon name="desktop_windows" />
      </q-item-section>
      <q-item-section>Desktop</q-item-section>
    </q-item>
    <q-item clickable v-ripple @click.native="onDocuments">
      <q-item-section avatar>
        <q-icon name="folder" />
      </q-item-section>
      <q-item-section>Documents</q-item-section>
    </q-item>
    <q-item clickable v-ripple @click.native="onDownloads">
      <q-item-section avatar>
        <q-icon name="vertical_align_bottom" />
      </q-item-section>
      <q-item-section>Downloads</q-item-section>
    </q-item>
    <q-item clickable v-ripple @click.native="onPictures">
      <q-item-section avatar>
        <q-icon name="image" />
      </q-item-section>
      <q-item-section>Pictures</q-item-section>
    </q-item>
    <q-item clickable v-ripple @click.native="onMusic">
      <q-item-section avatar>
        <q-icon name="music_note" />
      </q-item-section>
      <q-item-section>Music</q-item-section>
    </q-item>
    <q-item clickable v-ripple @click.native="onMovies">
      <q-item-section avatar>
        <q-icon name="local_movies" />
      </q-item-section>
      <q-item-section>Movies</q-item-section>
    </q-item>
  </q-expansion-item>
</template>

<script>
export default {
  name: 'Shortcuts',

  data () {
    return {
      expanded: true
    }
  },

  methods: {
    onHome () {
      this.$emit('selected', 'home')
    },
    onDesktop () {
      this.$emit('selected', 'desktop')
    },
    onDocuments () {
      this.$emit('selected', 'documents')
    },
    onDownloads () {
      this.$emit('selected', 'downloads')
    },
    onPictures () {
      this.$emit('selected', 'pictures')
    },
    onMusic () {
      this.$emit('selected', 'music')
    },
    onMovies () {
      this.$emit('selected', 'videos')
    }
  }
}
</script>

<style>
</style>
