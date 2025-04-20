<!--
 * @Date: 2025-04-19
 * @LastEditors: Fishing
 * @LastEditTime: 2025-04-19
 * @FilePath: \Api_Server\src\App.vue
 * @Description: https://github.com/iFishin
-->
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
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8fafc;
  color: #1a202c;
}

header {
  background-color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
}

nav {
  width: 100%;
  max-width: 1800px;
  margin: 0 auto;
}

.main-container {
  margin-top: 60px;
  display: flex;
  flex: 1;
  width: 100%;
  overflow: auto;
  padding: 1.5rem;
  box-sizing: border-box;
}

aside {
  width: 240px;
  background-color: #ffffff;
  position: fixed;
  left: 0;
  top: 60px;
  bottom: 0;
  overflow-y: auto;
  border-right: 1px solid #e2e8f0;
  transition: transform 0.3s ease, width 0.3s ease;
  z-index: 900;
}

main {
  flex: 1;
  margin-left: 240px;
  padding: 1.5rem;
  background-color: #f8fafc;
  min-height: calc(100vh - 60px);
  transition: margin-left 0.3s ease, padding 0.3s ease;
  width: calc(100% - 240px);
  position: relative;
  z-index: 1;
  box-sizing: border-box;
  max-width: 1800px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  aside {
    width: 200px;
  }

  main {
    margin-left: 200px;
    width: calc(100% - 200px);
  }
}

@media (max-width: 768px) {
  header {
    padding: 0 1rem;
  }

  aside {
    transform: translateX(-100%);
    z-index: 900;
  }

  aside.active {
    transform: translateX(0);
  }

  main {
    margin-left: 0;
    padding: 1rem;
    width: 100%;
  }

  main.with-sidebar {
    margin-left: 240px;
    width: calc(100% - 240px);
  }
}

@media (max-width: 480px) {
  header {
    height: 50px;
  }

  .main-container {
    padding: 1rem;
  }

  aside {
    width: 180px;
  }

  main {
    margin-left: 0;
    padding: 0.5rem;
  }
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 全局过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 移除重复的导航样式，因为这些样式已经在各自的组件中定义 */
</style>
