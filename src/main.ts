import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './lib/firebase'

let app

onAuthStateChanged(auth, (user) => {
  if (!app) {
    const app = createApp(App)

    app.use(createPinia())
    app.use(router)

    app.mount('#app')
  }

  if (user) {
    console.log('User is logged in:', user.email)
    // You can update a global store here if needed
  } else {
    console.log('User is logged out')
  }
})
