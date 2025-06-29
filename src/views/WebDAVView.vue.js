import { ref, onMounted } from 'vue';
import api, { getApiBaseUrl } from '@/utils/api';
// 状态变量
const files = ref([]);
const loading = ref(false);
const error = ref(null);
const selectedFiles = ref([]);
const fileInput = ref(null);
const uploadStatus = ref('');
const uploadSuccess = ref(false);
const previewFile = ref(null);
const previewContent = ref('');
const previewLoading = ref(false);
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
    }
    catch (err) {
        error.value = err.message || '无法获取文件列表';
        console.error('获取文件列表错误:', err);
    }
    finally {
        loading.value = false;
    }
}
// 处理文件选择
function handleFileSelected(event) {
    const target = event.target;
    selectedFiles.value = Array.from(target.files || []);
}
// 上传文件
async function uploadFiles() {
    if (!selectedFiles.value.length)
        return;
    uploadStatus.value = '上传中...';
    uploadSuccess.value = false;
    try {
        for (const file of selectedFiles.value) {
            const formData = new FormData();
            formData.append('file', file);
            await api.post('/api/files/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        }
        uploadStatus.value = `成功上传 ${selectedFiles.value.length} 个文件`;
        uploadSuccess.value = true;
    }
    catch (err) {
        uploadStatus.value = `上传失败: ${err.message || '未知错误'}`;
        uploadSuccess.value = false;
        console.error('文件上传错误:', err);
    }
    finally {
        if (fileInput.value) {
            fileInput.value.value = '';
        }
        selectedFiles.value = [];
        refreshFiles();
    }
}
// 删除文件
async function deleteFile(file) {
    if (!confirm(`确定要删除 "${file.name}" 吗?`))
        return;
    try {
        await api.delete(`/api/files/${encodeURIComponent(file.name)}`);
        refreshFiles();
    }
    catch (err) {
        alert(`删除失败: ${err.message || '未知错误'}`);
        console.error('删除文件错误:', err);
    }
}
// 下载文件
function downloadFile(file) {
    window.open(`${API_BASE_URL}/api/files/download/${encodeURIComponent(file.name)}`, '_blank');
}
// 处理文件点击
async function handleFileClick(file) {
    // 检查是否为文本文件
    const textExtensions = ['.txt', '.md', '.json', '.js', '.ts', '.html', '.css', '.xml', '.csv', '.log'];
    const isTextFile = textExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    if (isTextFile) {
        previewFile.value = file;
        previewLoading.value = true;
        previewContent.value = '';
        try {
            const response = await api.get(`/api/files/preview/${encodeURIComponent(file.name)}`, {
                responseType: 'text'
            });
            previewContent.value = response.data;
        }
        catch (err) {
            console.error('预览文件错误:', err);
        }
        finally {
            previewLoading.value = false;
        }
    }
    else {
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
function formatSize(bytes) {
    if (bytes === 0)
        return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
}
// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
}
defineOptions({
    name: 'WebDAVView'
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['header']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['danger']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-status']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-status']} */ ;
/** @type {__VLS_StyleScopedClasses['file-item']} */ ;
/** @type {__VLS_StyleScopedClasses['file-name']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-header']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-content']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-error']} */ ;
/** @type {__VLS_StyleScopedClasses['content-container']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-container']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "webdav-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ onChange: (__VLS_ctx.handleFileSelected) },
    type: "file",
    ref: "fileInput",
    multiple: true,
    ...{ style: {} },
});
/** @type {typeof __VLS_ctx.fileInput} */ ;
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.fileInput?.click();
        } },
    ...{ class: "btn" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.uploadFiles) },
    disabled: (!__VLS_ctx.selectedFiles.length),
    ...{ class: "btn primary" },
});
if (__VLS_ctx.uploadStatus) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: (['upload-status', __VLS_ctx.uploadSuccess ? 'success' : 'error']) },
    });
    (__VLS_ctx.uploadStatus);
}
if (__VLS_ctx.error) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "error-message" },
    });
    (__VLS_ctx.error);
}
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "loading" },
    });
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "content-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "file-list" },
    });
    for (const [file] of __VLS_getVForSourceType((__VLS_ctx.files))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (file.name),
            ...{ class: "file-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "file-info" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    __VLS_ctx.handleFileClick(file);
                } },
            ...{ class: "file-name" },
        });
        (file.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "file-size" },
        });
        (__VLS_ctx.formatSize(file.size));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "file-date" },
        });
        (__VLS_ctx.formatDate(file.modifiedAt));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "file-actions" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    __VLS_ctx.downloadFile(file);
                } },
            ...{ class: "btn" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    __VLS_ctx.deleteFile(file);
                } },
            ...{ class: "btn danger" },
        });
    }
    if (__VLS_ctx.previewFile) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "preview-container" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "preview-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        (__VLS_ctx.previewFile.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.closePreview) },
            ...{ class: "btn" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "preview-content" },
        });
        if (__VLS_ctx.previewContent) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({});
            (__VLS_ctx.previewContent);
        }
        else if (__VLS_ctx.previewLoading) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "preview-loading" },
            });
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "preview-error" },
            });
        }
    }
}
/** @type {__VLS_StyleScopedClasses['webdav-container']} */ ;
/** @type {__VLS_StyleScopedClasses['header']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-status']} */ ;
/** @type {__VLS_StyleScopedClasses['error-message']} */ ;
/** @type {__VLS_StyleScopedClasses['loading']} */ ;
/** @type {__VLS_StyleScopedClasses['content-container']} */ ;
/** @type {__VLS_StyleScopedClasses['file-list']} */ ;
/** @type {__VLS_StyleScopedClasses['file-item']} */ ;
/** @type {__VLS_StyleScopedClasses['file-info']} */ ;
/** @type {__VLS_StyleScopedClasses['file-name']} */ ;
/** @type {__VLS_StyleScopedClasses['file-size']} */ ;
/** @type {__VLS_StyleScopedClasses['file-date']} */ ;
/** @type {__VLS_StyleScopedClasses['file-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['danger']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-container']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-header']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-content']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-loading']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-error']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            files: files,
            loading: loading,
            error: error,
            selectedFiles: selectedFiles,
            fileInput: fileInput,
            uploadStatus: uploadStatus,
            uploadSuccess: uploadSuccess,
            previewFile: previewFile,
            previewContent: previewContent,
            previewLoading: previewLoading,
            handleFileSelected: handleFileSelected,
            uploadFiles: uploadFiles,
            deleteFile: deleteFile,
            downloadFile: downloadFile,
            handleFileClick: handleFileClick,
            closePreview: closePreview,
            formatSize: formatSize,
            formatDate: formatDate,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
