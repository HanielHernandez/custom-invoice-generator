import { auth } from '@/lib/firebase'
import type {
    NavigationGuardNext,
    RouteLocationNormalized,
    RouteLocationNormalizedLoaded
} from 'vue-router'

export const requiresAuthGuard = (
    to: RouteLocationNormalized,
    _: RouteLocationNormalizedLoaded,
    next: NavigationGuardNext
) => {
    console.log(auth.currentUser)
    const user = auth.currentUser
    if (to.meta.requiresAuth && !user) {
        next('/auth/signin')
    } else {
        next()
    }
}
