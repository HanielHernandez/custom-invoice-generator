import { auth } from '@/lib/firebase'
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

    console.log(to.fullPath, requiresAuth, currentUser)

    // ⛔ Not authenticated but trying to access a protected route
    if (requiresAuth && !currentUser) {
        return next('auth/signin') // redirect to login
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
