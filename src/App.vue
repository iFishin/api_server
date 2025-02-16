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
  height: 100vh;
  width: 100vw;
}

header {
  background-color: #f8f9fa;
}

.main-container {
  display: flex;
  flex: 1;
  overflow: hidden;
  background-color: #343a40;
}

aside {
  width: 15%;
  background-color: #343a40;
  color: white;
  padding: 1rem;
}

main {
  flex: 1;
  padding: 1rem;
  background-color: #ffffff;
  overflow-y: auto;
  height: 100%;
  border-radius: 8px; /* Add rounded corners */
}
</style>
