// composables/useAuth.ts
import { ref, onUnmounted, computed } from 'vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import type { User } from '@/lib/firebase-auth'

const currentUser = ref<User | null>(null)

export function useAuth() {
    const auth = getAuth()

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
            await user.reload() // keep data fresh
            currentUser.value = user
        } else {
            currentUser.value = null
        }
    })

    onUnmounted(() => unsubscribe())

    return {
        currentUser,
        isAuthenticated: computed(() => currentUser.value !== null),
        isEmailVerified: computed(() => currentUser.value?.emailVerified ?? false)
    }
}
