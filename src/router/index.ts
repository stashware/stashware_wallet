import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Guide from '../views/Guide.vue'
import Home from '../views/home/Index.vue'
import Overview from '../views/home/Overview.vue'
import Transactions from '../views/home/Transactions.vue'
import Send from '../views/home/Send.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Guide',
    component: Guide
  }, {
    path: '/generate-wallet',
    name: 'generateWallet',
    component: () => import('@/views/GenerateWallet.vue')
  }, {
    path: '/import-wallet',
    name: 'importWallet',
    component: () => import('@/views/ImportWallet.vue')
  }, {
    path: '/home',
    name: 'home',
    component: Home,
    children: [
      {
        path: '',
        component: Overview,
      },
      {
        name: 'Overview',
        path: 'overview',
        component: Overview,
      }, {
        name: 'Send',
        path: 'send',
        component: Send,
      }, {
        name: "Transactions",
        path: 'transactions',
        component: Transactions
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

export default router
