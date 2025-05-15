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

export interface JSONSchema {
  type: string
  format?: string
  example?: any
  properties?: Record<string, JSONSchema>
  items?: JSONSchema
}

declare interface RequestBody {
  content: {
    'application/json': {
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