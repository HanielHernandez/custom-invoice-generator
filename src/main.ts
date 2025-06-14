import './assets/main.css'

import { createApp, type App as VueApp } from 'vue'
import { createPinia } from 'pinia'

import router from './router'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './lib/firebase'
import { useAuthStore } from './stores/authStore'
import InstantSearch from 'vue-instantsearch/vue3/es'
import App from './App.vue'

let app: VueApp | null = null

onAuthStateChanged(auth, (user) => {
    if (!app) {
        app = createApp(App)

        app.use(createPinia())
        app.use(InstantSearch)
        app.use(router)
        app.mount('#app')
    }

    if (user) {
        console.log('User is logged in:', user.email)
        const authStore = useAuthStore()
        authStore.setUser(user)
        // You can update a global store here if needed
    } else {
        console.log('User is logged out')
    }
})
