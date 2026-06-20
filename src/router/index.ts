import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import UsersApiView from '../views/UsersApiView.vue'
import HttpApiView from '../views/HttpApiView.vue'
import TcpUdpApiView from '../views/TcpUdpApiView.vue'
import MqttApiView from '../views/MqttApiView.vue'
import ToolKitView from '../views/ToolKitView.vue'
import WebDAVView from '../views/WebDAVView.vue'
import InfiniteNavView from '../views/InfiniteNavView.vue'
import MessageBoardView from '../views/MessageBoardView.vue'
import ExternalServicesDemo from '../views/ExternalServicesDemo.vue'
import { getServiceByPath, getServiceUrl } from '@/config/external-services'

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
    },
    {
      path: '/message-board',
      name: 'message-board',
      component: MessageBoardView,
      meta: {
        title: '云端留言板'
      }
    },
    {
      path: '/external-services-demo',
      name: 'external-services-demo',
      component: ExternalServicesDemo,
      meta: {
        title: '外部服务重定向演示'
      }
    }
  ],
})

// 导航守卫 - 处理外部服务重定向
router.beforeEach((to, from, next) => {
  console.log('🔍 路由导航:', {
    path: to.path,
    fullPath: to.fullPath,
    from: from.path
  })
  
  // 检查是否匹配外部服务路径
  const serviceInfo = getServiceByPath(to.path)
  
  console.log('🔍 服务匹配结果:', serviceInfo)
  
  if (serviceInfo) {
    const { path, service } = serviceInfo
    
    // 构建重定向 URL
    const targetUrl = getServiceUrl(path, to.fullPath)
    
    console.log('🔀 准备重定向:', {
      service: service.name,
      targetUrl: targetUrl
    })
    
    if (targetUrl) {
      console.log(`🚀 立即重定向到: ${targetUrl}`)
      
      // 立即重定向
      window.location.replace(targetUrl)
      
      // 阻止 Vue Router 继续导航
      return false
    }
  }
  
  console.log('✅ 正常路由，继续导航')
  
  // 不是外部服务，正常路由
  next()
})

export default router
