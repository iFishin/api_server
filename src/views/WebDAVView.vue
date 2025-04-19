<!--
 * @Date: 2025-04-19
 * @LastEditors: Fishing
 * @LastEditTime: 2025-04-20
 * @FilePath: \Api_Server\src\views\WebDAVView.vue
 * @Description: https://github.com/iFishin
-->
<template>
    <div class="webdav-container">
        <div class="header">
            <h1>WebDAV 文件管理器</h1>
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

        <div v-else class="content-container">
            <div class="file-list">
                <div v-for="file in files" :key="file.name" class="file-item">
                    <div class="file-info">
                        <span class="file-name" @click="handleFileClick(file)">{{ file.name }}</span>
                        <span class="file-size">{{ formatSize(file.size) }}</span>
                        <span class="file-date">{{ formatDate(file.modifiedAt) }}</span>
                    </div>
                    <div class="file-actions">
                        <button @click="downloadFile(file)" class="btn">下载</button>
                        <button @click="deleteFile(file)" class="btn danger">删除</button>
                    </div>
                </div>
            </div>
            
            <!-- 文本预览区域 -->
            <div v-if="previewFile" class="preview-container">
                <div class="preview-header">
                    <h3>{{ previewFile.name }}</h3>
                    <button @click="closePreview" class="btn">关闭</button>
                </div>
                <div class="preview-content">
                    <pre v-if="previewContent">{{ previewContent }}</pre>
                    <div v-else-if="previewLoading" class="preview-loading">加载中...</div>
                    <div v-else class="preview-error">无法预览此文件</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

// 配置 axios 默认值
const API_BASE_URL = 'http://localhost:3000'
axios.defaults.baseURL = API_BASE_URL

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
const previewFile = ref<FileItem | null>(null);
const previewContent = ref<string>('');
const previewLoading = ref<boolean>(false);

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
    window.open(`${API_BASE_URL}/api/files/download/${encodeURIComponent(file.name)}`, '_blank');
}

// 处理文件点击
async function handleFileClick(file: FileItem) {
    // 检查是否为文本文件
    const textExtensions = ['.txt', '.md', '.json', '.js', '.ts', '.html', '.css', '.xml', '.csv', '.log'];
    const isTextFile = textExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (isTextFile) {
        previewFile.value = file;
        previewLoading.value = true;
        previewContent.value = '';
        
        try {
            const response = await axios.get(`/api/files/preview/${encodeURIComponent(file.name)}`, {
                responseType: 'text'
            });
            previewContent.value = response.data;
        } catch (err) {
            console.error('预览文件错误:', err);
        } finally {
            previewLoading.value = false;
        }
    } else {
        // 非文本文件直接下载
        downloadFile(file);
    }
}

// 关闭预览
function closePreview() {
    previewFile.value = null;
    previewContent.value = '';
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
    name: 'WebDAVView'
});
</script>

<style scoped>
.webdav-container {
    padding: 20px;
    width: 100%;
    max-width: 1800px;
    margin: 0 auto;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #e2e8f0;
}

.header h1 {
    font-size: 1.8rem;
    color: #2c3e50;
    margin: 0;
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
    transition: all 0.2s ease;
    font-size: 14px;
}

.btn:hover {
    background-color: #e0e0e0;
}

.btn.primary {
    background-color: #3498db;
    color: white;
}

.btn.primary:hover {
    background-color: #2980b9;
}

.btn.danger {
    background-color: #e74c3c;
    color: white;
}

.btn.danger:hover {
    background-color: #c0392b;
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.upload-status {
    padding: 10px;
    margin-bottom: 20px;
    border-radius: 4px;
    font-size: 14px;
}

.upload-status.success {
    background-color: #d4edda;
    border: 1px solid #c3e6cb;
    color: #155724;
}

.upload-status.error {
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    color: #721c24;
}

.error-message {
    padding: 10px;
    margin-bottom: 20px;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    color: #721c24;
    border-radius: 4px;
    font-size: 14px;
}

.loading {
    text-align: center;
    padding: 20px;
    color: #666;
    font-size: 14px;
}

.content-container {
    display: flex;
    gap: 20px;
    height: calc(100vh - 200px);
    min-height: 500px;
}

.file-list {
    flex: 1;
    overflow-y: auto;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    padding: 15px;
}

.file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background-color: #f8fafc;
    border-radius: 6px;
    margin-bottom: 10px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.file-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.file-info {
    display: flex;
    gap: 20px;
    align-items: center;
    flex: 1;
}

.file-name {
    font-weight: 500;
    color: #2c3e50;
    cursor: pointer;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.file-name:hover {
    color: #3498db;
    text-decoration: underline;
}

.file-size, .file-date {
    color: #666;
    font-size: 0.9em;
    white-space: nowrap;
}

.file-actions {
    display: flex;
    gap: 10px;
}

/* 预览区域样式 */
.preview-container {
    flex: 1;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background-color: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
}

.preview-header h3 {
    margin: 0;
    font-size: 1.2rem;
    color: #2c3e50;
}

.preview-content {
    flex: 1;
    padding: 15px;
    overflow: auto;
    background-color: #f8fafc;
}

.preview-content pre {
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: 'Courier New', Courier, monospace;
    font-size: 14px;
    line-height: 1.5;
    color: #333;
}

.preview-loading, .preview-error {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: #666;
    font-size: 16px;
}

.preview-error {
    color: #e74c3c;
}

/* 响应式设计 */
@media (max-width: 1200px) {
    .content-container {
        flex-direction: column;
        height: auto;
    }
    
    .preview-container {
        height: 500px;
    }
}
</style>