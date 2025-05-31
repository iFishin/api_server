import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import UsersApiView from '../views/UsersApiView.vue'
import HttpApiView from '../views/HttpApiView.vue'
import TcpUdpApiView from '../views/TcpUdpApiView.vue'
import MqttApiView from '../views/MqttApiView.vue'
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
      path: '/users',
      name: 'users',
      component: UsersApiView,
      meta: {
        title: '用户管理 API'
      }
    },
    {
      path: '/http',
      name: 'http',
      component: HttpApiView,
      meta: {
        title: 'HTTP API'
      }
    },
    {
      path: '/tcp_udp',
      name: 'tcp_udp',
      component: TcpUdpApiView,
      meta: {
        title: 'TCP/UDP API'
      }
    },
    {
      path: '/mqtt',
      name: 'mqtt',
      component: MqttApiView,
      meta: {
        title: 'MQTT API'
      }
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
