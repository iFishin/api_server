<template>
    <div class="webdav-explorer">
      <div class="webdav-info">
        <div class="info-card">
          <h3>WebDAV 服务信息</h3>
          <p><strong>服务地址:</strong> http://localhost:3000/webdav</p>
          <p><strong>用户名:</strong> admin</p>
          <p><strong>密码:</strong> admin</p>
          <p><strong>存储位置:</strong> ./temps 目录</p>
        </div>
      </div>
  
      <!-- 文件上传部分 -->
      <div class="upload-section">
        <h3>文件上传</h3>
        <div class="upload-form">
          <input type="file" ref="fileInput" @change="handleFileSelected" multiple />
          <button @click="uploadFiles" :disabled="!selectedFiles.length">
            上传文件
          </button>
        </div>
        <div v-if="uploadStatus" class="upload-status" :class="{ success: uploadSuccess, error: !uploadSuccess }">
          {{ uploadStatus }}
        </div>
      </div>
  
      <!-- 文件浏览部分 -->
      <div class="file-explorer">
        <div class="explorer-header">
          <h3>文件管理</h3>
          <button @click="refreshFiles" class="refresh-btn">
            <span class="refresh-icon">🔄</span> 刷新
          </button>
        </div>
        
        <div v-if="loading" class="loading">
          加载中...
        </div>
        
        <div v-else-if="error" class="error-message">
          加载文件失败: {{ error }}
        </div>
        
        <table v-else class="files-table">
          <thead>
            <tr>
              <th>类型</th>
              <th>文件名</th>
              <th>大小</th>
              <th>修改日期</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="file in files" :key="file.name" class="file-row">
              <td>{{ file.isDirectory ? '📁' : '📄' }}</td>
              <td>{{ file.name }}</td>
              <td>{{ formatSize(file.size) }}</td>
              <td>{{ file.modifiedAt ? formatDate(file.modifiedAt) : '未知' }}</td>
              <td class="actions">
                <button v-if="!file.isDirectory" @click="downloadFile(file)" class="action-btn download">
                  下载
                </button>
                <button @click="deleteFile(file)" class="action-btn delete">
                  删除
                </button>
              </td>
            </tr>
            <tr v-if="files.length === 0">
              <td colspan="5" class="empty-message">没有文件</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  
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
      // 创建一个FormData对象用于文件上传
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
    window.open(`/api/files/download/${encodeURIComponent(file.name)}`, '_blank');
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
  </script>
  
  <style scoped>
  .webdav-explorer {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 20px;
  }
  
  .webdav-info {
    margin-bottom: 20px;
  }
  
  .info-card {
    background-color: #f8f9fa;
    border-radius: 6px;
    padding: 15px;
    margin-bottom: 20px;
  }
  
  .upload-section {
    margin-bottom: 20px;
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 6px;
  }
  
  .upload-form {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
  }
  
  .upload-status {
    padding: 10px;
    border-radius: 4px;
    margin-top: 10px;
  }
  
  .success {
    background-color: #d4edda;
    color: #155724;
  }
  
  .error {
    background-color: #f8d7da;
    color: #721c24;
  }
  
  .file-explorer {
    background-color: #fff;
  }
  
  .explorer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
  
  .refresh-btn {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  
  .files-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .files-table th,
  .files-table td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  .files-table th {
    background-color: #f8f9fa;
    font-weight: bold;
  }
  
  .file-row:hover {
    background-color: #f8f9fa;
  }
  
  .actions {
    display: flex;
    gap: 5px;
  }
  
  .action-btn {
    padding: 5px 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .download {
    background-color: #007bff;
    color: white;
  }
  
  .delete {
    background-color: #dc3545;
    color: white;
  }
  
  .loading,
  .error-message,
  .empty-message {
    padding: 20px;
    text-align: center;
  }
  
  .error-message {
    color: #dc3545;
  }
  
  .empty-message {
    color: #6c757d;
  }
  </style>