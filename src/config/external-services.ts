/**
 * 外部服务配置
 * 用于前端路由重定向到不同端口的外部服务
 */

export interface ExternalService {
  port: number          // 服务端口
  name: string          // 服务名称
  description?: string  // 服务描述
  icon?: string        // 图标（可选）
  enabled?: boolean    // 是否启用（默认 true）
}

/**
 * 外部服务配置表
 * 路径 -> 服务配置
 */
export const externalServices: Record<string, ExternalService> = {
  '/qinglong': {
    port: 5700,
    name: '青龙面板',
    description: '定时任务管理系统',
    icon: 'fa-solid fa-dragon',
    enabled: true
  },
  '/1panel': {
    port: 8080,
    name: '1Panel',
    description: '服务器管理面板',
    icon: 'fa-solid fa-server',
    enabled: true
  },
  '/pan': {
    port: 9090,
    name: 'OpenList',
    description: '列表管理服务',
    icon: 'fa-solid fa-list',
    enabled: true
  },
  // 添加更多外部服务...
  // '/service-name': {
  //   port: 8888,
  //   name: '服务名称',
  //   description: '服务描述',
  //   icon: 'fa-solid fa-icon-name',
  //   enabled: true
  // }
}

/**
 * 获取所有启用的外部服务
 */
export function getEnabledServices() {
  return Object.entries(externalServices)
    .filter(([_, service]) => service.enabled !== false)
    .reduce((acc, [path, service]) => {
      acc[path] = service
      return acc
    }, {} as Record<string, ExternalService>)
}

/**
 * 获取外部服务的完整 URL
 * @param path 服务路径前缀，如 '/openlist'
 * @param fullPath 完整路径，如 '/openlist/some/page'
 * @returns 重定向的目标 URL，去掉路径前缀
 * 
 * 示例：
 * - /openlist → http://host:9090/
 * - /openlist/page → http://host:9090/page
 */
export function getServiceUrl(path: string, fullPath?: string): string | null {
  const service = externalServices[path]
  if (!service || service.enabled === false) {
    return null
  }
  
  const protocol = window.location.protocol
  const hostname = window.location.hostname
  
  // 去掉路径前缀，只保留后面的部分
  let targetPath = '/'
  if (fullPath && fullPath !== path) {
    // 如果 fullPath 是 '/openlist/page', path 是 '/openlist'
    // 那么 targetPath 应该是 '/page'
    targetPath = fullPath.substring(path.length) || '/'
  }
  
  return `${protocol}//${hostname}:${service.port}${targetPath}`
}

/**
 * 检查路径是否是外部服务
 */
export function isExternalService(path: string): boolean {
  for (const servicePath of Object.keys(externalServices)) {
    if (path === servicePath || path.startsWith(servicePath + '/')) {
      const service = externalServices[servicePath]
      return service.enabled !== false
    }
  }
  return false
}

/**
 * 获取路径对应的外部服务配置
 */
export function getServiceByPath(path: string): { path: string; service: ExternalService } | null {
  for (const [servicePath, service] of Object.entries(externalServices)) {
    if (path === servicePath || path.startsWith(servicePath + '/')) {
      if (service.enabled !== false) {
        return { path: servicePath, service }
      }
    }
  }
  return null
}
