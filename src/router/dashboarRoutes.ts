export const dashboardRoutes = [
    {
        path: 'users',
        name: 'users',
        component: () => import('../views/dashboard/UsersView.vue')
    },
    {
        path: 'company',
        name: 'company',
        component: () => import('../views/dashboard/CompanyView.vue')
    },
    {
        path: 'company',
        name: 'company',
        component: () => import('../views/dashboard/CompanyView.vue')
    }
]
