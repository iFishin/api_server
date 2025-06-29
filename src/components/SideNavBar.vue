<template>
    <div class="sidebar" v-show="!isHomePage">
        <div class="sidebar-header">
            <h3>{{ currentPageTitle }}</h3>
        </div>
        <nav class="sidebar-nav">
            <ul>
                <li v-for="category in categories" :key="category.id">
                    <router-link 
                        :to="category.path || ('/' + category.name.toLowerCase())"
                        :class="{ 'active-link': isActiveLink(category.path || ('/' + category.name.toLowerCase())) }"
                        custom
                        v-slot="{ navigate }"
                    >
                        <a @click="navigate" class="nav-link">
                            <i :class="category.icon || 'fas fa-circle'"></i>
                            <span>{{ category.name }}</span>
                        </a>
                    </router-link>
                </li>
            </ul>
        </nav>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';

export default defineComponent({
    name: 'SideNavBar',
    setup() {
        const store = useStore();
        const route = useRoute();
        const currentPageTitle = computed(() => store.state.currentPageTitle);
        const isHomePage = computed(() => route.path === '/' || route.path === '/home');

        const categories = computed(() => {
            const currentRoute = route.path.replace(/^\//, '').toLowerCase();
            
            // 根据当前路由返回不同的分类
            switch (currentRoute) {
                case 'toolkit':
                    return [
                        { id: 'text', name: 'Text Tools', icon: 'fas fa-font', path: '/toolkit?category=text' },
                        { id: 'converter', name: 'Converters', icon: 'fas fa-exchange-alt', path: '/toolkit?category=converter' },
                        { id: 'generator', name: 'Generators', icon: 'fas fa-magic', path: '/toolkit?category=generator' },
                        { id: 'encoder', name: 'Encoders', icon: 'fas fa-lock', path: '/toolkit?category=encoder' },
                        { id: 'network', name: 'Network', icon: 'fas fa-network-wired', path: '/toolkit?category=network' },
                        { id: 'dev', name: 'Development', icon: 'fas fa-code', path: '/toolkit?category=dev' }
                    ];
                case 'http':
                    return store.state.httpCategories || [
                        { id: 'get', name: 'GET APIs', icon: 'fas fa-download', path: '/http?category=get' },
                        { id: 'post', name: 'POST APIs', icon: 'fas fa-upload', path: '/http?category=post' },
                        { id: 'put', name: 'PUT APIs', icon: 'fas fa-edit', path: '/http?category=put' },
                        { id: 'delete', name: 'DELETE APIs', icon: 'fas fa-trash', path: '/http?category=delete' }
                    ];
                case 'mqtt':
                    return store.state.mqttCategories || [
                        { id: 'publish', name: 'Publish', icon: 'fas fa-paper-plane', path: '/mqtt?category=publish' },
                        { id: 'subscribe', name: 'Subscribe', icon: 'fas fa-rss', path: '/mqtt?category=subscribe' },
                        { id: 'connection', name: 'Connection', icon: 'fas fa-plug', path: '/mqtt?category=connection' }
                    ];
                case 'tcp_udp':
                    return store.state.tcpUdpCategories || [
                        { id: 'tcp', name: 'TCP Services', icon: 'fas fa-network-wired', path: '/tcp_udp?category=tcp' },
                        { id: 'udp', name: 'UDP Services', icon: 'fas fa-broadcast-tower', path: '/tcp_udp?category=udp' }
                    ];
                case 'users':
                    return store.state.userCategories || [
                        { id: 'management', name: 'User Management', icon: 'fas fa-users-cog', path: '/users?category=management' },
                        { id: 'auth', name: 'Authentication', icon: 'fas fa-key', path: '/users?category=auth' },
                        { id: 'profile', name: 'Profile', icon: 'fas fa-user-circle', path: '/users?category=profile' }
                    ];
                case 'webdav':
                    return store.state.webdavCategories || [
                        { id: 'files', name: 'File Management', icon: 'fas fa-folder', path: '/webdav?category=files' },
                        { id: 'upload', name: 'Upload', icon: 'fas fa-cloud-upload-alt', path: '/webdav?category=upload' },
                        { id: 'download', name: 'Download', icon: 'fas fa-cloud-download-alt', path: '/webdav?category=download' }
                    ];
                default:
                    return store.state.categories || [];
            }
        });

        // 检查当前链接是否为活跃状态
        const isActiveLink = (categoryPath: string) => {
            const currentPath = route.path;
            const currentQuery = route.query.category;
            
            // 解析链接中的查询参数
            const [linkPath, linkQuery] = categoryPath.split('?');
            const linkCategory = linkQuery ? new URLSearchParams(linkQuery).get('category') : null;
            
            // 如果路径匹配且查询参数也匹配（或都没有查询参数）
            return currentPath === linkPath && currentQuery === linkCategory;
        };

        return {
            categories,
            currentPageTitle,
            isHomePage,
            isActiveLink
        };
    }
});
</script>

<style scoped>
.sidebar {
    height: 100%;
    background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
    border-right: 1px solid #e2e8f0;
    box-shadow: inset -1px 0 0 rgba(255, 255, 255, 0.1);
}

.sidebar-header {
    padding: 1.5rem;
    border-bottom: 1px solid #e2e8f0;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
}

.sidebar-header h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: #1e293b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}

.sidebar-nav {
    padding: 1rem 0;
}

.sidebar-nav ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.sidebar-nav li {
    margin: 0.125rem 0.75rem;
}

.nav-link {
    display: flex;
    align-items: center;
    padding: 0.875rem 1rem;
    color: #64748b;
    text-decoration: none;
    font-size: 0.925rem;
    font-weight: 500;
    border-radius: 8px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    cursor: pointer;
    border: 1px solid transparent;
}

.nav-link:hover {
    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
    color: #3b82f6;
    border-color: rgba(59, 130, 246, 0.2);
    transform: translateX(2px);
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

.active-link .nav-link {
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    color: #1d4ed8;
    border-color: rgba(29, 78, 216, 0.3);
    font-weight: 600;
    box-shadow: 0 2px 12px rgba(29, 78, 216, 0.15);
}

.nav-link i {
    margin-right: 0.875rem;
    font-size: 0.875rem;
    width: 1.25rem;
    text-align: center;
    color: #94a3b8;
    transition: all 0.2s ease;
}

.nav-link:hover i {
    color: #3b82f6;
    transform: scale(1.1);
}

.active-link .nav-link i {
    color: #1d4ed8;
    transform: scale(1.05);
}

.nav-link span {
    transition: all 0.2s ease;
}

.nav-link:hover span {
    font-weight: 600;
}

/* 添加微妙的活跃指示器 */
.active-link .nav-link::before {
    content: '';
    position: absolute;
    left: -0.75rem;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 60%;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    border-radius: 0 2px 2px 0;
    box-shadow: 0 0 8px rgba(59, 130, 246, 0.4);
}

/* 悬停时的微妙指示器 */
.nav-link:not(.active-link .nav-link):hover::after {
    content: '';
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 4px;
    background: #3b82f6;
    border-radius: 50%;
    opacity: 0.6;
}

/* 滚动条美化 */
.sidebar-nav {
    overflow-y: auto;
    max-height: calc(100vh - 120px);
}

.sidebar-nav::-webkit-scrollbar {
    width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
    background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.5);
    border-radius: 2px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
    background: rgba(100, 116, 139, 0.7);
}

/* 响应式设计 */
@media (max-width: 1200px) {
    .sidebar-header h3 {
        font-size: 1rem;
    }
    
    .nav-link {
        padding: 0.75rem 0.875rem;
        font-size: 0.9rem;
    }
    
    .nav-link i {
        margin-right: 0.75rem;
        width: 1rem;
    }
}

@media (max-width: 768px) {
    .sidebar {
        display: none;
    }
}
</style>
