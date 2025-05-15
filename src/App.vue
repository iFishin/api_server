<template>
  <div id="app">
    <header>
      <nav>
        <HeaderNavBar />
      </nav>
    </header>
    <div class="main-container">
      <aside>
        <SideNavBar />
      </aside>
      <main>
        <RouterView />
        <ApiDocViewer />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import HeaderNavBar from './components/HeaderNavBar.vue';
import SideNavBar from './components/SideNavBar.vue';
import ApiDocViewer from './components/ApiDocViewer.vue';
</script>

<style>
#app {
  height: 100vh;
  width: 100%;
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
  padding: 1rem 0;
  gap: 1rem;
  min-height: 0;
  flex-grow: 1;
  align-items: stretch;
}

aside {
  width: 260px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(30, 41, 59, 0.04);
  border: 1px solid #e2e8f0;
  overflow-y: auto;
  flex-shrink: 0;
  min-height: 0;
  transition: box-shadow 0.2s;
}

aside:hover {
  box-shadow: 0 4px 16px rgba(30, 41, 59, 0.08);
}

main {
  flex: 1 1 0;
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(30, 41, 59, 0.04);
  min-height: 400px; /* 新增：防止内容为空时塌陷 */
  box-sizing: border-box;
  position: relative;
  border: 1px solid #e2e8f0;
  overflow: auto; /* 新增：内容多时可滚动 */
  display: flex;
  flex-direction: column;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-container {
    gap: 1rem;
    padding: 1rem 0;
    max-width: 100vw;
  }
  aside {
    width: 200px;
  }
}

@media (max-width: 900px) {
  .main-container {
    flex-direction: column;
    gap: 1rem;
    padding: 0.5rem;
  }
  aside {
    width: 100%;
    min-height: 48px;
    max-height: 220px;
    border-radius: 8px;
    border-bottom: 1px solid #e2e8f0;
    border-right: none;
    margin-bottom: 0.5rem;
  }
  main {
    padding: 1rem;
    border-radius: 8px;
    min-height: 200px;
  }
}

@media (max-width: 600px) {
  header {
    height: 48px;
    padding: 0 0.5rem;
  }
  .main-container {
    padding: 0.25rem;
    gap: 0.5rem;
  }
  aside,
  main {
    border-radius: 4px;
    padding: 0.5rem;
  }
  main {
    padding: 0.5rem;
    min-height: 120px;
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
