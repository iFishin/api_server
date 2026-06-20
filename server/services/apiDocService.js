"use strict";
/**
 * API 文档服务
 *
 * 提供API文档的注册、查询和管理功能
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerApiDoc = registerApiDoc;
exports.getApiDocs = getApiDocs;
exports.getApiDocByOperationId = getApiDocByOperationId;
exports.getApiDocsByTag = getApiDocsByTag;
exports.getApiTags = getApiTags;
exports.clearApiDocs = clearApiDocs;
exports.removeApiDoc = removeApiDoc;
// 存储所有注册的API文档
const apiDocumentations = [];
/**
 * 注册API文档
 * @param doc API文档定义
 */
function registerApiDoc(doc) {
    // 检查是否已存在相同operationId的文档
    const existingIndex = apiDocumentations.findIndex(existing => existing.operationId === doc.operationId);
    // 如果已存在则更新，否则添加新文档
    if (existingIndex !== -1) {
        apiDocumentations[existingIndex] = doc;
    }
    else {
        apiDocumentations.push(doc);
    }
}
/**
 * 获取所有API文档
 */
function getApiDocs() {
    return apiDocumentations;
}
/**
 * 根据操作ID获取API文档
 * @param operationId 操作ID
 */
function getApiDocByOperationId(operationId) {
    return apiDocumentations.find(doc => doc.operationId === operationId);
}
/**
 * 根据标签获取API文档
 * @param tag 标签名称
 */
function getApiDocsByTag(tag) {
    return apiDocumentations.filter(doc => doc.tags.includes(tag));
}
/**
 * 获取所有可用的API标签
 */
function getApiTags() {
    const tagsSet = new Set();
    apiDocumentations.forEach(doc => {
        doc.tags.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet);
}
/**
 * 清除所有API文档
 */
function clearApiDocs() {
    apiDocumentations.length = 0;
}
/**
 * 删除指定的API文档
 * @param operationId 操作ID
 * @returns 是否成功删除
 */
function removeApiDoc(operationId) {
    const initialLength = apiDocumentations.length;
    const filteredDocs = apiDocumentations.filter(doc => doc.operationId !== operationId);
    apiDocumentations.length = 0;
    apiDocumentations.push(...filteredDocs);
    return apiDocumentations.length < initialLength;
}
