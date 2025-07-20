<template>
  <div id="app">
    <header>
      <nav>
        <HeaderNavBar />
      </nav>
    </header>
    <div class="main-container">
      <aside v-if="showAside">
        <SideNavBar />
      </aside>
      <main>
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import HeaderNavBar from './components/HeaderNavBar.vue';
import SideNavBar from './components/SideNavBar.vue';
import { useRoute } from 'vue-router';
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue';

const route = useRoute();

// 路由配置 - 定义哪些页面需要显示侧边栏和API文档
const routeConfig = {
  sidebar: ['users', 'mqtt', 'tcp_udp', 'toolkit', 'webdav']
};

const showAside = computed(() => {
  const currentRoute = route.path.replace(/^\//, '').toLowerCase();
  return routeConfig.sidebar.includes(currentRoute);
});

</script>

<style>
#app {
  height: 100vh;
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  color: #22223b;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', 'PingFang SC', 'Hiragino Sans', Arial, sans-serif;
}

header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(30, 41, 59, 0.07);
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 2rem;
  z-index: 100;
  position: sticky;
  top: 0;
}

nav {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
}

.main-container {
  display: flex;
  flex: 1 1 0;
  width: 100%;
  min-width: 0;
  margin: 0 auto;
  box-sizing: border-box;
  padding: 0 0;
  gap: 0rem;
  min-height: 0;
  flex-grow: 1;
  align-items: stretch;
  justify-content: space-between;
  transition: all 0.2s;
  height: 0;
  flex: 1 1 auto;
  overflow: hidden;
}

aside {
  width: 20%;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(30, 41, 59, 0.06);
  border: 1px solid #e2e8f0;
  overflow-y: auto;
  flex-shrink: 0;
  min-height: 0;
  transition: box-shadow 0.2s, width 0.2s;
}

aside:hover {
  box-shadow: 0 4px 18px rgba(30, 41, 59, 0.10);
}

main {
  flex: 1 1 0;
  padding: 0;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(30, 41, 59, 0.08);
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;
  border: 1px solid #e2e8f0;
  word-wrap: break-word;
  overflow: hidden; /* 改为 hidden 避免不必要的滚动条 */
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  transition: padding 0.2s, border-radius 0.2s, box-shadow 0.2s;
}

/* Always apply bg-pattern to main */
main::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(34, 197, 94, 0.06) 0%, transparent 50%);
  background-size: 100px 100px;
  animation: patternFloat 20s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

/* Ensure content is above background pattern */
main > * {
  position: relative;
  z-index: 1;
}

@keyframes patternFloat {
  0%, 100% { 
    transform: translateY(0) rotate(0deg); 
  }
  50% { 
    transform: translateY(-10px) rotate(2deg); 
  }
}

.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(34, 197, 94, 0.06) 0%, transparent 50%);
  background-size: 100px 100px;
  animation: patternFloat 20s ease-in-out infinite;
}


/* 平板适配 */
@media (max-width: 1200px) {
  .main-container {
    gap: 1rem;
    padding: 1rem 0;
    max-width: 100vw;
  }
  aside {
    width: 160px;
  }
  main {
    padding: 1.2rem;
    border-radius: 12px;
    max-width: 98vw;
  }
}

/* 手机和平板竖屏适配 */
@media (max-width: 900px) {
  .main-container {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem;
    max-width: 100vw;
    align-items: stretch;
  }
  aside {
    display: none !important;
  }
  main {
    padding: 1rem;
    border-radius: 10px;
    min-height: 180px;
    max-width: 100vw;
    margin: 0;
  }
}

/* 小屏手机适配 */
@media (max-width: 600px) {
  header {
    height: 44px;
    padding: 0 0.3rem;
  }
  .main-container {
    padding: 0.1rem;
    gap: 0.2rem;
  }
  main {
    border-radius: 6px;
    padding: 0.5rem;
    min-height: 100px;
    font-size: 0.98em;
    max-width: 100vw;
  }
}

/* 超小屏适配 */
@media (max-width: 400px) {
  main {
    padding: 0.2rem !important;
    font-size: 0.92em;
    border-radius: 3px;
  }
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 全局过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s cubic-bezier(.4,0,.2,1);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>