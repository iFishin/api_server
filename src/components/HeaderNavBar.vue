<template>
    <nav class="navbar">
        <div class="navbar-brand">
            <router-link to="/">
                <IconApi />
                Api_Server
            </router-link>
        </div>
        <ul class="navbar-menu">
            <li v-for="(item, index) in menuItems" :key="index">
                <router-link :to="'/' + item.toLowerCase()">{{ item }}</router-link>
            </li>
            <li class="nav-item">
                <RouterLink to="/webdav-ui" class="nav-link">
                    <i class="fas fa-cloud"></i> <!-- 或其他合适的图标 -->
                    <span>WebDAV 文件服务器</span>
                </RouterLink>
            </li>
        </ul>
    </nav>
</template>

<script lang="ts">
import { defineComponent, onMounted, watch, ref } from 'vue';
import IconApi from '../components/icons/IconApi.vue'
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';

export default defineComponent({
    name: 'HeaderNavBar',
    components: {
        IconApi
    },
    setup() {
        const store = useStore();
        const route = useRoute();
        const menuItems = ref<string[]>([]);

        onMounted(() => {

            const apiConfig = store.state.apiConfig;

            if (apiConfig) {
                menuItems.value = Object.keys(apiConfig);
            }
        });

        const updateTitle = (title: string) => {
            store.commit('setCurrentPageTitle', title.substring(1));
        };

        watch(
            () => route.path,
            (newPath) => {
                updateTitle(newPath);
            }
        );

        return {
            menuItems,
            updateTitle
        };
    }
});
</script>

<style scoped>
:deep(svg) {
    margin-right: 12px;
    width: 24px;
    height: 24px;
    vertical-align: middle;
    color: #3498db;
}

.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
}

.navbar-brand a {
    color: #2c3e50;
    font-size: 1.25rem;
    text-decoration: none;
    font-weight: 600;
    display: flex;
    align-items: center;
    transition: color 0.2s ease;
}

.navbar-brand a:hover {
    color: #3498db;
}

.navbar-menu {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: 2rem;
}

.navbar-menu li a {
    color: #4a5568;
    text-decoration: none;
    font-size: 0.95rem;
    font-weight: 500;
    padding: 0.5rem 0;
    position: relative;
    transition: color 0.2s ease;
}

.navbar-menu li a::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background-color: #3498db;
    transition: width 0.2s ease;
}

.navbar-menu li a:hover {
    color: #3498db;
}

.navbar-menu li a:hover::after {
    width: 100%;
}

.navbar-menu li a.router-link-active {
    color: #3498db;
}

.navbar-menu li a.router-link-active::after {
    width: 100%;
}
</style>
