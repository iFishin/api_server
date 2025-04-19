<template>
    <div class="sidebar" v-show="!isHomePage">
        <div class="sidebar-header">
            <h3>{{ currentPageTitle }}</h3>
        </div>
        <nav class="sidebar-nav">
            <ul>
                <li v-for="category in categories" :key="category.id">
                    <router-link :to="'/' + category.name.toLowerCase()">
                        <i class="fas fa-circle"></i>
                        <span>{{ category.name }}</span>
                    </router-link>
                </li>
                <li class="nav-item">
                    <RouterLink to="/webdav-ui" class="nav-link">
                        <i class="fas fa-cloud"></i> <!-- 或其他合适的图标 -->
                        <span>WebDAV 文件服务器</span>
                    </RouterLink>
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
            const pageTitle = store.state.currentPageTitle;
            return store.getters.getApisByType(pageTitle);
        });

        return {
            categories,
            currentPageTitle,
            isHomePage
        };
    }
});
</script>

<style scoped>
.sidebar {
    color: white;
    width: 240px;
    padding: 1.5rem;
    height: 100%;
    background-color: #2c3e50;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

.sidebar-header {
    padding: 1rem 0;
    text-align: left;
    border-bottom: 2px solid rgba(255, 255, 255, 0.2);
    margin-bottom: 1.5rem;
    text-align: center;
}

.sidebar-header h3 {
    margin: 0;
    font-size: 1.4em;
    font-weight: 600;
    letter-spacing: 0.5px;
}

.sidebar-nav ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.sidebar-nav li {
    margin: 0.5rem 0;
}

.sidebar-nav a {
    color: #ecf0f1;
    text-decoration: none;
    display: flex;
    align-items: center;
    padding: 0.8rem 1rem;
    border-radius: 6px;
    transition: all 0.2s ease;
    font-size: 0.95em;
}

.sidebar-nav a:hover {
    background-color: rgba(255, 255, 255, 0.15);
    transform: translateX(5px);
}

.sidebar-nav i {
    margin-right: 12px;
    font-size: 0.75em;
    opacity: 0.8;
}

.sidebar-nav a.router-link-active {
    background-color: rgba(255, 255, 255, 0.2);
    font-weight: 500;
}
</style>
