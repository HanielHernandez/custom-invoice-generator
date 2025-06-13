import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '@/lib/firebase-auth'

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null)

    const setUser = (newuser: User | null) => {
        user.value = newuser
    }

    return { setUser, user }
})
