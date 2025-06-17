import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '@/lib/firebase-auth'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null)

    const setUser = (newuser: User | null) => {
        user.value = newuser
    }

    const logout = async () => {
        try {
            await signOut(auth)
        } catch (e) {
            console.error(e)
        }
    }

    return { setUser, user, logout }
})
