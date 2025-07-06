import './assets/main.css'
// FontAwesome 图标库
import '@fortawesome/fontawesome-free/css/fontawesome.css'
import '@fortawesome/fontawesome-free/css/solid.css'
import '@fortawesome/fontawesome-free/css/brands.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'

// 配置 axios 默认值
// 在开发环境下，如果没有设置 VITE_API_BASE_URL，使用空字符串让代理处理
// 在生产环境下，使用完整的 API 地址
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '' : 'http://localhost:3000')

const app = createApp(App)

app.use(router)
app.use(store)

app.mount('#app')
