// 类型定义
export interface ApiDocument {
  operationId: string
  tags: string[]
  summary: string
  description: string
  method: string
  path: string
  parameters: ApiParameter[]
  requestBody?: RequestBody
  responses: Record<string, ApiResponse>
}

export interface ApiParameter {
  name: string
  in: 'path' | 'query' | 'header' | 'cookie'
  description?: string
  required: boolean
  schema: JSONSchema
}

export interface MultipartFormDataSchema {
  type: 'object'
  properties: Record<string, JSONSchema | {
    type: 'string'
    format: 'binary' // For file uploads
    description?: string
    example?: any
  }>
  required?: string[]
}

export interface JSONSchema {
  type: string
  format?: string
  description?: string
  example?: any
  properties?: Record<string, JSONSchema>
  items?: JSONSchema
}

declare interface RequestBody {
  content: {
    'multipart/form-data'?: {
      schema: MultipartFormDataSchema 
    },
    'application/json'?: {
      schema: JSONSchema
    }
  }
}

declare interface ApiResponse {
  description: string
  content?: {
    'application/json': {
      schema: JSONSchema
    }
  }
}