export const dashboardRoutes = [
    {
        path: 'users',
        name: 'users',
        component: () => import('../views/dashboard/UsersView.vue')
    },
    {
        path: '',
        name: 'invoices',
        component: () => import('../views/dashboard/InvoicesView.vue')
    },
    {
        path: 'company',
        name: 'company',
        component: () => import('../views/dashboard/CompanyView.vue')
    }
]
