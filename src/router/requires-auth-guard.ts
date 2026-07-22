import { auth } from '@/lib/firebase'
import { useFlagsmith } from '@/composables/useFlagsmith'
import type {
    NavigationGuardNext,
    RouteLocationNormalized,
    RouteLocationNormalizedLoaded
} from 'vue-router'

const ensureFeatureFlag = async (
    flag: 'clients' | 'plans',
    currentUserEmail: string | null | undefined
) => {
    const { getFlagsmith, identify, clients, plans } = useFlagsmith()

    await getFlagsmith()

    if (currentUserEmail) {
        await identify(currentUserEmail)
    }

    return flag === 'clients' ? clients.value : plans.value
}

export const requiresAuthGuard = async (
    to: RouteLocationNormalized,
    _: RouteLocationNormalizedLoaded,
    next: NavigationGuardNext
) => {
    const currentUser = auth.currentUser || null
    const requiresAuth = to.meta.requiresAuth || false
    const requiredRole = to.meta.requiresRole || false
    const requiresClientsFlag = to.meta.requiresClientsFlag || false
    const requiresPlansFlag = to.meta.requiresPlansFlag || false

    console.log(to.fullPath, requiresAuth, currentUser)

    // ⛔ Not authenticated but trying to access a protected route
    if (requiresAuth && !currentUser) {
        return next('auth/signin') // redirect to login
    }

    if (requiresClientsFlag) {
        try {
            const enabled = await ensureFeatureFlag('clients', currentUser?.email)
            if (!enabled) {
                return next({ name: 'invoices' })
            }
        } catch (error) {
            console.error('Error checking clients flag:', error)
            return next({ name: 'invoices' })
        }
    }

    if (requiresPlansFlag) {
        try {
            const enabled = await ensureFeatureFlag('plans', currentUser?.email)
            if (!enabled) {
                return next({ name: 'invoices' })
            }
        } catch (error) {
            console.error('Error checking plans flag:', error)
            return next({ name: 'invoices' })
        }
    }

    // ✅ Authenticated but no role required
    if (!requiredRole) return next()

    try {
        // ⏬ Ensure token is fresh to get latest claims
        const tokenResult = await currentUser?.getIdTokenResult(true)
        const userRole = tokenResult?.claims?.role

        // ✅ If custom claim role matches
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
