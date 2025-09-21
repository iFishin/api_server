import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import UsersApiView from '../views/UsersApiView.vue'
import HttpApiView from '../views/HttpApiView.vue'
import TcpUdpApiView from '../views/TcpUdpApiView.vue'
import MqttApiView from '../views/MqttApiView.vue'
import ToolKitView from '../views/ToolKitView.vue'
import WebDAVView from '../views/WebDAVView.vue'
import InfiniteNavView from '../views/InfiniteNavView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/infinite-nav',
      name: 'infinite-nav',
      component: InfiniteNavView,
      meta: {
        title: '无界导航'
      }
    },
    {
      path: '/users-api',
      name: 'users',
      component: UsersApiView,
      meta: {
        title: '用户管理 API'
      }
    },
    {
      path: '/http-api',
      name: 'http',
      component: HttpApiView,
      meta: {
        title: 'HTTP API'
      }
    },
    {
      path: '/tcp-udp-api',
      name: 'tcp_udp',
      component: TcpUdpApiView,
      meta: {
        title: 'TCP/UDP API'
      }
    },
    {
      path: '/mqtt-api',
      name: 'mqtt',
      component: MqttApiView,
      meta: {
        title: 'MQTT API'
      }
    },
    {
      path: "/toolkit",
      name: "toolkit",
      component: ToolKitView,
      meta: {
        title: 'ToolKit'
      }
    },
    {
      path: '/webdav',
      name: 'webdav',
      component: WebDAVView,
      meta: {
        title: 'WebDAV 文件服务器'
      }
    }
  ],
})

export default router
