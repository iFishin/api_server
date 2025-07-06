<template>
  <div class="users-api-view">
    <EmptyPage 
      icon="fas fa-users"
      title="用户 API 文档"
      description="这里是用户 API 的相关文档内容。"
      coming-soon="文档正在完善中，敬请期待！"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useStore } from 'vuex'
import EmptyPage from '../components/pages/emptyPage.vue'

const store = useStore()

onMounted(() => {
  store.dispatch('updatePageTitle', 'Users')
})
</script>

<style scoped>
.users-api-view {
  padding: 0 1rem;
}
</style>