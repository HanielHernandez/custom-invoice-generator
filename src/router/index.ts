import { createRouter, createWebHistory } from 'vue-router'
import { requiresAuthGuard } from './requires-auth-guard'
import { dashboardRoutes } from './dashboarRoutes'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            redirect: '/dashboard',
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/auth',
            name: 'auth',
            component: () => import('../views/auth/IndexView.vue'),
            children: [
                {
                    path: 'signin',
                    name: 'signin',
                    component: () => import('../views/auth/SingInView.vue')
                }
            ]
        },

        {
            path: '/dashboard',
            name: 'dashboard',
            component: () => import('../views/dashboard/DashboardView.vue'),
            meta: {
                requiresAuth: true
            },
            children: dashboardRoutes
        }
    ]
})

router.beforeEach(requiresAuthGuard)

export default router
