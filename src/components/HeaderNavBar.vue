<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <router-link to="/">
        <IconApi />
        Api_Server
      </router-link>
    </div>
    <button class="navbar-toggle" @click="toggleMenu" aria-label="Toggle navigation">
      <span :class="{ open: menuOpen }"></span>
      <span :class="{ open: menuOpen }"></span>
      <span :class="{ open: menuOpen }"></span>
    </button>
    <ul class="navbar-menu" :class="{ open: menuOpen }">
      <li class="nav-item">
        <router-link to="/" class="nav-link">
          <i class="fas fa-home"></i>
          <span>Home</span>
        </router-link>
      </li>
      <li v-for="(item, index) in menuItems" :key="index" class="nav-item">
        <router-link :to="'/' + item.toLowerCase()" class="nav-link">{{ item }}</router-link>
      </li>
      <li class="nav-item">
        <router-link to="/toolkit" class="nav-link">
          <i class="fas fa-cog"></i>
          <span>ToolKit</span>
          </router-link>
      </li>
      <li class="nav-item">
        <RouterLink to="/webdav" class="nav-link">
          <i class="fas fa-cloud"></i>
          <span>WebDAV File Server</span>
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
    const menuOpen = ref(false);

    menuItems.value = ['USERS-API', 'HTTP-API', 'TCP-UDP-API', 'MQTT-API'];
    console.log('HeaderNavBar menuItems initialized:', menuItems.value);

    onMounted(() => {
      const apiConfig = store.state.apiConfig;
      console.log('HeaderNavBar apiConfig from store:', apiConfig);
      if (apiConfig) {
        menuItems.value = Object.keys(apiConfig);
        console.log('HeaderNavBar menuItems updated from store:', menuItems.value);
      }
    });

    const updateTitle = (title: string) => {
      store.commit('setCurrentPageTitle', title.substring(1));
    };

    watch(
      () => route.path,
      (newPath) => {
        updateTitle(newPath);
        menuOpen.value = false; // 自动关闭菜单
      }
    );

    function toggleMenu() {
      menuOpen.value = !menuOpen.value;
    }

    return {
      menuItems,
      updateTitle,
      menuOpen,
      toggleMenu
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
  position: relative;
}

.navbar-brand {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
  display: flex;
  align-items: center;
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

.navbar-toggle {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 38px;
  height: 38px;
  background: none;
  border: none;
  cursor: pointer;
  margin-left: 1rem;
  z-index: 120;
}

.navbar-toggle span {
  display: block;
  width: 26px;
  height: 3px;
  margin: 4px 0;
  background: #3498db;
  border-radius: 2px;
  transition: all 0.3s;
}

.navbar-toggle span.open:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.navbar-toggle span.open:nth-child(2) {
  opacity: 0;
}

.navbar-toggle span.open:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

.navbar-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2rem;
  align-items: center;
  transition: all 0.3s;
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

/* 响应式：900px 以下为汉堡菜单 */
@media (max-width: 900px) {
  .navbar-menu {
    position: absolute;
    top: 100%;
    right: 0;
    left: 0;
    background: #fff;
    flex-direction: column;
    gap: 0;
    box-shadow: 0 4px 16px rgba(30, 41, 59, 0.08);
    border-radius: 0 0 10px 10px;
    padding: 0.5rem 0;
    z-index: 110;
    display: none;
  }

  .navbar-menu.open {
    display: flex;
  }

  .navbar-toggle {
    display: flex;
  }

  .navbar-menu li {
    width: 100%;
    text-align: center;
    margin: 0.2em 0;
  }

  .navbar-menu li a {
    display: block;
    width: 100%;
    padding: 0.8em 0;
    font-size: 1.1em;
  }
}
</style>