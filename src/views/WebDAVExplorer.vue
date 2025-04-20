<!--
 * @Date: 2025-04-19
 * @LastEditors: Fishing
 * @LastEditTime: 2025-04-19
 * @FilePath: \Api_Server\src\views\WebDAVExplorer.vue
 * @Description: https://github.com/iFishin
-->
<template>
    <div class="webdav-explorer">
      <div class="header">
        <h1>WebDAV 文件浏览器</h1>
        <div class="actions">
          <input
            type="file"
            ref="fileInput"
            @change="handleFileSelected"
            multiple
            style="display: none"
          />
          <button @click="fileInput?.click()" class="btn">选择文件</button>
          <button 
            @click="uploadFiles" 
            :disabled="!selectedFiles.length"
            class="btn primary"
          >
            上传文件
          </button>
        </div>
      </div>
  
      <div v-if="uploadStatus" :class="['upload-status', uploadSuccess ? 'success' : 'error']">
        {{ uploadStatus }}
      </div>
  
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
  
      <div v-if="loading" class="loading">
        加载中...
      </div>
  
      <div v-else class="file-list">
        <div v-for="file in files" :key="file.name" class="file-item">
          <div class="file-info">
            <span class="file-name">{{ file.name }}</span>
            <span class="file-size">{{ formatSize(file.size) }}</span>
            <span class="file-date">{{ formatDate(file.modifiedAt) }}</span>
          </div>
          <div class="file-actions">
            <button @click="downloadFile(file)" class="btn">下载</button>
            <button @click="deleteFile(file)" class="btn danger">删除</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useStore } from 'vuex'
  import axios from 'axios'

  // 配置 axios 默认值
  axios.defaults.baseURL = 'http://localhost:3000'

  const store = useStore()

  interface FileItem {
    name: string;
    size: number;
    modifiedAt: string;
    isDirectory: boolean;
  }

  // 状态变量
  const files = ref<FileItem[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const selectedFiles = ref<File[]>([]);
  const fileInput = ref<HTMLInputElement | null>(null);
  const uploadStatus = ref<string>('');
  const uploadSuccess = ref<boolean>(false);

  // 页面加载时获取文件列表
  onMounted(() => {
    refreshFiles();
  });

  // 刷新文件列表
  async function refreshFiles() {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.get('/api/files');
      files.value = response.data;
    } catch (err) {
      error.value = (err as Error).message || '无法获取文件列表';
      console.error('获取文件列表错误:', err);
    } finally {
      loading.value = false;
    }
  }

  // 处理文件选择
  function handleFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    selectedFiles.value = Array.from(target.files || []);
  }

  // 上传文件
  async function uploadFiles() {
    if (!selectedFiles.value.length) return;
    
    uploadStatus.value = '上传中...';
    uploadSuccess.value = false;
    
    try {
      for (const file of selectedFiles.value) {
        const formData = new FormData();
        formData.append('file', file);
        
        await axios.post('/api/files/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      uploadStatus.value = `成功上传 ${selectedFiles.value.length} 个文件`;
      uploadSuccess.value = true;
    } catch (err) {
      uploadStatus.value = `上传失败: ${(err as Error).message || '未知错误'}`;
      uploadSuccess.value = false;
      console.error('文件上传错误:', err);
    } finally {
      if (fileInput.value) {
        fileInput.value.value = '';
      }
      selectedFiles.value = [];
      refreshFiles();
    }
  }

  // 删除文件
  async function deleteFile(file: FileItem) {
    if (!confirm(`确定要删除 "${file.name}" 吗?`)) return;

    try {
      await axios.delete(`/api/files/${encodeURIComponent(file.name)}`);
      refreshFiles();
    } catch (err) {
      alert(`删除失败: ${(err as Error).message || '未知错误'}`);
      console.error('删除文件错误:', err);
    }
  }

  // 下载文件
  function downloadFile(file: FileItem) {
    window.open(`http://localhost:3000/api/files/download/${encodeURIComponent(file.name)}`, '_blank');
  }

  // 格式化文件大小
  function formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
  }

  // 格式化日期
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  defineOptions({
    name: 'WebDAVExplorer'
  });
  </script>
  
  <style scoped>
  .webdav-explorer {
    padding: 20px;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .actions {
    display: flex;
    gap: 10px;
  }
  
  .btn {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    background-color: #f0f0f0;
    transition: background-color 0.2s;
  }
  
  .btn:hover {
    background-color: #e0e0e0;
  }
  
  .btn.primary {
    background-color: #1890ff;
    color: white;
  }
  
  .btn.primary:hover {
    background-color: #40a9ff;
  }
  
  .btn.danger {
    background-color: #ff4d4f;
    color: white;
  }
  
  .btn.danger:hover {
    background-color: #ff7875;
  }
  
  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .upload-status {
    padding: 10px;
    margin-bottom: 20px;
    border-radius: 4px;
  }
  
  .upload-status.success {
    background-color: #f6ffed;
    border: 1px solid #b7eb8f;
    color: #52c41a;
  }
  
  .upload-status.error {
    background-color: #fff2f0;
    border: 1px solid #ffccc7;
    color: #ff4d4f;
  }
  
  .error-message {
    padding: 10px;
    margin-bottom: 20px;
    background-color: #fff2f0;
    border: 1px solid #ffccc7;
    color: #ff4d4f;
    border-radius: 4px;
  }
  
  .loading {
    text-align: center;
    padding: 20px;
    color: #666;
  }
  
  .file-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
  
  .file-info {
    display: flex;
    gap: 20px;
    align-items: center;
  }
  
  .file-name {
    font-weight: 500;
  }
  
  .file-size, .file-date {
    color: #666;
    font-size: 0.9em;
  }
  
  .file-actions {
    display: flex;
    gap: 10px;
  }
  </style>