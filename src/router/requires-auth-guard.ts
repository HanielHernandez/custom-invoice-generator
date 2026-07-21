import { auth } from '@/lib/firebase'
import { useFlagsmith } from '@/composables/useFlagsmith'
import type {
    NavigationGuardNext,
    RouteLocationNormalized,
    RouteLocationNormalizedLoaded
} from 'vue-router'

export const requiresAuthGuard = async (
    to: RouteLocationNormalized,
    _: RouteLocationNormalizedLoaded,
    next: NavigationGuardNext
) => {
    const currentUser = auth.currentUser || null
    const requiresAuth = to.meta.requiresAuth || false
    const requiredRole = to.meta.requiresRole || false
    const requiresClientsFlag = to.meta.requiresClientsFlag || false

    console.log(to.fullPath, requiresAuth, currentUser)

    // ⛔ Not authenticated but trying to access a protected route
    if (requiresAuth && !currentUser) {
        return next('auth/signin') // redirect to login
    }

    if (requiresClientsFlag) {
        const { getFlagsmith, identify, clients } = useFlagsmith()

        try {
            await getFlagsmith()

            if (currentUser?.email) {
                await identify(currentUser.email)
            }

            if (!clients.value) {
                return next({ name: 'invoices' })
            }
        } catch (error) {
            console.error('Error checking clients flag:', error)
            return next({ name: 'invoices' })
        }
    }

    // ✅ Authenticated but no role required
    if (!requiredRole) return next()

    try {
        // ⏬ Ensure token is fresh to get latest claims
        const tokenResult = await currentUser?.getIdTokenResult(true)
        const userRole = tokenResult?.claims?.role

        // ✅ If role matches
        if (userRole === requiredRole) {
            return next()
        } else {
            // ⛔ Role mismatch
            return next({ name: 'home' }) // or show Access Denied page
        }
    } catch (error) {
        console.error('Error checking role:', error)
        return next({ name: 'home' })
    }
}
