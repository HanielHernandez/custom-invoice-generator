import { auth } from '@/lib/firebase'
import type { User as FirebaseUser } from 'firebase/auth'
import { signOut } from 'firebase/auth'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useClientsStore } from './clientsStore'
import { useCompanyStore } from './companyStore'
import { useProfileStore } from './profileStore'

export const useAuthStore = defineStore('auth', () => {
    const user = ref<FirebaseUser | null>(null)

    const setUser = (newUser: FirebaseUser | null) => {
        user.value = newUser
    }

    const clearSession = () => {
        user.value = null
        useProfileStore().reset()
        useCompanyStore().reset()
        useClientsStore().reset()
    }

    const logout = async () => {
        try {
            await signOut(auth)
            clearSession()
        } catch (e) {
            console.error(e)
        }
    }

    return { setUser, user, logout, clearSession }
})
