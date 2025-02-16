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
        </ul>
    </nav>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, watch, ref, getCurrentInstance } from 'vue';
import IconApi from '@/components/icons/IconApi.vue';
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
            console.log(store.state.currentPageTitle);
        };

        watch(
            () => route.path,
            (newPath) => {
                updateTitle(newPath);
            }
        );
        console.log(menuItems);

        return {
            menuItems,
            updateTitle
        };
    }
});
</script>

<style scoped>
:deep(svg) {
    margin-right: 10px;
    width: 32px;
    height: 32px;
    vertical-align: middle;
}

.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    background-color: #343a40;
    color: white;
}

.navbar-brand a {
    color: white;
    font-size: 24px;
    text-decoration: none;
}

.navbar-menu {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    justify-content: center;
    flex-grow: 1;
}

.navbar-menu li {
    margin-left: 20px;
}

.navbar-menu li a {
    color: white;
    text-decoration: none;
    font-size: 18px;
}

.navbar-menu li a:hover {
    color: #007BFF;
}
</style>