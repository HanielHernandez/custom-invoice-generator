export const dashboardRoutes = [
    {
        path: 'users',
        name: 'users',
        component: () => import('../views/dashboard/UsersView.vue')
    },
    {
        path: '',
        redirect: '/dashboard/invoices'
    },

    {
        path: 'invoices',
        name: 'invoices',
        component: () => import('../views/dashboard/InvoicesView.vue'),
        children: [
            {
                path: '',
                name: 'invoices-list',
                component: () => import('../views/dashboard/invoices/InvoicesList.vue')
            },
            {
                path: ':id/edit',
                name: 'edit-invoice',
                component: () => import('../views/dashboard/invoices/EditInvoiceView.vue')
            },
            {
                path: ':id/print',
                name: 'edit-invoice',
                component: () => import('../views/dashboard/invoices/PrintInvoiceView.vue')
            }
        ]
    },
    {
        path: 'company',
        name: 'company',
        component: () => import('../views/dashboard/CompanyView.vue')
    }
]
