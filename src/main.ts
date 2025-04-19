import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'

// 配置 axios 默认值
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const app = createApp(App)

app.use(router)
app.use(store)

app.mount('#app')
