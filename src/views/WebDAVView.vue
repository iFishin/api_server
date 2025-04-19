<template>
    <div class="webdav-view">
      <h1>WebDAV 文件服务器</h1>
      <WebDAVExplorer />
    </div>
  </template>
  
  <script setup lang="ts">
  import WebDAVExplorer from './WebDAVExplorer.vue';
  </script>
  
  <style scoped>
  .webdav-view {
    padding: 20px;
  }
  
  h1 {
    margin-bottom: 20px;
    color: #333;
  }
  </style>