<template>
    <div class="webdav-container">
        <!-- 引入Font Awesome图标 -->
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

        <!-- 拖放上传区域 - 始终显示但根据状态更改样式 -->
        <div 
            class="drop-zone" 
            :class="{ 
                active: isDragging, 
                'with-files': selectedFiles.length > 0 
            }"
            @dragenter.prevent="handleDragEnter"
            @dragleave.prevent="handleDragLeave"
            @dragover.prevent
            @drop.prevent="handleFileDrop"
        >
            <div class="drop-message" v-if="!selectedFiles.length">
                <i class="fas fa-cloud-upload-alt"></i>
                <span>拖放文件到这里上传</span>
            </div>
            <div class="drop-message small" v-else>
                <i class="fas fa-plus-circle"></i>
                <span>拖放更多文件到这里</span>
            </div>
        </div>

        <!-- 待上传文件列表 -->
        <div v-if="selectedFiles.length" class="selected-files">
            <div class="selected-header">
                <h3>待上传文件 ({{ selectedFiles.length }}个)</h3>
                <div class="selected-actions">
                    <button @click="clearSelectedFiles" class="btn">取消</button>
                    <button @click="uploadFiles" class="btn primary">全部上传</button>
                </div>
            </div>
            <div class="selected-list">
                <div v-for="(file, index) in selectedFiles" :key="index" class="selected-item">
                    <div class="file-info">
                        <span class="file-name">{{ file.name }}</span>
                        <span class="file-size">{{ formatSize(file.size) }}</span>
                    </div>
                    <div class="selected-item-actions">
                        <div v-if="uploadProgress[file.name]" class="progress-bar-container">
                            <div class="progress-bar" :style="{ width: uploadProgress[file.name] + '%' }"></div>
                            <span class="progress-text">{{ uploadProgress[file.name] }}%</span>
                        </div>
                        <button @click="removeSelectedFile(index)" class="btn small danger" title="移除此文件">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
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
                    <pre v-if="previewContent && !previewLoading">{{ previewContent }}</pre>
                    <div v-if="previewLoading" class="preview-loading">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>文件加载中，请稍候...</span>
                    </div>
                    <div v-if="!previewContent && !previewLoading" class="preview-error">
                        <i class="fas fa-exclamation-circle"></i>
                        <span>无法预览此文件或文件为空</span>
                    </div>
                </div>
            </div>
        </div>
        <!-- 通知组件 -->
        <CopyNotification 
            :visible="notification.visible" 
            :message="notification.message" 
            :type="notification.type" 
            @hide="hideNotification" 
        />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import api, { getApiBaseUrl } from '../utils/api'
import CopyNotification from '../components/common/CopyNotification.vue'

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
const isDragging = ref<boolean>(false);
const uploadProgress = ref<{[key: string]: number}>({});

// 通知状态
const notification = reactive({
    visible: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info' | 'warning'
});

// 显示通知
function showNotification(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') {
    notification.message = message;
    notification.type = type;
    notification.visible = true;
}

// 隐藏通知
function hideNotification() {
    notification.visible = false;
}

// 获取API基础URL
const API_BASE_URL = getApiBaseUrl();

// 页面加载时获取文件列表
onMounted(() => {
    refreshFiles();
});

// 刷新文件列表
async function refreshFiles() {
    loading.value = true;
    error.value = null;

    try {
        const response = await api.get('/api/files');
        files.value = response.data;
    } catch (err) {
        error.value = (err as Error).message || '无法获取文件列表';
        console.error('获取文件列表错误:', err);
    } finally {
        loading.value = false;
    }
}

// 处理拖拽进入事件
function handleDragEnter(event: DragEvent) {
    isDragging.value = true;
}

// 处理拖拽离开事件
function handleDragLeave(event: DragEvent) {
    isDragging.value = false;
}

// 处理文件拖放
function handleFileDrop(event: DragEvent) {
    isDragging.value = false;
    if (!event.dataTransfer?.files) return;
    
    const newFiles = Array.from(event.dataTransfer.files);
    if (newFiles.length > 0) {
        selectedFiles.value = [...selectedFiles.value, ...newFiles];
    }
}

// 处理文件选择
function handleFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const newFiles = Array.from(target.files || []);
    if (newFiles.length > 0) {
        selectedFiles.value = [...selectedFiles.value, ...newFiles];
    }
}

// 移除选中的文件
function removeSelectedFile(index: number) {
    selectedFiles.value = selectedFiles.value.filter((_, i) => i !== index);
}

// 清除所有选中的文件
function clearSelectedFiles() {
    selectedFiles.value = [];
    if (fileInput.value) {
        fileInput.value.value = '';
    }
}

// 上传文件
async function uploadFiles() {
    if (!selectedFiles.value.length) return;
    
    uploadStatus.value = '上传中...';
    uploadSuccess.value = false;
    uploadProgress.value = {};
    
    try {
        let completed = 0;
        
        // 创建上传任务数组
        const uploadTasks = selectedFiles.value.map(async (file, index) => {
            const formData = new FormData();
            formData.append('file', file);
            uploadProgress.value[file.name] = 0;
            
            try {
                await api.post('/api/files/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    onUploadProgress: (progressEvent: ProgressEvent) => {
                        // @ts-ignore
                        if ((progressEvent as any).total) {
                            // @ts-ignore
                            const percentCompleted = Math.round(((progressEvent as any).loaded * 100) / (progressEvent as any).total);
                            uploadProgress.value[file.name] = percentCompleted;
                        }
                    }
                });
                
                completed++;
                uploadStatus.value = `正在上传: ${completed}/${selectedFiles.value.length} 文件完成`;
                return true;
            } catch (error) {
                console.error(`上传文件 "${file.name}" 失败:`, error);
                return false;
            }
        });
        
        // 等待所有上传任务完成
        const results = await Promise.all(uploadTasks);
        
        // 统计成功和失败的数量
        const successCount = results.filter(result => result).length;
        const failCount = results.length - successCount;
        
        if (failCount === 0) {
            uploadStatus.value = `成功上传 ${successCount} 个文件`;
            uploadSuccess.value = true;
            showNotification(`成功上传 ${successCount} 个文件`, 'success');
        } else {
            uploadStatus.value = `上传完成: ${successCount} 个成功, ${failCount} 个失败`;
            uploadSuccess.value = successCount > 0;
            showNotification(`上传结果: ${successCount} 个成功, ${failCount} 个失败`, successCount > 0 ? 'info' : 'error');
        }
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
        await api.delete(`/api/files/${encodeURIComponent(file.name)}`);
        refreshFiles();
        showNotification(`文件 "${file.name}" 已成功删除`, 'success');
    } catch (err) {
        const errorMsg = `删除失败: ${(err as Error).message || '未知错误'}`;
        showNotification(errorMsg, 'error');
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
            // 尝试下载文件内容进行预览
            const response = await api.get(`/api/files/download/${encodeURIComponent(file.name)}`, {
                responseType: 'text'
            });
            
            // 检查是否成功获取到内容
            if (response && response.data) {
                previewContent.value = response.data;
                showNotification(`正在预览: ${file.name}`, 'info');
                
                // 如果文件内容过大，提示用户
                if (response.data.length > 100000) {
                    showNotification(`文件较大，可能影响浏览器性能`, 'warning');
                }
            } else {
                showNotification(`无法预览文件: ${file.name}`, 'error');
                previewContent.value = '无法加载文件内容';
            }
        } catch (err) {
            console.error('预览文件错误:', err);
            previewContent.value = `预览失败: ${(err as Error).message || '未知错误'}`;
            showNotification(`无法预览文件: ${file.name}`, 'error');
        } finally {
            previewLoading.value = false;
        }
    } else {
        // 非文本文件直接下载
        downloadFile(file);
        showNotification(`正在下载: ${file.name}`, 'info');
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
    border: 1px solid #eaeaea;
}

.file-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-color: #ddd;
}

.file-info {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 2fr);
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

/* 拖放区域样式 */
.drop-zone {
    border: 2px dashed #ccc;
    border-radius: 8px;
    padding: 40px;
    text-align: center;
    margin-bottom: 20px;
    background-color: #f8fafc;
    transition: all 0.3s ease;
    cursor: pointer;
}

.drop-zone.active {
    border-color: #3498db;
    background-color: #ebf5fb;
}

.drop-zone.with-files {
    padding: 15px;
    margin-bottom: 10px;
}

.drop-message.small {
    flex-direction: row;
    gap: 5px;
    font-size: 0.9rem;
}

.drop-message.small i {
    font-size: 1.2rem;
}

.drop-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    color: #666;
}

.drop-message i {
    font-size: 2rem;
    color: #3498db;
}

/* 待上传文件列表样式 */
.selected-files {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;
    overflow: hidden;
}

.selected-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background-color: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
}

.selected-header h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #2c3e50;
}

.selected-actions {
    display: flex;
    gap: 10px;
}

.selected-list {
    max-height: 250px;
    overflow-y: auto;
    padding: 10px;
}

.selected-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    border-bottom: 1px solid #edf2f7;
}

.selected-item:last-child {
    border-bottom: none;
}

.selected-item-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
}

.btn.small {
    padding: 4px 8px;
    font-size: 12px;
}

/* 进度条样式 */
.progress-bar-container {
    height: 6px;
    width: 120px;
    background-color: #edf2f7;
    border-radius: 3px;
    overflow: hidden;
    position: relative;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) inset;
}

.progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #3498db, #2980b9);
    border-radius: 3px;
    transition: width 0.3s ease;
}

.progress-text {
    position: absolute;
    right: 0;
    top: -18px;
    font-size: 10px;
    font-weight: 500;
    color: #666;
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
    max-height: calc(100vh - 200px);
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
    padding: 15px;
    overflow-y: auto;
    overflow-x: auto;
    background-color: #f8fafc;
    height: calc(100vh - 400px)
}

.preview-content pre {
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: 'Courier New', Courier, monospace;
    font-size: 14px;
    line-height: 1.5;
    color: #333;
    width: 100%;
    overflow: visible;
}

.preview-loading, .preview-error {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: #666;
    font-size: 16px;
    gap: 15px;
}

.preview-loading i, .preview-error i {
    font-size: 2.5rem;
    margin-bottom: 10px;
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
        max-height: 70vh;
    }
}
</style>