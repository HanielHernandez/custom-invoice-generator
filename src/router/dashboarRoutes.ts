export const dashboardRoutes = [
    {
        path: 'users',
        name: 'users',
        component: () => import('../views/dashboard/UsersView.vue'),
        meta: {
            requiresAuth: true,
            requiresRole: 'admin'
        }
    },
    {
        path: '',
        name: 'dashboard-home',
        redirect: '/dashboard/invoices',
        meta: {
            requiresAuth: true
        }
    },

    {
        path: 'invoices',
        name: 'invoices',
        component: () => import('../views/dashboard/InvoicesView.vue'),
        meta: {
            requiresAuth: true
        },
        children: [
            {
                path: 'new',
                name: 'new Invoice',
                component: () => import('../views/dashboard/invoices/CreateInvoiceView.vue'),
                meta: {
                    requiresAuth: true
                }
            },

            {
                path: '',
                name: 'invoices-list',
                component: () => import('../views/dashboard/invoices/InvoicesList.vue'),
                meta: {
                    requiresAuth: true
                }
            },
            {
                path: ':id/edit',
                name: 'edit-invoice',
                component: () => import('../views/dashboard/invoices/EditInvoiceView.vue'),
                meta: {
                    requiresAuth: true
                }
            },
            {
                path: ':id/print',
                name: 'print-invoice',
                component: () => import('../views/dashboard/invoices/PrintInvoiceView.vue'),
                meta: {
                    requiresAuth: true
                }
            }
        ]
    },
    {
        path: 'company',
        name: 'company',
        component: () => import('../views/dashboard/CompanyView.vue'),
        meta: {
            requiresAuth: true
        }
    }
]
