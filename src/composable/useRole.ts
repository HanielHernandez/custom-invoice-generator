import { auth, db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { onMounted, ref } from 'vue'

export type Role = 'admin' | 'editor' | 'any'

const isRole = (value: unknown): value is Role =>
    value === 'admin' || value === 'editor' || value === 'any'

export function useRole() {
    const role = ref<Role | null>(null)
    const loading = ref(true)

    onMounted(async () => {
        const user = auth.currentUser
        if (!user) {
            loading.value = false
            return
        }

        try {
            const tokenResult = await user.getIdTokenResult()
            const claimRole = tokenResult.claims.role

            if (isRole(claimRole) && claimRole !== 'any') {
                role.value = claimRole
                return
            }

            // Signup users store role on the profile (claims are set only via Admin SDK).
            const profileSnap = await getDoc(doc(db, 'profiles', user.uid))
            const profileRole = profileSnap.exists() ? profileSnap.data()?.role : null

            if (isRole(profileRole) && profileRole !== 'any') {
                role.value = profileRole
                return
            }

            // New customer accounts default to editor.
            role.value = 'editor'
        } catch (e) {
            console.error('Error resolving user role:', e)
            role.value = 'editor'
        } finally {
            loading.value = false
        }
    })

    return {
        role,
        loading
    }
}
