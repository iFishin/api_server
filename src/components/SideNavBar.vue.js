import { defineComponent, computed } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
export default defineComponent({
    name: 'SideNavBar',
    setup() {
        const store = useStore();
        const route = useRoute();
        const currentPageTitle = computed(() => store.state?.currentPageTitle || 'Home');
        const isHomePage = computed(() => route.path === '/' || route.path === '/home');
        const categories = computed(() => {
            const currentRoute = route.path.replace(/^\//, '').toLowerCase();
            // 根据当前路由返回不同的分类
            switch (currentRoute) {
                case 'toolkit':
                    return [
                        { id: 'text', name: 'Text Tools', icon: 'fas fa-font', path: '/toolkit?category=text' },
                        { id: 'converter', name: 'Converters', icon: 'fas fa-exchange-alt', path: '/toolkit?category=converter' },
                        { id: 'generator', name: 'Generators', icon: 'fas fa-magic', path: '/toolkit?category=generator' },
                        { id: 'encoder', name: 'Encoders', icon: 'fas fa-lock', path: '/toolkit?category=encoder' },
                        { id: 'network', name: 'Network', icon: 'fas fa-network-wired', path: '/toolkit?category=network' },
                        { id: 'dev', name: 'Development', icon: 'fas fa-code', path: '/toolkit?category=dev' }
                    ];
                case 'http':
                    return store?.state.httpCategories || [
                        { id: 'get', name: 'GET APIs', icon: 'fas fa-download', path: '/http?category=get' },
                        { id: 'post', name: 'POST APIs', icon: 'fas fa-upload', path: '/http?category=post' },
                        { id: 'put', name: 'PUT APIs', icon: 'fas fa-edit', path: '/http?category=put' },
                        { id: 'delete', name: 'DELETE APIs', icon: 'fas fa-trash', path: '/http?category=delete' }
                    ];
                case 'mqtt':
                    return store?.state.mqttCategories || [
                        { id: 'publish', name: 'Publish', icon: 'fas fa-paper-plane', path: '/mqtt?category=publish' },
                        { id: 'subscribe', name: 'Subscribe', icon: 'fas fa-rss', path: '/mqtt?category=subscribe' },
                        { id: 'connection', name: 'Connection', icon: 'fas fa-plug', path: '/mqtt?category=connection' }
                    ];
                case 'tcp_udp':
                    return store?.state.tcpUdpCategories || [
                        { id: 'tcp', name: 'TCP Services', icon: 'fas fa-network-wired', path: '/tcp_udp?category=tcp' },
                        { id: 'udp', name: 'UDP Services', icon: 'fas fa-broadcast-tower', path: '/tcp_udp?category=udp' }
                    ];
                case 'users':
                    return store?.state.userCategories || [
                        { id: 'management', name: 'User Management', icon: 'fas fa-users-cog', path: '/users?category=management' },
                        { id: 'auth', name: 'Authentication', icon: 'fas fa-key', path: '/users?category=auth' },
                        { id: 'profile', name: 'Profile', icon: 'fas fa-user-circle', path: '/users?category=profile' }
                    ];
                case 'webdav':
                    return store?.state.webdavCategories || [
                        { id: 'files', name: 'File Management', icon: 'fas fa-folder', path: '/webdav?category=files' },
                        { id: 'upload', name: 'Upload', icon: 'fas fa-cloud-upload-alt', path: '/webdav?category=upload' },
                        { id: 'download', name: 'Download', icon: 'fas fa-cloud-download-alt', path: '/webdav?category=download' }
                    ];
                default:
                    return store?.state.categories || [];
            }
        });
        // 检查当前链接是否为活跃状态
        const isActiveLink = (categoryPath) => {
            const currentPath = route.path;
            const currentQuery = route.query.category;
            // 解析链接中的查询参数
            const [linkPath, linkQuery] = categoryPath.split('?');
            const linkCategory = linkQuery ? new URLSearchParams(linkQuery).get('category') : null;
            // 如果路径匹配且查询参数也匹配（或都没有查询参数）
            return currentPath === linkPath && currentQuery === linkCategory;
        };
        return {
            categories,
            currentPageTitle,
            isHomePage,
            isActiveLink
        };
    }
});
debugger; /* PartiallyEnd: #3632/script.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['sidebar-header']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['active-link']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['active-link']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['active-link']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-header']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sidebar" },
});
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (!__VLS_ctx.isHomePage) }, null, null);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sidebar-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
(__VLS_ctx.currentPageTitle);
__VLS_asFunctionalElement(__VLS_intrinsicElements.nav, __VLS_intrinsicElements.nav)({
    ...{ class: "sidebar-nav" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
for (const [category] of __VLS_getVForSourceType((__VLS_ctx.categories))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
        key: (category.id),
    });
    const __VLS_0 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        to: (category.path || ('/' + category.name.toLowerCase())),
        ...{ class: ({ 'active-link': __VLS_ctx.isActiveLink(category.path || ('/' + category.name.toLowerCase())) }) },
        custom: true,
    }));
    const __VLS_2 = __VLS_1({
        to: (category.path || ('/' + category.name.toLowerCase())),
        ...{ class: ({ 'active-link': __VLS_ctx.isActiveLink(category.path || ('/' + category.name.toLowerCase())) }) },
        custom: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    {
        const { default: __VLS_thisSlot } = __VLS_3.slots;
        const [{ navigate }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
            ...{ onClick: (navigate) },
            ...{ class: "nav-link" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
            ...{ class: (category.icon || 'fas fa-circle') },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (category.name);
        __VLS_3.slots['' /* empty slot name completion */];
    }
    var __VLS_3;
}
/** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-header']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['active-link']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
var __VLS_dollars;
let __VLS_self;
