import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/auth',
      component: HomeView
    },
    {
      path: '/auth',
      name: 'auth',
      redirect: { name: 'signin' },
      component: () => import('../views/auth/IndexView.vue'),
      children: [
        {
          path: '/signin',
          name: 'signin',
          component: () => import('../views/auth/SingInView.vue')
        }
      ]
    },

    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    }
  ]
})

export default router
