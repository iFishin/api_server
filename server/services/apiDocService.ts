/**
 * API 文档服务
 * 
 * 提供API文档的注册、查询和管理功能
 */

// API 文档定义接口
export interface ApiDocumentation {
  operationId: string;
  tags: string[];
  summary: string;
  description?: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  path: string;
  parameters?: any[];
  requestBody?: any;
  responses: Record<string, any>;
}

// 存储所有注册的API文档
const apiDocumentations: ApiDocumentation[] = [];

/**
 * 注册API文档
 * @param doc API文档定义
 */
export function registerApiDoc(doc: ApiDocumentation): void {
  // 检查是否已存在相同operationId的文档
  const existingIndex = apiDocumentations.findIndex(
    existing => existing.operationId === doc.operationId
  );

  // 如果已存在则更新，否则添加新文档
  if (existingIndex !== -1) {
    apiDocumentations[existingIndex] = doc;
  } else {
    apiDocumentations.push(doc);
  }
}

/**
 * 获取所有API文档
 */
export function getApiDocs(): ApiDocumentation[] {
  return apiDocumentations;
}

/**
 * 根据操作ID获取API文档
 * @param operationId 操作ID
 */
export function getApiDocByOperationId(operationId: string): ApiDocumentation | undefined {
  return apiDocumentations.find(doc => doc.operationId === operationId);
}

/**
 * 根据标签获取API文档
 * @param tag 标签名称
 */
export function getApiDocsByTag(tag: string): ApiDocumentation[] {
  return apiDocumentations.filter(doc => doc.tags.includes(tag));
}

/**
 * 获取所有可用的API标签
 */
export function getApiTags(): string[] {
  const tagsSet = new Set<string>();
  
  apiDocumentations.forEach(doc => {
    doc.tags.forEach(tag => tagsSet.add(tag));
  });
  
  return Array.from(tagsSet);
}

/**
 * 清除所有API文档
 */
export function clearApiDocs(): void {
  apiDocumentations.length = 0;
}

/**
 * 删除指定的API文档
 * @param operationId 操作ID
 * @returns 是否成功删除
 */
export function removeApiDoc(operationId: string): boolean {
  const initialLength = apiDocumentations.length;
  
  const filteredDocs = apiDocumentations.filter(
    doc => doc.operationId !== operationId
  );
  
  apiDocumentations.length = 0;
  apiDocumentations.push(...filteredDocs);
  
  return apiDocumentations.length < initialLength;
}
