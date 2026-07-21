import { auth } from '@/lib/firebase'
import type { User as FirebaseUser } from 'firebase/auth'
import { signOut } from 'firebase/auth'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
    const user = ref<FirebaseUser | null>(null)

    const setUser = (newUser: FirebaseUser | null) => {
        user.value = newUser
    }

    const logout = async () => {
        try {
            await signOut(auth)
            user.value = null
        } catch (e) {
            console.error(e)
        }
    }

    return { setUser, user, logout }
})
