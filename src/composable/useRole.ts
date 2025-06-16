import { auth } from '@/lib/firebase'
import { onMounted, ref } from 'vue'

export type Role = 'admin' | 'editor' | 'any'
export function useRole() {
    const role = ref<Role | null>(null)

    onMounted(async () => {
        if (auth.currentUser === null) return

        const tokenRessult = await auth.currentUser.getIdTokenResult()

        role.value = ((await tokenRessult.claims.role) as Role) || null
    })

    return {
        role
    }
}
