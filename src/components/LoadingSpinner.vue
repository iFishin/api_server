<template>
  <span class="loading-spinner"></span>
</template>

<script setup lang="ts"></script>

<style scoped>
.loading-spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  vertical-align: middle;
}
@keyframes spin {
  0% { transform: rotate(0deg);}
  100% { transform: rotate(360deg);}
}
</style>