/**
 * THIS FILE IS GENERATED AUTOMATICALLY.
 * DO NOT EDIT.
 *
 * You are probably looking on adding initialization code.
 * Use "quasar new plugin <name>" and add it there.
 * One plugin per concern. Then reference the file(s) in quasar.conf.js > plugins:
 * plugins: ['file', ...] // do not add ".js" extension to it.
 **/
import './import-quasar.js'



import App from 'app/src/App.vue'


import createStore from 'app/src/store/index.js'

import createRouter from 'app/src/router/index.js'

export default function () {
  // create store and router instances
  
  const store = typeof createStore === 'function'
    ? createStore()
    : createStore
  
  const router = typeof createRouter === 'function'
    ? createRouter({store})
    : createRouter
  
  // make router instance available in store
  store.$router = router
  

  // Create the app instantiation Object.
  // Here we inject the router, store to all child components,
  // making them available everywhere as `this.$router` and `this.$store`.
  const app = {
    el: '#q-app',
    router,
    store,
    render: h => h(App)
  }

  

  // expose the app, the router and the store.
  // note we are not mounting the app here, since bootstrapping will be
  // different depending on whether we are in a browser or on the server.
  return {
    app,
    store,
    router
  }
}
