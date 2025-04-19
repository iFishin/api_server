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
    height: 100%;
    background-color: #ffffff;
    border-right: 1px solid #e2e8f0;
}

.sidebar-header {
    padding: 1.5rem;
    border-bottom: 1px solid #e2e8f0;
}

.sidebar-header h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #2d3748;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.sidebar-nav {
    padding: 1.5rem 0;
}

.sidebar-nav ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.sidebar-nav li {
    margin: 0.25rem 0;
}

.sidebar-nav a {
    display: flex;
    align-items: center;
    padding: 0.75rem 1.5rem;
    color: #4a5568;
    text-decoration: none;
    font-size: 0.95rem;
    transition: all 0.2s ease;
    position: relative;
}

.sidebar-nav a:hover {
    background-color: #f7fafc;
    color: #3498db;
}

.sidebar-nav a.router-link-active {
    background-color: #ebf8ff;
    color: #3498db;
    font-weight: 500;
}

.sidebar-nav i {
    margin-right: 1rem;
    font-size: 0.875rem;
    width: 1.25rem;
    text-align: center;
    color: #718096;
}

.sidebar-nav a:hover i,
.sidebar-nav a.router-link-active i {
    color: #3498db;
}

/* 添加一个微妙的悬停效果 */
.sidebar-nav a::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background-color: #3498db;
    transform: scaleY(0);
    transition: transform 0.2s ease;
}

.sidebar-nav a:hover::before,
.sidebar-nav a.router-link-active::before {
    transform: scaleY(1);
}
</style>
