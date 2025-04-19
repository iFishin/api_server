import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import WebDAVView from '../views/WebDAVView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/webdav-ui',
      name: 'webdav',
      component: WebDAVView,
      meta: {
        title: 'WebDAV 文件服务器'
      }
    }
  ],
})

export default router
