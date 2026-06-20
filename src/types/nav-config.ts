/**
 * 无界导航配置类型定义
 * 所有数据存储在 localStorage 中，支持导入/导出 JSON
 */

export type TileIconType = 'fontawesome' | 'image';

export type TileSize = 'small' | 'medium' | 'large';

export interface AppTile {
  id: string;
  title: string;
  description?: string;
  url?: string;            // 外部链接
  route?: string;          // 内部路由
  icon: string;            // FontAwesome class
  iconType: TileIconType;
  imageUrl?: string;
  color: string;
  size: TileSize;
  // 自由磁贴：不归属任何分组，直接在画布上定位
  position?: { x: number; y: number };
}

export interface NavGroup {
  id: string;
  name: string;
  description?: string;
  position: { x: number; y: number };   // 画布上的位置（world coordinates）
  icon: string;
  color: string;
  tiles: AppTile[];
}

export interface NavConfig {
  version: number;
  groups: NavGroup[];
  freeTiles?: AppTile[];    // 不归属分组的自由磁贴
  createdAt: number;
  updatedAt: number;
}

/** 生成唯一 ID */
export function generateId(): string {
  return crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** 创建空配置 */
export function createEmptyConfig(): NavConfig {
  return {
    version: 1,
    groups: [],
    freeTiles: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/** 从现有硬编码数据迁移的默认配置 */
export function createDefaultConfig(): NavConfig {
  return {
    version: 1,
    freeTiles: [],
    groups: [
      {
        id: generateId(),
        name: '开发工具',
        description: '实用工具和辅助功能',
        position: { x: -350, y: -200 },
        icon: 'fas fa-toolbox',
        color: '#f39c12',
        tiles: [
          { id: generateId(), title: 'Pan', description: '内部网盘', icon: 'fas fa-cloud', iconType: 'fontawesome', url: '/pan', color: '#2ecc71', size: 'medium' },
          { id: generateId(), title: 'Document Center', description: '短距离文档中心', icon: 'fas fa-folder', iconType: 'fontawesome', url: 'http://st-shortrange.quecinfo.com:2333/doc/shortrange/', color: '#3498db', size: 'medium' },
          { id: generateId(), title: 'Qinglong', description: '青龙面板管理', icon: 'fas fa-tachometer-alt', iconType: 'fontawesome', url: '/qinglong', color: '#e67e22', size: 'medium' },
          { id: generateId(), title: '1Panel', description: '内部管理面板', icon: 'fas fa-server', iconType: 'fontawesome', url: '/1panel', color: '#e67e22', size: 'medium' },
          { id: generateId(), title: 'HTTPS API', description: 'RESTful API 接口测试', icon: 'fas fa-globe', iconType: 'fontawesome', route: '/http-api', color: '#3498db', size: 'medium' },
          { id: generateId(), title: 'WebDAV', description: '文件管理与共享', icon: 'fas fa-folder-open', iconType: 'fontawesome', route: '/webdav', color: '#2ecc71', size: 'medium' },
          { id: generateId(), title: 'MQTT API', description: '物联网消息队列', icon: 'fas fa-broadcast-tower', iconType: 'fontawesome', route: '/mqtt-api', color: '#e74c3c', size: 'medium' },
          { id: generateId(), title: 'TCP/UDP API', description: '网络协议测试', icon: 'fas fa-network-wired', iconType: 'fontawesome', route: '/tcp-udp-api', color: '#9b59b6', size: 'medium' },
          { id: generateId(), title: '用户管理', description: '用户账户与权限', icon: 'fas fa-users', iconType: 'fontawesome', route: '/users-api', color: '#f39c12', size: 'medium' },
          { id: generateId(), title: '工具箱', description: '实用工具集合', icon: 'fas fa-toolbox', iconType: 'fontawesome', route: '/toolkit', color: '#1abc9c', size: 'medium' },
        ],
      },
      {
        id: generateId(),
        name: '网络服务',
        description: 'API 接口和网络工具',
        position: { x: 350, y: -200 },
        icon: 'fas fa-network-wired',
        color: '#3498db',
        tiles: [
          { id: generateId(), title: 'HTTP API', description: 'RESTful API 接口测试', icon: 'fas fa-globe', iconType: 'fontawesome', route: '/http-api', color: '#3498db', size: 'medium' },
          { id: generateId(), title: 'WebDAV', description: '文件管理与共享', icon: 'fas fa-folder-open', iconType: 'fontawesome', route: '/webdav', color: '#2ecc71', size: 'medium' },
          { id: generateId(), title: 'MQTT API', description: '物联网消息队列', icon: 'fas fa-broadcast-tower', iconType: 'fontawesome', route: '/mqtt-api', color: '#e74c3c', size: 'medium' },
          { id: generateId(), title: 'TCP/UDP API', description: '网络协议测试', icon: 'fas fa-network-wired', iconType: 'fontawesome', route: '/tcp-udp-api', color: '#9b59b6', size: 'medium' },
          { id: generateId(), title: '用户管理', description: '用户账户与权限', icon: 'fas fa-users', iconType: 'fontawesome', route: '/users-api', color: '#f39c12', size: 'medium' },
          { id: generateId(), title: '工具箱', description: '实用工具集合', icon: 'fas fa-toolbox', iconType: 'fontawesome', route: '/toolkit', color: '#1abc9c', size: 'medium' },
        ],
      },
      {
        id: generateId(),
        name: '系统管理',
        description: '公司内部系统入口',
        position: { x: -350, y: 300 },
        icon: 'fas fa-cogs',
        color: '#e74c3c',
        tiles: [
          { id: generateId(), title: 'SMOD', description: '修改点管理平台', icon: 'fas fa-edit', iconType: 'image', imageUrl: 'https://stres.quectel.com:8139/cdn/images/icons/SMOD.png?t=9', url: 'https://smod.quectel.com/', color: '#9b59b6', size: 'medium' },
          { id: generateId(), title: 'QTWS', description: '自动化测试管理平台', icon: 'fas fa-vial', iconType: 'image', imageUrl: 'https://stres.quectel.com:8139/cdn/images/icons/TWS.png?t=9', url: 'https://qtws.quectel.com/', color: '#9b59b6', size: 'medium' },
          { id: generateId(), title: 'ST GitLab', description: '测试部GitLab代码仓库', icon: 'fas fa-code-branch', iconType: 'image', imageUrl: 'https://stres.quectel.com:8139/cdn/images/icons/GIT.png?t=11', url: 'http://192.168.26.11:8084/', color: '#9b59b6', size: 'medium' },
          { id: generateId(), title: 'Gitlab2', description: '公司级GitLab代码仓库', icon: 'fas fa-code-branch', iconType: 'image', imageUrl: 'https://stres.quectel.com:8139/cdn/images/icons/GIT.png?t=11', url: 'https://gitlab2.quectel.com/', color: '#9b59b6', size: 'medium' },
          { id: generateId(), title: 'Jira', description: '问题跟踪与项目管理', icon: 'fas fa-tasks', iconType: 'image', imageUrl: 'https://stres.quectel.com:8139/cdn/images/icons/JIRA.png?t=11', url: 'https://ticket.quectel.com/', color: '#9b59b6', size: 'medium' },
          { id: generateId(), title: 'Confluence', description: '团队知识与文档库', icon: 'fas fa-book', iconType: 'image', imageUrl: 'https://stres.quectel.com:8139/cdn/images/icons/Confluence.png?t=11', url: 'https://confluence.quectel.com/', color: '#9b59b6', size: 'medium' },
          { id: generateId(), title: 'ShortRange Doc', description: '短距离文档中心', icon: 'fas fa-folder', iconType: 'fontawesome', url: 'https://short-range.quectel.com/', color: '#9b59b6', size: 'medium' },
          { id: generateId(), title: 'QDesk', description: '内部工单与支持系统', icon: 'fas fa-tasks', iconType: 'image', imageUrl: 'https://qdesk.quectel.com/img/order-icon-1.dbe42ac4.svg', url: 'https://qdesk.quectel.com/', color: '#2d81f9', size: 'medium' },
          { id: generateId(), title: 'EIP', description: '移远综合信息门户', icon: 'fas fa-building', iconType: 'image', imageUrl: 'https://eip.quectel.com/uploads/default/original/2X/e/ecca7aaf5e8af610398f92a9507dfc331716502c.png', url: 'https://eip.quectel.com/', color: '#f5635d', size: 'medium' },
          { id: generateId(), title: 'QMeeting', description: '视频会议系统', icon: 'fas fa-handshake', iconType: 'image', imageUrl: 'https://qmeeting.quectel.com/img/logo_icon.64cdc7ac.svg', url: 'https://qmeeting.quectel.com/', color: '#FFFFFF', size: 'medium' },
          { id: generateId(), title: 'QHR', description: '人力资源系统', icon: 'fas fa-user', iconType: 'image', imageUrl: 'https://qhr.quectel.com/skin/images/index/index-logo.png', url: 'https://hr.quectel.com/portal/index', color: '#FFFFFF', size: 'medium' },
          { id: generateId(), title: 'QPMS', description: '项目与产品管理系统', icon: 'fas fa-project-diagram', iconType: 'fontawesome', url: 'https://qpms.quectel.com/', color: '#4CAF50', size: 'medium' },
          { id: generateId(), title: 'BPM', description: '业务流程管理系统', icon: 'fas fa-stream', iconType: 'fontawesome', url: 'https://bpm.quectel.com/', color: '#2196F3', size: 'medium' },
          { id: generateId(), title: 'QLearning', description: '移远书院', icon: 'fas fa-graduation-cap', iconType: 'fontawesome', url: 'https://q-learning.quectel.com/', color: '#FF9800', size: 'medium' },
          { id: generateId(), title: 'QDisk', description: '移远云盘', icon: 'fas fa-cloud', iconType: 'fontawesome', url: 'https://qdisk.quectel.com/', color: '#8e44ad', size: 'medium' },
          { id: generateId(), title: 'QWorkSpace', description: '移远工位系统', icon: 'fas fa-briefcase', iconType: 'fontawesome', url: 'https://qworkspace.quectel.com/', color: '#27ae60', size: 'medium' },
          { id: generateId(), title: 'QExpress', description: '移远快递', icon: 'fas fa-shipping-fast', iconType: 'fontawesome', url: 'https://qexpress.quectel.com/', color: '#e67e22', size: 'medium' },
          { id: generateId(), title: 'QAssociation', description: '移远协会', icon: 'fas fa-users-cog', iconType: 'fontawesome', url: 'https://qassociation.quectel.com/', color: '#2980b9', size: 'medium' },
          { id: generateId(), title: '更多服务', description: '访问公司内网了解更多', icon: 'fas fa-ellipsis-h', iconType: 'fontawesome', url: 'https://eip.quectel.com/c/apps/1', color: '#34495e', size: 'small' },
        ],
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
