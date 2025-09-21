<template>
    <div class="infinite-nav-container" ref="containerRef">
        <!-- 无界导航画布 -->
        <div 
            class="infinite-canvas"
            ref="canvasRef"
            :style="canvasStyle"
            @mousedown="handleMouseDown"
            @mousemove="handleMouseMove"
            @mouseup="handleMouseUp"
            @mouseleave="handleMouseUp"
            @contextmenu="handleContextMenu"
            @touchstart="handleTouchStart"
            @touchmove="handleTouchMove"
            @touchend="handleTouchEnd"
            @wheel="handleWheel"
        >
            <!-- 重复的导航网格 -->
            <div 
                v-for="(grid, gridIndex) in visibleGrids" 
                :key="gridIndex"
                class="nav-grid"
                :style="{
                    ...getGridStyle(grid),
                    width: `${optimalGridLayout.gridWidth}px`,
                    height: `${optimalGridLayout.gridHeight}px`,
                    gridTemplateColumns: `repeat(${optimalGridLayout.cols}, 1fr)`,
                    gridTemplateRows: `repeat(${optimalGridLayout.rows}, 1fr)`,
                    gap: '20px',
                    padding: '40px'
                }"
            >
                <!-- 分类组 -->
                <div 
                    v-for="(group, groupIndex) in groupedNavItems" 
                    :key="`${gridIndex}-group-${groupIndex}`"
                    class="category-group"
                    :style="{ 
                        '--category-color': group.config.color,
                        width: `${optimalGridLayout.groupWidth}px`,
                        height: `${optimalGridLayout.groupHeight}px`
                    }"
                >
                    <!-- 分类标题 -->
                    <div class="category-header">
                        <div class="category-icon">
                                <template v-if="group.config.image">
                                    <img :src="group.config.image" :alt="group.config.name" @error="onImageError" />
                                </template>
                                <template v-else>
                                    <i :class="group.config.icon || 'fas fa-folder'"></i>
                                </template>
                        </div>
                        <div class="category-info">
                            <h3 class="category-title">{{ group.config.name }}</h3>
                            <p class="category-description">{{ group.config.description }}</p>
                            <span class="category-count">{{ group.items.length }} 项</span>
                        </div>
                    </div>
                    
                    <!-- 分类内的导航卡片 -->
                    <div class="category-items" :class="`items-count-${group.items.length}`">
                        <div 
                            v-for="(item, itemIndex) in group.items" 
                            :key="`${gridIndex}-${groupIndex}-${itemIndex}`"
                            class="nav-card"
                            :class="{ active: item.active }"
                            :style="{ '--card-color': item.color }"
                            @click="handleNavClick(item)"
                        >
                            <div class="card-icon">
                                <template v-if="item.image">
                                    <img :src="item.image" :alt="item.title" @error="onImageError" />
                                </template>
                                <template v-else>
                                    <i :class="item.icon || 'fas fa-link'"></i>
                                </template>
                            </div>
                            <div class="card-content">
                                <h4>{{ item.title }}</h4>
                                <p>{{ item.description }}</p>
                            </div>
                            <div class="card-overlay">
                                <span>点击进入</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 坐标指示器 -->
        <div class="position-indicator">
            <div class="coord">
                X: {{ Math.round(position.x) }} | Y: {{ Math.round(position.y) }}
            </div>
            <div class="debug-info">
                网格中心: X{{ Math.floor(-position.x / gridSize.width) }} | Y{{ Math.floor(-position.y / gridSize.height) }}
            </div>
            <div class="status">
                <span v-if="isDragging && dragButton === 0" class="dragging">🖱️ 左键拖拽</span>
                <span v-else-if="isDragging && dragButton === 2" class="dragging">🖱️ 右键拖拽</span>
                <span v-else-if="isInertiaRunning" class="inertia">⚡ 惯性滑动</span>
                <span v-else class="idle">😌 静止</span>
            </div>
            
            <div v-if="gridMode !== 'off'" class="grid-info">
                <i class="fas fa-th"></i>
                {{ gridModeNames[gridMode] }}
            </div>
            <div v-if="isZoomed" class="zoom-info">
                <i class="fas fa-search-plus"></i>
                缩放模式 (1.5x)
            </div>
        </div>

        <!-- 小地图 -->
        <div v-if="showMiniMap" class="mini-map">
            <div class="mini-map-title">
                <i class="fas fa-map"></i>
                导航地图
            </div>
            <div class="mini-map-content">
                <div 
                    class="mini-grid"
                    :style="{
                        gridTemplateColumns: `repeat(${optimalGridLayout.cols}, 1fr)`,
                        gridTemplateRows: `repeat(${optimalGridLayout.rows}, 1fr)`
                    }"
                    @click="handleMiniMapClick"
                >
                    <div 
                        v-for="(group, groupIndex) in groupedNavItems" 
                        :key="groupIndex"
                        class="mini-group"
                        :style="{ backgroundColor: group.config.color }"
                        @click.stop="navigateToGroup(groupIndex)"
                        :title="`${group.config.name} (${group.items.length}项)`"
                    >
                        <i :class="group.config.icon"></i>
                        <span class="mini-group-count">{{ group.items.length }}</span>
                    </div>
                </div>
                <!-- 当前视口指示器 -->
                <div 
                    class="mini-viewport" 
                    :style="miniViewportStyle"
                    title="当前视口"
                >
                </div>
                <!-- 中心点指示器 -->
                <div class="mini-center" title="网格中心 (0,0)"></div>
            </div>
            <div class="mini-map-info">
                <div class="mini-coord">
                    位置: ({{ Math.round(position.x) }}, {{ Math.round(position.y) }})
                </div>
                <div class="mini-grid-info">
                    网格: {{ Math.floor(-position.x / gridSize.width) }}, {{ Math.floor(-position.y / gridSize.height) }}
                </div>
            </div>
        </div>

        <!-- 坐标系十字线 -->
        <div v-if="showCoordinates" class="coordinate-system">
            <div class="axis axis-x"></div>
            <div class="axis axis-y"></div>
            <div class="origin">
                <span class="origin-label">原点 (0,0)</span>
            </div>
        </div>

        <!-- 导航控制器 -->
        <div class="nav-controls">
            <button @click="resetPosition" class="control-btn">
                <i class="fas fa-home"></i>
                回到中心
            </button>
            <button @click="toggleGrid" class="control-btn" :class="{ active: showGrid }">
                <i class="fas fa-th"></i>
                {{ gridMode === 'off' ? '显示网格' : gridModeNames[gridMode] }}
            </button>
            <button @click="toggleZoom" class="control-btn" :class="{ active: isZoomed }">
                <i class="fas fa-search-plus"></i>
                {{ isZoomed ? '缩小视图' : '放大视图' }}
            </button>
            <button @click="toggleMiniMap" class="control-btn" :class="{ active: showMiniMap }">
                <i class="fas fa-map"></i>
                小地图
            </button>
            <button @click="toggleCoordinates" class="control-btn" :class="{ active: showCoordinates }">
                <i class="fas fa-crosshairs"></i>
                坐标系
            </button>
            <div class="control-info">
                <div class="info-item">
                    <i class="fas fa-mouse"></i>
                    <span>左键/右键拖拽</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-scroll"></i>
                    <span>滚轮移动</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-keyboard"></i>
                    <span>方向键控制</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

interface NavItem {
    title: string;
    description: string;
    category: string;
    icon: string;
    image?: string;
    route: string;
    url?: string;
    color: string;
    active?: boolean;
}

interface Position {
    x: number;
    y: number;
}

interface Grid {
    offsetX: number;
    offsetY: number;
}

const router = useRouter();

// DOM 引用
const containerRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLElement | null>(null);

// 位置和拖拽状态
const position = reactive<Position>({ x: 0, y: 0 });
// 内部非响应式位置，用于高频更新，减少对 Vue 响应式系统的压力
let internalX = position.x;
let internalY = position.y;
const isDragging = ref(false);
const lastPointer = reactive({ x: 0, y: 0 });
const showGrid = ref(false);
const dragVelocity = reactive({ x: 0, y: 0 });
const isInertiaRunning = ref(false);
const dragDistance = ref(0); // 追踪拖拽距离
const dragStartTime = ref(0);
const dragButton = ref(0); // 追踪哪个鼠标按钮在拖拽 (0=左键, 2=右键)

// 新增的功能状态
const gridMode = ref<'off' | 'dots' | 'lines' | 'coordinates'>('off');
const isZoomed = ref(false);
const showMiniMap = ref(false);
const showCoordinates = ref(false);

// 网格模式名称
const gridModeNames = {
    'off': '关闭网格',
    'dots': '点状网格', 
    'lines': '线条网格',
    'coordinates': '坐标网格'
};

// 导航项目配置
const navItems: NavItem[] = [
    {
        title: 'HTTP API',
        description: 'RESTful API 接口测试',
        category: 'network',
        icon: 'fas fa-globe',
        // image: '/assets/icons/http-api.png', // 可选，示例注释
        route: '/http-api',
        color: '#3498db'
    },
    {
        title: 'WebDAV',
        description: '文件管理与共享',
        category: 'tools',
        icon: 'fas fa-folder-open',
        route: '/webdav',
        color: '#2ecc71'
    },
    {
        title: 'MQTT API',
        description: '物联网消息队列',
        category: 'network',
        icon: 'fas fa-broadcast-tower',
        route: '/mqtt-api',
        color: '#e74c3c'
    },
    {
        title: 'TCP/UDP API',
        description: '网络协议测试',
        category: 'network',
        icon: 'fas fa-network-wired',
        route: '/tcp-udp-api',
        color: '#9b59b6'
    },
    {
        title: '用户管理',
        description: '用户账户与权限',
        category: 'network',
        icon: 'fas fa-users',
        route: '/users-api',
        color: '#f39c12'
    },
    {
        title: '工具箱',
        description: '实用工具集合',
        category: 'tools',
        icon: 'fas fa-toolbox',
        route: '/toolkit',
        color: '#1abc9c'
    },
    {
        title: 'SMOD',
        description: '修改点管理平台',
        category: 'management',
        icon: 'fas fa-edit',
        image: 'https://stres.quectel.com:8139/cdn/images/icons/SMOD.png?t=9',
        route: '#',
        url: 'https://smod.quectel.com/',
        color: '#9b59b6'
    },
    {
        title: 'QTWS',
        description: '自动化测试管理平台',
        category: 'management',
        icon: 'fas fa-vial',
        image: 'https://stres.quectel.com:8139/cdn/images/icons/TWS.png?t=9',
        route: '#',
        url: 'https://qtws.quectel.com/',
        color: '#9b59b6'
    },
    {
        title: 'ST GitLab',
        description: '测试部GitLab代码仓库',
        category: 'management',
        icon: 'fas fa-code-branch',
        image: 'https://stres.quectel.com:8139/cdn/images/icons/GIT.png?t=11',
        route: '#',
        url: 'https://gitlab.st.quectel.com/',
        color: '#9b59b6'
    },
    {
        title: 'Jira',
        description: '问题跟踪与项目管理',
        category: 'management',
        icon: 'fas fa-tasks',
        image: 'https://stres.quectel.com:8139/cdn/images/icons/JIRA.png?t=11',
        route: '#',
        url: 'https://ticket.quectel.com/',
        color: '#9b59b6'
    },
    {
        title: 'Confluence',
        description: '团队知识与文档库',
        category: 'management',
        icon: 'fas fa-book',
        image: 'https://stres.quectel.com:8139/cdn/images/icons/Confluence.png?t=11',
        route: '#',
        url: 'https://confluence.quectel.com/',
        color: '#9b59b6'
    },
    {
        title: 'QDesk',
        description: '内部工单与支持系统',
        category: 'management',
        icon: 'fas fa-tasks',
        image: '	https://qdesk.quectel.com/img/order-icon-1.dbe42ac4.svg',
        route: '#',
        url: 'https://qdesk.quectel.com/',
        color: '#2d81f9'
    },
    {
        title: 'EIP',
        description: '企业信息门户',
        category: 'management',
        icon: 'fas fa-building',
        image: 'https://eip.quectel.com/uploads/default/original/2X/e/ecca7aaf5e8af610398f92a9507dfc331716502c.png',
        route: '#',
        url: 'https://eip.quectel.com/',
        color: '#f5635d'
    },
    {
        title: 'QMeeting',
        description: '企业会议管理系统',
        category: 'management',
        icon: 'fas fa-handshake',
        image: 'https://qmeeting.quectel.com/img/logo_icon.64cdc7ac.svg',
        route: '#',
        url: 'https://qmeeting.quectel.com/',
        color: '#FFFFFF'
    },
    {
        title: 'QHR',
        description: '企业人力资源系统',
        category: 'management',
        icon: 'fas fa-user',
        image: 'https://hr.quectel.com/skin/images/index/index-logo.png',
        route: '#',
        url: 'https://qhr.quectel.com/',
        color: '#FFFFFF'
    },
    {
        title: 'QPMS',
        description: '项目与产品管理系统',
        category: 'management',
        icon: 'fas fa-project-diagram',
        route: '#',
        url: 'https://qpms.quectel.com/',
        color: '#4CAF50'
    },
    {
        title: 'BPM',
        description: '业务流程管理系统',
        category: 'management',
        icon: 'fas fa-stream',
        route: '#',
        url: 'https://bpm.quectel.com/',
        color: '#2196F3'
    },
    {
        title: 'QLearning',
        description: '企业学习与培训平台',
        category: 'management',
        icon: 'fas fa-graduation-cap',
        route: '#',
        url: 'https://learning.quectel.com/',
        color: '#FF9800'
    },
];

// 动态网格配置 - 根据项目数量和屏幕尺寸智能调整
const viewport = reactive({ width: window.innerWidth, height: window.innerHeight });

// 分类配置
const categoryConfig = {
    'network': { 
        name: '网络服务', 
    icon: 'fas fa-network-wired',
    // image: '/assets/icons/network.png', // 可选图片链接
        color: '#3498db',
        description: 'API 接口和网络协议'
    },
    'management': { 
        name: '系统管理', 
        icon: 'fas fa-cogs',
        color: '#e74c3c',
        description: '用户、配置和日志管理'
    },
    'tools': { 
        name: '开发工具', 
        icon: 'fas fa-toolbox',
        color: '#f39c12',
        description: '实用工具和辅助功能'
    }
};

// 按分类分组的导航项
const groupedNavItems = computed(() => {
    const groups: Record<string, NavItem[]> = {};
    
    // 按分类分组
    navItems.forEach(item => {
        if (!groups[item.category]) {
            groups[item.category] = [];
        }
        groups[item.category].push(item);
    });
    
    // 按分类配置的顺序排序，并确保每个分类都有配置
    const sortedCategories = Object.keys(categoryConfig);
    const result: { category: string; items: NavItem[]; config: any }[] = [];
    
    sortedCategories.forEach(category => {
        if (groups[category] && groups[category].length > 0) {
            result.push({
                category,
                items: groups[category],
                config: categoryConfig[category as keyof typeof categoryConfig]
            });
        }
    });
    
    return result;
});

// 计算最优网格布局 - 现在基于分组
const optimalGridLayout = computed(() => {
    const { width, height } = viewport;
    const totalGroups = groupedNavItems.value.length;
    
    // 根据屏幕尺寸确定基础参数
    let maxCols: number;
    let groupMinWidth: number;
    let groupMinHeight: number;
    
    if (width < 768) {
        // 手机/平板：每行1个分组
        maxCols = 1;
        groupMinWidth = width * 0.9;
        groupMinHeight = 300;
    } else if (width < 1200) {
        // 桌面小屏：每行2个分组
        maxCols = 2;
        groupMinWidth = 400;
        groupMinHeight = 350;
    } else {
        // 桌面大屏：每行3个分组
        maxCols = 3;
        groupMinWidth = 450;
        groupMinHeight = 400;
    }
    
    // 计算最优的列数
    const cols = Math.min(maxCols, totalGroups);
    const rows = Math.ceil(totalGroups / cols);
    
    // 计算实际分组尺寸
    const actualGroupWidth = Math.max(groupMinWidth, (width * 0.9 - (cols - 1) * 40) / cols);
    const actualGroupHeight = Math.max(groupMinHeight, (height * 0.8 - (rows - 1) * 40) / rows);
    
    const gridWidth = cols * actualGroupWidth + (cols - 1) * 40 + 80;
    const gridHeight = rows * actualGroupHeight + (rows - 1) * 40 + 80;
    
    return {
        cols,
        rows,
        groupCount: totalGroups,
        groupWidth: actualGroupWidth,
        groupHeight: actualGroupHeight,
        gridWidth,
        gridHeight
    };
});

// 网格配置 - 使用动态计算的尺寸
const gridSize = computed(() => ({
    width: optimalGridLayout.value.gridWidth,
    height: optimalGridLayout.value.gridHeight
}));

// 使用足够大的静态网格确保无限滚动
const grids = computed<Grid[]>(() => {
    const result: Grid[] = [];
    const currentGridSize = gridSize.value;
    
    // 创建 11x11 的超大网格，确保任何方向都有足够内容
    for (let i = -5; i <= 5; i++) {
        for (let j = -5; j <= 5; j++) {
            result.push({
                offsetX: i * currentGridSize.width,
                offsetY: j * currentGridSize.height
            });
        }
    }
    
    // 生成网格数量已稳定，移除频繁日志以避免性能开销
    return result;
});

// 按需渲染：只渲染当前视口可见或接近视口的网格
const visibleGrids = ref<Grid[]>([]);

function computeVisibleGrids() {
    const buffer = 1; // 在视口外再渲染1个缓冲网格
    const currentGridSize = gridSize.value;
    const cols = Math.ceil(viewport.width / currentGridSize.width) + buffer * 2;
    const rows = Math.ceil(viewport.height / currentGridSize.height) + buffer * 2;

    // 计算中心网格索引
    const centerX = Math.floor(-position.x / currentGridSize.width);
    const centerY = Math.floor(-position.y / currentGridSize.height);

    const result: Grid[] = [];
    const halfCols = Math.floor(cols / 2);
    const halfRows = Math.floor(rows / 2);

    for (let i = centerX - halfCols; i <= centerX + halfCols; i++) {
        for (let j = centerY - halfRows; j <= centerY + halfRows; j++) {
            result.push({ offsetX: i * currentGridSize.width, offsetY: j * currentGridSize.height });
        }
    }

    visibleGrids.value = result;
}

// 画布样式
const canvasStyle = computed(() => {
    let backgroundImage = 'none';
    let backgroundSize = 'auto';
    
    // 根据网格模式设置不同的背景
    switch (gridMode.value) {
        case 'dots':
            backgroundImage = 'radial-gradient(circle, rgba(52, 152, 219, 0.4) 2px, transparent 2px)';
            backgroundSize = '50px 50px';
            break;
        case 'lines':
            backgroundImage = `
                linear-gradient(rgba(52, 152, 219, 0.2) 1px, transparent 1px),
                linear-gradient(90deg, rgba(52, 152, 219, 0.2) 1px, transparent 1px)
            `;
            backgroundSize = '50px 50px';
            break;
        case 'coordinates':
            backgroundImage = `
                linear-gradient(rgba(52, 152, 219, 0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(52, 152, 219, 0.3) 1px, transparent 1px),
                linear-gradient(rgba(231, 76, 60, 0.6) 2px, transparent 2px),
                linear-gradient(90deg, rgba(231, 76, 60, 0.6) 2px, transparent 2px)
            `;
            backgroundSize = '50px 50px, 50px 50px, 250px 250px, 250px 250px';
            break;
    }
    
    return {
        cursor: isDragging.value ? (dragButton.value === 2 ? 'move' : 'grabbing') : 'grab',
        backgroundImage,
        backgroundSize,
        transition: (isDragging.value || isInertiaRunning.value) ? 'none' : 'transform 0.3s ease-out',
        outline: isDragging.value && dragButton.value === 2 ? '2px dashed rgba(52, 152, 219, 0.5)' : 'none'
    };
});

// 小地图视口样式
const miniViewportStyle = computed(() => {
    const layout = optimalGridLayout.value;
    const mapWidth = 180; // 小地图内容宽度
    const mapHeight = 100; // 小地图内容高度
    
    // 计算缩放比例
    const scaleX = mapWidth / layout.gridWidth;
    const scaleY = mapHeight / layout.gridHeight;
    
    // 计算当前视口在小地图中的位置
    const viewportWidth = viewport.width * scaleX;
    const viewportHeight = viewport.height * scaleY;
    
    // 计算位置偏移（以小地图中心为基准）
    const centerX = mapWidth / 2;
    const centerY = mapHeight / 2;
    
    const offsetX = centerX - (position.x * scaleX) - viewportWidth / 2;
    const offsetY = centerY - (position.y * scaleY) - viewportHeight / 2;
    
    return {
        left: `${offsetX}px`,
        top: `${offsetY}px`,
        width: `${viewportWidth}px`,
        height: `${viewportHeight}px`
    };
});

// 获取网格样式
function getGridStyle(grid: Grid) {
    // 让每个网格以画布中心为基准定位（left:50%/top:50%），
    // 并通过偏移量将网格中心对齐到画布中心。
    const currentGridSize = gridSize.value;
    const centerOffsetX = grid.offsetX - (currentGridSize.width / 2);
    const centerOffsetY = grid.offsetY - (currentGridSize.height / 2);
    const style = {
        left: '50%',
        top: '50%',
        transform: `translate3d(${centerOffsetX}px, ${centerOffsetY}px, 0)`
    };
    return style;
}

// 鼠标事件处理
function handleMouseDown(event: MouseEvent) {
    // 支持左键(0)和右键(2)拖拽
    if (event.button !== 0 && event.button !== 2) return;
    
    // 停止任何惯性运动
    isInertiaRunning.value = false;
    dragVelocity.x = 0;
    dragVelocity.y = 0;
    dragDistance.value = 0;
    dragStartTime.value = Date.now();
    dragButton.value = event.button;
    
    isDragging.value = true;
    lastPointer.x = event.clientX;
    lastPointer.y = event.clientY;
    event.preventDefault();
    
    // 右键拖拽时阻止默认的右键菜单
    if (event.button === 2) {
        event.stopPropagation();
    }
}

function handleMouseMove(event: MouseEvent) {
    if (!isDragging.value) return;
    
    const deltaX = event.clientX - lastPointer.x;
    const deltaY = event.clientY - lastPointer.y;
    
    // 累计拖拽距离
    dragDistance.value += Math.abs(deltaX) + Math.abs(deltaY);
    
    // 记录拖拽速度用于惯性
    dragVelocity.x = deltaX * 0.8; // 减少速度避免过快
    dragVelocity.y = deltaY * 0.8;
    
    updatePosition(deltaX, deltaY);
    
    lastPointer.x = event.clientX;
    lastPointer.y = event.clientY;
}

function handleMouseUp(event: MouseEvent) {
    // 只处理正在拖拽的按钮释放
    if (event.button === dragButton.value) {
        isDragging.value = false;
        
        // 启动惯性运动
        if (Math.abs(dragVelocity.x) > 2 || Math.abs(dragVelocity.y) > 2) {
            startInertia();
        }
        
        dragButton.value = -1; // 重置拖拽按钮
    }
}

// 右键菜单处理
function handleContextMenu(event: MouseEvent) {
    // 如果正在拖拽或者最近刚拖拽过，阻止右键菜单
    const timeSinceMouseDown = Date.now() - dragStartTime.value;
    if (isDragging.value || dragDistance.value > 5 || timeSinceMouseDown < 300) {
        event.preventDefault();
        return false;
    }
    // 允许正常的右键菜单
    return true;
}

// 惯性运动
function startInertia() {
    if (isInertiaRunning.value) return;
    
    isInertiaRunning.value = true;
    
    const inertiaStep = () => {
        if (!isInertiaRunning.value) return;
        
        // 应用摩擦力
        dragVelocity.x *= 0.95;
        dragVelocity.y *= 0.95;
        
        // 如果速度很小，停止惯性
        if (Math.abs(dragVelocity.x) < 0.1 && Math.abs(dragVelocity.y) < 0.1) {
            isInertiaRunning.value = false;
            dragVelocity.x = 0;
            dragVelocity.y = 0;
            return;
        }
        
        // 更新位置
        updatePosition(dragVelocity.x, dragVelocity.y);
        
        // 继续下一帧
        requestAnimationFrame(inertiaStep);
    };
    
    requestAnimationFrame(inertiaStep);
}

// 触摸事件处理
function handleTouchStart(event: TouchEvent) {
    if (event.touches.length === 1) {
        // 停止任何惯性运动
        isInertiaRunning.value = false;
        dragVelocity.x = 0;
        dragVelocity.y = 0;
        dragDistance.value = 0;
        dragStartTime.value = Date.now();
        
        isDragging.value = true;
        const touch = event.touches[0];
        lastPointer.x = touch.clientX;
        lastPointer.y = touch.clientY;
        event.preventDefault();
    }
}

function handleTouchMove(event: TouchEvent) {
    if (!isDragging.value || event.touches.length !== 1) return;
    
    const touch = event.touches[0];
    const deltaX = touch.clientX - lastPointer.x;
    const deltaY = touch.clientY - lastPointer.y;
    
    // 累计拖拽距离
    dragDistance.value += Math.abs(deltaX) + Math.abs(deltaY);
    
    // 记录拖拽速度用于惯性
    dragVelocity.x = deltaX * 0.8;
    dragVelocity.y = deltaY * 0.8;
    
    updatePosition(deltaX, deltaY);
    
    lastPointer.x = touch.clientX;
    lastPointer.y = touch.clientY;
    event.preventDefault();
}

function handleTouchEnd() {
    isDragging.value = false;
    
    // 启动惯性运动
    if (Math.abs(dragVelocity.x) > 2 || Math.abs(dragVelocity.y) > 2) {
        startInertia();
    }
}

// 滚轮事件处理
function handleWheel(event: WheelEvent) {
    const sensitivity = 0.5;
    const deltaX = -event.deltaX * sensitivity;
    const deltaY = -event.deltaY * sensitivity;
    
    updatePosition(deltaX, deltaY);
    event.preventDefault();
}

// 更新位置 - 带智能重置的无限滚动
function updatePosition(deltaX: number, deltaY: number) {
    // 更新内部位置（高频调用时不会触发 Vue 响应式）
    internalX += deltaX;
    internalY += deltaY;

    // 智能重置：当离开中心太远时重置到等效位置（基于内部位置）
    const resetThreshold = 5000; // 5000像素
    if (Math.abs(internalX) > resetThreshold || Math.abs(internalY) > resetThreshold) {
        const currentGridSize = gridSize.value;
        const newX = ((internalX % currentGridSize.width) + currentGridSize.width) % currentGridSize.width;
        const newY = ((internalY % currentGridSize.height) + currentGridSize.height) % currentGridSize.height;
        internalX = newX;
        internalY = newY;
    }
}

// 渲染循环：使用 requestAnimationFrame 批量更新 canvas transform，避免频繁触发 Vue 响应式重绘
let rafId: number | null = null;
let lastApplied = { x: 0, y: 0, scale: 1 };
let lastGridUpdate = 0;

function renderFrame() {
    if (!canvasRef.value) return;
    const scale = isZoomed.value ? 1.5 : 1;
    // 只在内部位置或缩放变化时更新 DOM（避免频繁触发 Vue 响应式）
    if (lastApplied.x !== internalX || lastApplied.y !== internalY || lastApplied.scale !== scale) {
        const tx = Math.round(internalX);
        const ty = Math.round(internalY);
        canvasRef.value.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`;
        lastApplied.x = internalX;
        lastApplied.y = internalY;
        lastApplied.scale = scale;
    }

    // 每100ms更新一次 visibleGrids，并在更新前把内部位置同步到响应式 position
    const now = performance.now();
    if (now - lastGridUpdate > 100) {
        // 将内部位置同步到响应式位置，以便其他依赖 position 的计算（如 visibleGrids）使用最新值
        position.x = internalX;
        position.y = internalY;
        computeVisibleGrids();
        lastGridUpdate = now;
    }
    rafId = requestAnimationFrame(renderFrame);
}

function startRenderLoop() {
    if (rafId == null) {
        rafId = requestAnimationFrame(renderFrame);
    }
}

function stopRenderLoop() {
    if (rafId != null) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
}

// 导航点击处理
function handleNavClick(item: NavItem) {
    // 如果是在拖拽后立即点击，或者拖拽距离过大，则忽略点击
    const dragDuration = Date.now() - dragStartTime.value;
    if (dragDistance.value > 10 || (isDragging.value && dragDuration < 200) || dragButton.value === 2) {
        return;
    }
    
    // 添加点击动画效果
    item.active = true;
    setTimeout(() => {
        item.active = false;
    }, 300);
    
    // 如果提供了外部链接优先使用 url
    if (item.url && typeof item.url === 'string' && item.url.length > 0) {
        try {
            // 如果是以 http(s) 开头则直接在新标签打开
            const isAbsolute = /^https?:\/\//i.test(item.url);
            if (isAbsolute) {
                window.open(item.url, '_blank');
                return;
            }
            // 否则认为是应用内路径，使用 router 跳转
            router.push(item.url);
            return;
        } catch (e) {
            // 如果出错，回退到 route
            console.warn('导航 url 跳转失败，回退到 route', e);
        }
    }

    // 没有 url 则使用 route
    router.push(item.route);
}

// 重置到中心位置
function resetPosition() {
    // 停止惯性运动
    isInertiaRunning.value = false;
    dragVelocity.x = 0;
    dragVelocity.y = 0;
    
    const startX = internalX;
    const startY = internalY;
    const duration = 500;
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 使用缓动函数
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
    internalX = startX * (1 - easeProgress);
    internalY = startY * (1 - easeProgress);
    // 同步到响应式位置，保证其它逻辑获取到更新
    position.x = internalX;
    position.y = internalY;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };
    
    requestAnimationFrame(animate);
}

// 切换网格显示
function toggleGrid() {
    const modes: Array<'off' | 'dots' | 'lines' | 'coordinates'> = ['off', 'dots', 'lines', 'coordinates'];
    const currentIndex = modes.indexOf(gridMode.value);
    const nextIndex = (currentIndex + 1) % modes.length;
    gridMode.value = modes[nextIndex];
    showGrid.value = gridMode.value !== 'off';
}

// 切换缩放
function toggleZoom() {
    isZoomed.value = !isZoomed.value;
}

// 切换小地图
function toggleMiniMap() {
    showMiniMap.value = !showMiniMap.value;
}

// 切换坐标系显示
function toggleCoordinates() {
    showCoordinates.value = !showCoordinates.value;
}

// 导航到指定分组位置
function navigateToGroup(groupIndex: number) {
    const layout = optimalGridLayout.value;
    
    // 计算分组在网格中的位置
    const row = Math.floor(groupIndex / layout.cols);
    const col = groupIndex % layout.cols;
    
    // 计算目标位置（让分组居中显示）
    const groupWidth = layout.groupWidth + 20; // 加上间距
    const groupHeight = layout.groupHeight + 20;
    
    const targetX = -(col * groupWidth + groupWidth / 2 - viewport.width / 2);
    const targetY = -(row * groupHeight + groupHeight / 2 - viewport.height / 2);
    
    // 平滑动画到目标位置
    animateToPosition(targetX, targetY);
}

// 小地图点击处理
function handleMiniMapClick(event: MouseEvent) {
    event.stopPropagation();
    
    const miniMapElement = event.currentTarget as HTMLElement;
    const rect = miniMapElement.getBoundingClientRect();
    
    // 计算点击在小地图中的相对位置 (0-1)
    const clickX = (event.clientX - rect.left) / rect.width;
    const clickY = (event.clientY - rect.top) / rect.height;
    
    // 转换为网格坐标
    const layout = optimalGridLayout.value;
    const targetGridX = clickX * layout.cols;
    const targetGridY = clickY * layout.rows;
    
    // 找到最接近的分组
    const groupIndex = Math.floor(targetGridY) * layout.cols + Math.floor(targetGridX);
    
    // 确保索引有效
    if (groupIndex >= 0 && groupIndex < groupedNavItems.value.length) {
        navigateToGroup(groupIndex);
    }
}

// 图片加载错误处理：隐藏图片以回退到 icon 显示
const onImageError = (event: Event) => {
    const img = event.target as HTMLImageElement | null;
    if (!img) return;
    // 移除 onerror 避免循环触发
    img.onerror = null as any;
    img.style.display = 'none';
}

// 导航到指定卡片位置（保留兼容性）
function navigateToCard(index: number) {
    // 找到包含该卡片的分组
    let currentIndex = 0;
    for (let i = 0; i < groupedNavItems.value.length; i++) {
        const group = groupedNavItems.value[i];
        if (currentIndex + group.items.length > index) {
            // 导航到该分组
            navigateToGroup(i);
            return;
        }
        currentIndex += group.items.length;
    }
}

// 平滑动画到指定位置
function animateToPosition(targetX: number, targetY: number) {
    // 停止惯性运动
    isInertiaRunning.value = false;
    dragVelocity.x = 0;
    dragVelocity.y = 0;
    
    const startX = internalX;
    const startY = internalY;
    const duration = 800;
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 使用缓动函数
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
    internalX = startX + (targetX - startX) * easeProgress;
    internalY = startY + (targetY - startY) * easeProgress;
    // 同步到响应式位置，供其他逻辑使用
    position.x = internalX;
    position.y = internalY;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };
    
    requestAnimationFrame(animate);
}

// 键盘事件处理
function handleKeyDown(event: KeyboardEvent) {
    // 停止惯性运动
    isInertiaRunning.value = false;
    dragVelocity.x = 0;
    dragVelocity.y = 0;
    
    const step = 50;
    
    switch (event.key) {
        case 'ArrowLeft':
            updatePosition(step, 0);
            event.preventDefault();
            break;
        case 'ArrowRight':
            updatePosition(-step, 0);
            event.preventDefault();
            break;
        case 'ArrowUp':
            updatePosition(0, step);
            event.preventDefault();
            break;
        case 'ArrowDown':
            updatePosition(0, -step);
            event.preventDefault();
            break;
        case 'Home':
            resetPosition();
            event.preventDefault();
            break;
        case 'g':
            if (event.ctrlKey || event.metaKey) {
                toggleGrid();
                event.preventDefault();
            }
            break;
    }
}

// 更新视口尺寸
function updateViewport() {
    viewport.width = window.innerWidth;
    viewport.height = window.innerHeight;
    computeVisibleGrids();
}

// 生命周期
onMounted(() => {
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', updateViewport);
    // 开始 RAF 循环来批量更新 canvas 的 transform，减少 Vue 响应式更新压力
    startRenderLoop();
    // 初始化可见网格
    computeVisibleGrids();
});

onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('resize', updateViewport);
    stopRenderLoop();
});

defineOptions({
    name: 'InfiniteNavView'
});
</script>

<style scoped>
.infinite-nav-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background: transparent;
    user-select: none;
}

.infinite-canvas {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 10000px; /* 合理的画布大小 */
    height: 10000px;
    margin-left: -5000px; /* width / 2 */
    margin-top: -5000px; /* height / 2 */
    /* 移除固定的过渡效果，由JavaScript动态控制 */
    will-change: transform;
    backface-visibility: hidden;
}

.nav-grid {
    position: absolute;
    display: grid;
    box-sizing: border-box;
    transform-origin: 0 0;
    z-index: 1;
}

/* 分类组样式 */
.category-group {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    padding: 20px;
    box-shadow: 
        0 12px 40px rgba(0, 0, 0, 0.1),
        0 6px 20px rgba(0, 0, 0, 0.05);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: all 0.3s ease;
}

.category-group:hover {
    transform: translateY(-5px);
    box-shadow: 
        0 20px 60px rgba(0, 0, 0, 0.15),
        0 10px 30px rgba(0, 0, 0, 0.1);
}

/* 分类标题样式 */
.category-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 2px solid color-mix(in srgb, var(--category-color) 20%, transparent);
}

.category-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--category-color), color-mix(in srgb, var(--category-color) 80%, black));
    margin-right: 12px;
    box-shadow: 0 6px 20px color-mix(in srgb, var(--category-color) 30%, transparent);
}

.category-icon i {
    font-size: 1.5rem;
    color: white;
}

.category-icon img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 10px;
    display: block;
}

.category-info {
    flex: 1;
}

.category-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: #2c3e50;
    margin: 0 0 4px 0;
    line-height: 1.2;
}

.category-description {
    font-size: 0.8rem;
    color: #7f8c8d;
    margin: 0 0 4px 0;
    line-height: 1.3;
}

.category-count {
    font-size: 0.7rem;
    color: var(--category-color);
    font-weight: 600;
    background: color-mix(in srgb, var(--category-color) 15%, transparent);
    padding: 2px 6px;
    border-radius: 10px;
    display: inline-block;
}

/* 分类内项目容器 */
.category-items {
    flex: 1;
    display: grid;
    gap: 12px;
    align-content: start;
}

/* 根据项目数量动态调整网格 */
.category-items.items-count-1 { grid-template-columns: 1fr; }
.category-items.items-count-2 { grid-template-columns: repeat(2, 1fr); }
.category-items.items-count-3 { grid-template-columns: repeat(3, 1fr); }
.category-items.items-count-4 { grid-template-columns: repeat(2, 1fr); }
.category-items.items-count-5 { grid-template-columns: repeat(3, 1fr); }
.category-items.items-count-6 { grid-template-columns: repeat(3, 1fr); }

/* 超过6个项目时，使用4列布局 */
.category-items:not(.items-count-1):not(.items-count-2):not(.items-count-3):not(.items-count-4):not(.items-count-5):not(.items-count-6) {
    grid-template-columns: repeat(4, 1fr);
}

.nav-card {
    position: relative;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 12px;
    padding: 12px;
    box-shadow: 
        0 4px 16px rgba(0, 0, 0, 0.08),
        0 2px 8px rgba(0, 0, 0, 0.04);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    overflow: hidden;
    will-change: transform, opacity;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    min-height: 80px;
}

.nav-card:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 
        0 8px 24px rgba(0, 0, 0, 0.12),
        0 4px 12px rgba(0, 0, 0, 0.08);
    background: rgba(255, 255, 255, 0.95);
}

.nav-card.active {
    transform: scale(0.96);
    box-shadow: 
        0 2px 8px rgba(0, 0, 0, 0.15),
        inset 0 0 8px rgba(0, 0, 0, 0.1);
}

.card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: var(--card-color, #3498db);
    margin: 0 auto 8px;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
}

.card-icon i {
    font-size: 1rem;
    color: white;
}

.card-icon img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 6px;
    display: block;
}

.card-content h4 {
    font-size: 0.8rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 4px 0;
    line-height: 1.2;
}

.card-content p {
    font-size: 0.65rem;
    color: #7f8c8d;
    line-height: 1.3;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.card-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(52, 152, 219, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    border-radius: 20px;
}

.nav-card:hover .card-overlay {
    opacity: 1;
}

.card-overlay span {
    color: white;
    font-size: 1rem;
    font-weight: 600;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.position-indicator {
    position: absolute;
    top: 20px;
    left: 20px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 15px;
    border-radius: 10px;
    font-family: 'Courier New', monospace;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.position-indicator .coord {
    font-size: 1rem;
    font-weight: bold;
    margin-bottom: 5px;
}

    .position-indicator .debug-info {
    font-size: 0.8rem;
    opacity: 0.7;
    margin-bottom: 3px;
    color: #ffd700;
}

.position-indicator .status {
    font-size: 0.9rem;
    margin-bottom: 5px;
    display: flex;
    align-items: center;
    gap: 5px;
}

.status .dragging {
    color: #ef4444;
    font-weight: 600;
}

.status .inertia {
    color: #f59e0b;
    font-weight: 600;
}

.status .idle {
    color: #10b981;
    font-weight: 600;
}

    

.position-indicator .grid-info,
.position-indicator .zoom-info {
    font-size: 0.8rem;
    opacity: 0.9;
    margin-top: 3px;
    display: flex;
    align-items: center;
    gap: 5px;
}

.grid-info i {
    color: rgba(52, 152, 219, 0.8);
}

.zoom-info i {
    color: rgba(46, 204, 113, 0.8);
}

/* 小地图样式 */
.mini-map {
    position: absolute;
    bottom: 20px;
    right: 20px;
    width: 220px;
    background: rgba(0, 0, 0, 0.85);
    border-radius: 12px;
    padding: 12px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    z-index: 100;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.mini-map-title {
    color: white;
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
}

.mini-map-content {
    position: relative;
    height: 120px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.05);
    cursor: crosshair;
    transition: all 0.2s ease;
}

.mini-map-content:hover {
    border-color: rgba(255, 255, 255, 0.4);
    background: rgba(255, 255, 255, 0.08);
}

.mini-grid {
    display: grid;
    gap: 3px;
    padding: 6px;
    height: 100%;
    width: 100%;
}

.mini-group {
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    opacity: 0.85;
    position: relative;
    padding: 3px;
    min-height: 20px;
}

.mini-group:hover {
    opacity: 1;
    transform: scale(1.15);
    z-index: 2;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.3);
}

.mini-group i {
    color: white;
    font-size: 0.7rem;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    margin-bottom: 1px;
}

.mini-group-count {
    background: rgba(255, 255, 255, 0.9);
    color: #2c3e50;
    font-size: 0.5rem;
    font-weight: 600;
    padding: 1px 3px;
    border-radius: 6px;
    line-height: 1;
}

/* 当前视口指示器 */
.mini-viewport {
    position: absolute;
    border: 2px solid rgba(52, 152, 219, 0.8);
    background: rgba(52, 152, 219, 0.2);
    border-radius: 2px;
    z-index: 5;
    pointer-events: none;
    transition: all 0.1s ease;
}

/* 中心点指示器 */
.mini-center {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 6px;
    height: 6px;
    background: rgba(231, 76, 60, 0.9);
    border: 1px solid white;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    z-index: 6;
    box-shadow: 0 0 8px rgba(231, 76, 60, 0.6);
}

.mini-map-info {
    margin-top: 8px;
    padding-top: 6px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.mini-coord,
.mini-grid-info {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.7rem;
    line-height: 1.2;
    font-family: 'Courier New', monospace;
}

.mini-coord {
    color: #3498db;
}

.mini-grid-info {
    color: #f39c12;
}

/* 坐标系样式 */
.coordinate-system {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
}

.axis {
    position: absolute;
    background: rgba(231, 76, 60, 0.6);
}

.axis-x {
    top: 50%;
    left: 0;
    width: 100%;
    height: 2px;
    transform: translateY(-50%);
}

.axis-y {
    left: 50%;
    top: 0;
    width: 2px;
    height: 100%;
    transform: translateX(-50%);
}

.origin {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 12px;
    height: 12px;
    background: rgba(231, 76, 60, 0.9);
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 0 15px rgba(231, 76, 60, 0.8);
}

.origin-label {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.8rem;
    white-space: nowrap;
    backdrop-filter: blur(5px);
}

.nav-controls {
    position: absolute;
    top: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.control-btn {
    background: rgba(255, 255, 255, 0.9);
    border: none;
    border-radius: 10px;
    padding: 12px 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
    color: #2c3e50;
}

.control-btn:hover {
    background: rgba(255, 255, 255, 1);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.control-btn.active {
    background: rgba(52, 152, 219, 0.9);
    color: white;
}

.control-btn i {
    font-size: 1rem;
}

.control-info {
    background: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 10px;
    border-radius: 8px;
    font-size: 0.8rem;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.info-item {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;
}

.info-item:last-child {
    margin-bottom: 0;
}

.info-item i {
    width: 14px;
    text-align: center;
    color: rgba(52, 152, 219, 0.8);
}

/* 响应式设计 */
@media (max-width: 768px) {
    .category-group {
        padding: 15px;
        border-radius: 16px;
    }
    
    .category-header {
        margin-bottom: 12px;
        padding-bottom: 8px;
    }
    
    .category-icon {
        width: 40px;
        height: 40px;
        margin-right: 10px;
    }
    
    .category-icon i {
        font-size: 1.2rem;
    }
    
    .category-title {
        font-size: 1rem;
    }
    
    .category-description {
        font-size: 0.75rem;
    }
    
    .category-count {
        font-size: 0.65rem;
    }
    
    .category-items {
        gap: 8px;
    }
    
    /* 移动端简化网格布局 */
    .category-items.items-count-3,
    .category-items.items-count-4,
    .category-items.items-count-5,
    .category-items.items-count-6 {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .category-items:not(.items-count-1):not(.items-count-2):not(.items-count-3):not(.items-count-4):not(.items-count-5):not(.items-count-6) {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .nav-card {
        padding: 10px;
        min-height: 70px;
        border-radius: 10px;
    }
    
    .card-icon {
        width: 28px;
        height: 28px;
        margin-bottom: 6px;
    }
    
    .card-icon i {
        font-size: 0.9rem;
    }
    
    .card-content h4 {
        font-size: 0.75rem;
    }
    
    .card-content p {
        font-size: 0.6rem;
    }
    
    .position-indicator {
        font-size: 0.8rem;
        padding: 10px;
    }
    
    .control-btn {
        padding: 8px 12px;
        font-size: 0.9rem;
    }
}

@media (max-width: 480px) {
    .category-group {
        padding: 12px;
        border-radius: 12px;
    }
    
    .category-header {
        margin-bottom: 10px;
        padding-bottom: 6px;
    }
    
    .category-icon {
        width: 32px;
        height: 32px;
        margin-right: 8px;
    }
    
    .category-icon i {
        font-size: 1rem;
    }
    
    .category-title {
        font-size: 0.9rem;
    }
    
    .category-description {
        font-size: 0.7rem;
    }
    
    .category-count {
        font-size: 0.6rem;
    }
    
    .category-items {
        gap: 6px;
    }
    
    /* 手机端更简化的布局 */
    .category-items {
        grid-template-columns: repeat(2, 1fr) !important;
    }
    
    .nav-card {
        padding: 8px;
        min-height: 60px;
        border-radius: 8px;
    }
    
    .card-icon {
        width: 24px;
        height: 24px;
        margin-bottom: 4px;
    }
    
    .card-icon i {
        font-size: 0.8rem;
    }
    
    .card-content h4 {
        font-size: 0.7rem;
    }
    
    .card-content p {
        font-size: 0.55rem;
    }
    
    .position-indicator,
    .nav-controls {
        position: relative;
        top: auto;
        right: auto;
        left: auto;
        margin: 10px;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
    }

    .control-info {
        flex-basis: 100%;
        margin-top: 10px;
        text-align: center;
    }
}
</style>
