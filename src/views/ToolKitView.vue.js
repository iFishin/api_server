import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
// 导入工具组件
import JsonFormatter from '../components/tools/JsonFormatter.vue';
import Base64Converter from '../components/tools/Base64Converter.vue';
import UrlEncoder from '../components/tools/UrlEncoder.vue';
import TimestampConverter from '../components/tools/TimestampConverter.vue';
import HashGenerator from '../components/tools/HashGenerator.vue';
import UuidGenerator from '../components/tools/UuidGenerator.vue';
import StringGenerator from '../components/tools/StringGenerator.vue';
import JiraExtractor from '../components/tools/JiraExtractor.vue';
const store = useStore();
const route = useRoute();
const router = useRouter();
// 响应式数据
const activeCategory = ref(''); // 初始为空，表示显示头部介绍页面
const activeTool = ref(null);
const showHeader = ref(true); // 控制是否显示头部
// 工具分类
const toolCategories = ref([
    { id: 'text', name: 'Text Tools', icon: 'fas fa-font' },
    { id: 'converter', name: 'Converters', icon: 'fas fa-exchange-alt' },
    { id: 'generator', name: 'Generators', icon: 'fas fa-magic' },
    { id: 'encoder', name: 'Encoders', icon: 'fas fa-lock' },
    { id: 'network', name: 'Network', icon: 'fas fa-network-wired' },
    { id: 'dev', name: 'Development', icon: 'fas fa-code' }
]);
// 工具列表
const tools = ref([
    // Text Tools
    {
        id: 'json-formatter',
        name: 'JSON Formatter',
        description: 'Format, validate and beautify JSON data',
        icon: 'fab fa-js-square',
        category: 'text',
        tags: ['JSON', 'Format', 'Validate'],
        component: JsonFormatter
    },
    {
        id: 'text-diff',
        name: 'Text Diff',
        description: 'Compare two text blocks and highlight differences',
        icon: 'fas fa-copy',
        category: 'text',
        tags: ['Diff', 'Compare', 'Text']
    },
    {
        id: 'string-generator',
        name: 'String Generator',
        description: 'Generate random strings with custom length and character sets',
        icon: 'fas fa-dice',
        category: 'text',
        tags: ['String', 'Random', 'Generate'],
        component: StringGenerator
    },
    {
        id: 'jira-extractor',
        name: 'JIRA Extractor',
        description: 'Extract JIRA ticket numbers and generate search expressions',
        icon: 'fas fa-tags',
        category: 'text',
        tags: ['JIRA', 'Regex', 'Extract'],
        component: JiraExtractor
    },
    // Converters
    {
        id: 'base64-converter',
        name: 'Base64 Converter',
        description: 'Encode and decode Base64 strings',
        icon: 'fas fa-exchange-alt',
        category: 'converter',
        tags: ['Base64', 'Encode', 'Decode'],
        component: Base64Converter
    },
    {
        id: 'url-encoder',
        name: 'URL Encoder/Decoder',
        description: 'Encode and decode URL components',
        icon: 'fas fa-link',
        category: 'converter',
        tags: ['URL', 'Encode', 'Decode'],
        component: UrlEncoder
    },
    {
        id: 'timestamp-converter',
        name: 'Timestamp Converter',
        description: 'Convert between timestamp and human readable date',
        icon: 'fas fa-clock',
        category: 'converter',
        tags: ['Timestamp', 'Date', 'Time'],
        component: TimestampConverter
    },
    // Generators
    {
        id: 'uuid-generator',
        name: 'UUID Generator',
        description: 'Generate various types of UUIDs',
        icon: 'fas fa-fingerprint',
        category: 'generator',
        tags: ['UUID', 'GUID', 'ID'],
        component: UuidGenerator
    },
    {
        id: 'password-generator',
        name: 'Password Generator',
        description: 'Generate secure random passwords',
        icon: 'fas fa-key',
        category: 'generator',
        tags: ['Password', 'Security', 'Random']
    },
    // Encoders
    {
        id: 'hash-generator',
        name: 'Hash Generator',
        description: 'Generate MD5, SHA1, SHA256 and other hashes',
        icon: 'fas fa-hashtag',
        category: 'encoder',
        tags: ['Hash', 'MD5', 'SHA'],
        component: HashGenerator
    },
    {
        id: 'jwt-decoder',
        name: 'JWT Decoder',
        description: 'Decode and verify JSON Web Tokens',
        icon: 'fas fa-shield',
        category: 'encoder',
        tags: ['JWT', 'Token', 'Auth']
    },
    // Network
    {
        id: 'ip-lookup',
        name: 'IP Lookup',
        description: 'Get information about IP addresses',
        icon: 'fas fa-globe',
        category: 'network',
        tags: ['IP', 'Location', 'Network']
    },
    {
        id: 'port-scanner',
        name: 'Port Scanner',
        description: 'Scan open ports on target hosts',
        icon: 'fas fa-wifi',
        category: 'network',
        tags: ['Port', 'Scan', 'Network']
    },
    // Development
    {
        id: 'regex-tester',
        name: 'Regex Tester',
        description: 'Test and debug regular expressions',
        icon: 'fas fa-search',
        category: 'dev',
        tags: ['Regex', 'Pattern', 'Test']
    },
    {
        id: 'api-tester',
        name: 'API Tester',
        description: 'Test REST APIs with custom requests',
        icon: 'fas fa-plug',
        category: 'dev',
        tags: ['API', 'HTTP', 'REST']
    }
]);
// 计算属性
const filteredTools = computed(() => {
    if (!activeCategory.value) {
        return []; // 如果没有选择分类，返回空数组
    }
    return tools.value.filter(tool => tool.category === activeCategory.value);
});
const selectedTool = computed(() => {
    return tools.value.find(tool => tool.id === activeTool.value);
});
const popularTools = computed(() => {
    // 返回一些热门工具
    return tools.value.filter(tool => ['jira-extractor', 'string-generator'].includes(tool.id)).slice(0, 4);
});
// 新增：判断是否显示头部
const shouldShowHeader = computed(() => {
    return !activeCategory.value && !activeTool.value;
});
// 方法
const selectTool = (tool) => {
    activeTool.value = tool.id;
};
const selectCategory = (categoryId) => {
    activeCategory.value = categoryId;
    showHeader.value = false;
    // 更新 URL 参数
    router.push({ query: { category: categoryId } });
};
const closeTool = () => {
    activeTool.value = null;
};
const backToHome = () => {
    activeCategory.value = '';
    activeTool.value = null;
    showHeader.value = true;
    // 清除 URL 参数
    router.push({ query: {} });
};
const getCurrentCategoryName = () => {
    const category = toolCategories.value.find(cat => cat.id === activeCategory.value);
    return category ? category.name : activeCategory.value;
};
// 生命周期
onMounted(() => {
    store.dispatch('updatePageTitle', 'ToolKit');
    store.dispatch('initializeCategories', {
        route: 'toolkit',
        categories: toolCategories.value
    });
    // 根据URL查询参数设置初始分类（如果有的话）
    const categoryFromQuery = route.query.category;
    if (categoryFromQuery && toolCategories.value.some(cat => cat.id === categoryFromQuery)) {
        activeCategory.value = categoryFromQuery;
        showHeader.value = false;
    }
});
// 监听路由查询参数变化
watch(() => route.query.category, (newCategory) => {
    if (newCategory && typeof newCategory === 'string') {
        activeCategory.value = newCategory;
        showHeader.value = false;
    }
    else if (!newCategory) {
        // 如果查询参数被清除，回到首页
        backToHome();
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['float-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['title-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-access-title']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-tool']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-tool']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-tool']} */ ;
/** @type {__VLS_StyleScopedClasses['categories-title']} */ ;
/** @type {__VLS_StyleScopedClasses['category-card']} */ ;
/** @type {__VLS_StyleScopedClasses['category-info']} */ ;
/** @type {__VLS_StyleScopedClasses['category-info']} */ ;
/** @type {__VLS_StyleScopedClasses['category-card']} */ ;
/** @type {__VLS_StyleScopedClasses['category-arrow']} */ ;
/** @type {__VLS_StyleScopedClasses['back-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['back-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-title']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-card']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-card']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-info']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-info']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-header']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-header-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-header-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['header-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['close-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['close-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['close-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['tools-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['tools-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['toolkit-container']} */ ;
/** @type {__VLS_StyleScopedClasses['toolkit-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-main']} */ ;
/** @type {__VLS_StyleScopedClasses['header-info']} */ ;
/** @type {__VLS_StyleScopedClasses['title-section']} */ ;
/** @type {__VLS_StyleScopedClasses['title-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['title-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['main-title']} */ ;
/** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-badges']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-container']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-number']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-access']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-tools']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-tool']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-tool']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-tool']} */ ;
/** @type {__VLS_StyleScopedClasses['tools-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-card']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-info']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-info']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-header']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-header-left']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-header-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-header-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-title']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-description']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-header-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['categories-section']} */ ;
/** @type {__VLS_StyleScopedClasses['categories-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['category-card']} */ ;
/** @type {__VLS_StyleScopedClasses['category-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['category-info']} */ ;
/** @type {__VLS_StyleScopedClasses['category-info']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-header']} */ ;
/** @type {__VLS_StyleScopedClasses['back-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-title']} */ ;
/** @type {__VLS_StyleScopedClasses['toolkit-header']} */ ;
/** @type {__VLS_StyleScopedClasses['title-section']} */ ;
/** @type {__VLS_StyleScopedClasses['title-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['main-title']} */ ;
/** @type {__VLS_StyleScopedClasses['title-normal']} */ ;
/** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-badges']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-container']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-number']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-tools']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-tool']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-tool']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-tool']} */ ;
/** @type {__VLS_StyleScopedClasses['tools-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-card']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-info']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-info']} */ ;
/** @type {__VLS_StyleScopedClasses['tag']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-header']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-header-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-header-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-title']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-description']} */ ;
/** @type {__VLS_StyleScopedClasses['header-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['categories-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['category-card']} */ ;
/** @type {__VLS_StyleScopedClasses['category-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['category-info']} */ ;
/** @type {__VLS_StyleScopedClasses['category-info']} */ ;
/** @type {__VLS_StyleScopedClasses['back-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-title']} */ ;
/** @type {__VLS_StyleScopedClasses['close-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['close-btn']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "toolkit-view" },
});
if (__VLS_ctx.shouldShowHeader) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "toolkit-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "header-background" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bg-pattern" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "floating-icons" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "float-icon" },
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fas fa-code" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "float-icon" },
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fas fa-tools" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "float-icon" },
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fas fa-magic" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "float-icon" },
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fas fa-rocket" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "float-icon" },
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fas fa-bolt" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "header-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "header-main" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "header-info" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "title-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "title-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fas fa-wrench" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "icon-glow" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "title-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
        ...{ class: "main-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "title-gradient" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "title-normal" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "title-underline" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "subtitle" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fas fa-star subtitle-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "feature-badges" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "feature-badge" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fas fa-bolt" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "feature-badge" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fas fa-lock" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "feature-badge" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fas fa-mobile-alt" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "header-stats" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stats-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fas fa-tools" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-pulse" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-number" },
    });
    (__VLS_ctx.tools.length);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fas fa-layer-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-pulse" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-number" },
    });
    (__VLS_ctx.toolCategories.length);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fas fa-users" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-pulse" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-number" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "quick-access" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "quick-access-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fas fa-flash" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "quick-tools" },
    });
    for (const [tool] of __VLS_getVForSourceType((__VLS_ctx.popularTools))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.shouldShowHeader))
                        return;
                    __VLS_ctx.selectTool(tool);
                } },
            key: (tool.id),
            ...{ class: "quick-tool" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
            ...{ class: (tool.icon) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (tool.name);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "categories-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "categories-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fas fa-layer-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "categories-grid" },
    });
    for (const [category] of __VLS_getVForSourceType((__VLS_ctx.toolCategories))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.shouldShowHeader))
                        return;
                    __VLS_ctx.selectCategory(category.id);
                } },
            key: (category.id),
            ...{ class: "category-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "category-icon" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
            ...{ class: (category.icon) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "category-info" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        (category.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (__VLS_ctx.tools.filter(t => t.category === category.id).length);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "category-arrow" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
            ...{ class: "fas fa-arrow-right" },
        });
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "toolkit-container" },
});
if (__VLS_ctx.activeCategory && !__VLS_ctx.activeTool) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "category-nav" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "nav-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.backToHome) },
        ...{ class: "back-btn" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fas fa-arrow-left" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "nav-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "nav-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: (__VLS_ctx.toolCategories.find(cat => cat.id === __VLS_ctx.activeCategory)?.icon) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    (__VLS_ctx.getCurrentCategoryName());
}
if (__VLS_ctx.filteredTools.length > 0 && __VLS_ctx.activeCategory) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tools-grid" },
    });
    for (const [tool] of __VLS_getVForSourceType((__VLS_ctx.filteredTools))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.filteredTools.length > 0 && __VLS_ctx.activeCategory))
                        return;
                    __VLS_ctx.selectTool(tool);
                } },
            key: (tool.id),
            ...{ class: (['tool-card', { active: __VLS_ctx.activeTool === tool.id }]) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "tool-icon" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
            ...{ class: (tool.icon) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "tool-info" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        (tool.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (tool.description);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "tool-tags" },
        });
        for (const [tag] of __VLS_getVForSourceType((tool.tags))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                key: (tag),
                ...{ class: "tag" },
            });
            (tag);
        }
    }
}
else if (__VLS_ctx.activeCategory && __VLS_ctx.filteredTools.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-state" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fas fa-search" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.getCurrentCategoryName());
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "coming-soon" },
    });
}
if (__VLS_ctx.activeTool) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tool-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tool-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tool-header-left" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tool-header-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: (__VLS_ctx.selectedTool?.icon) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tool-header-info" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
        ...{ class: "tool-title" },
    });
    (__VLS_ctx.selectedTool?.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "tool-description" },
    });
    (__VLS_ctx.selectedTool?.description);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tool-header-tags" },
    });
    for (const [tag] of __VLS_getVForSourceType((__VLS_ctx.selectedTool?.tags))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            key: (tag),
            ...{ class: "header-tag" },
        });
        (tag);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tool-header-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.closeTool) },
        ...{ class: "close-btn" },
        title: "返回工具列表",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fas fa-arrow-left" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    if (__VLS_ctx.selectedTool?.component) {
        const __VLS_0 = ((__VLS_ctx.selectedTool?.component));
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
            key: (__VLS_ctx.selectedTool.id),
        }));
        const __VLS_2 = __VLS_1({
            key: (__VLS_ctx.selectedTool.id),
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "tool-placeholder" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
            ...{ class: (__VLS_ctx.selectedTool?.icon) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        (__VLS_ctx.selectedTool?.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (__VLS_ctx.selectedTool?.description);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "coming-soon" },
        });
    }
}
/** @type {__VLS_StyleScopedClasses['toolkit-view']} */ ;
/** @type {__VLS_StyleScopedClasses['toolkit-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-background']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-pattern']} */ ;
/** @type {__VLS_StyleScopedClasses['floating-icons']} */ ;
/** @type {__VLS_StyleScopedClasses['float-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-code']} */ ;
/** @type {__VLS_StyleScopedClasses['float-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-tools']} */ ;
/** @type {__VLS_StyleScopedClasses['float-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-magic']} */ ;
/** @type {__VLS_StyleScopedClasses['float-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-rocket']} */ ;
/** @type {__VLS_StyleScopedClasses['float-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-bolt']} */ ;
/** @type {__VLS_StyleScopedClasses['header-content']} */ ;
/** @type {__VLS_StyleScopedClasses['header-main']} */ ;
/** @type {__VLS_StyleScopedClasses['header-info']} */ ;
/** @type {__VLS_StyleScopedClasses['title-section']} */ ;
/** @type {__VLS_StyleScopedClasses['title-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-wrench']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-glow']} */ ;
/** @type {__VLS_StyleScopedClasses['title-content']} */ ;
/** @type {__VLS_StyleScopedClasses['main-title']} */ ;
/** @type {__VLS_StyleScopedClasses['title-gradient']} */ ;
/** @type {__VLS_StyleScopedClasses['title-normal']} */ ;
/** @type {__VLS_StyleScopedClasses['title-underline']} */ ;
/** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-star']} */ ;
/** @type {__VLS_StyleScopedClasses['subtitle-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-badges']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-bolt']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-lock']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-mobile-alt']} */ ;
/** @type {__VLS_StyleScopedClasses['header-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-container']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-tools']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-pulse']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-content']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-number']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-layer-group']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-pulse']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-content']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-number']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-users']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-pulse']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-content']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-number']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-access']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-access-title']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-flash']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-tools']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-tool']} */ ;
/** @type {__VLS_StyleScopedClasses['categories-section']} */ ;
/** @type {__VLS_StyleScopedClasses['categories-title']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-layer-group']} */ ;
/** @type {__VLS_StyleScopedClasses['categories-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['category-card']} */ ;
/** @type {__VLS_StyleScopedClasses['category-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['category-info']} */ ;
/** @type {__VLS_StyleScopedClasses['category-arrow']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-arrow-right']} */ ;
/** @type {__VLS_StyleScopedClasses['toolkit-container']} */ ;
/** @type {__VLS_StyleScopedClasses['category-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-header']} */ ;
/** @type {__VLS_StyleScopedClasses['back-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-arrow-left']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-title']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['tools-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-card']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-info']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['tag']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-search']} */ ;
/** @type {__VLS_StyleScopedClasses['coming-soon']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-content']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-header']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-header-left']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-header-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-header-info']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-title']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-description']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-header-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['header-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['close-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-arrow-left']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['coming-soon']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            activeCategory: activeCategory,
            activeTool: activeTool,
            toolCategories: toolCategories,
            tools: tools,
            filteredTools: filteredTools,
            selectedTool: selectedTool,
            popularTools: popularTools,
            shouldShowHeader: shouldShowHeader,
            selectTool: selectTool,
            selectCategory: selectCategory,
            closeTool: closeTool,
            backToHome: backToHome,
            getCurrentCategoryName: getCurrentCategoryName,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
