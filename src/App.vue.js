import HeaderNavBar from './components/HeaderNavBar.vue';
import SideNavBar from './components/SideNavBar.vue';
import ApiDocViewer from './components/ApiDocViewer.vue';
import { useRoute } from 'vue-router';
import { computed } from 'vue';
const route = useRoute();
// 路由配置 - 定义哪些页面需要显示侧边栏和API文档
const routeConfig = {
    sidebar: ['users', 'http', 'mqtt', 'tcp_udp', 'toolkit', 'webdav'],
    apiDoc: ['users', 'http', 'mqtt', 'tcp_udp']
};
const showApiDoc = computed(() => {
    const currentRoute = route.path.replace(/^\//, '').toLowerCase();
    return routeConfig.apiDoc.includes(currentRoute) || route.name?.toString().includes('api');
});
const showAside = computed(() => {
    const currentRoute = route.path.replace(/^\//, '').toLowerCase();
    return routeConfig.sidebar.includes(currentRoute);
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    id: "app",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.nav, __VLS_intrinsicElements.nav)({});
/** @type {[typeof HeaderNavBar, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(HeaderNavBar, new HeaderNavBar({}));
const __VLS_1 = __VLS_0({}, ...__VLS_functionalComponentArgsRest(__VLS_0));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "main-container" },
});
if (__VLS_ctx.showAside) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.aside, __VLS_intrinsicElements.aside)({});
    /** @type {[typeof SideNavBar, ]} */ ;
    // @ts-ignore
    const __VLS_3 = __VLS_asFunctionalComponent(SideNavBar, new SideNavBar({}));
    const __VLS_4 = __VLS_3({}, ...__VLS_functionalComponentArgsRest(__VLS_3));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({});
const __VLS_6 = {}.RouterView;
/** @type {[typeof __VLS_components.RouterView, ]} */ ;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({}));
const __VLS_8 = __VLS_7({}, ...__VLS_functionalComponentArgsRest(__VLS_7));
if (__VLS_ctx.showApiDoc) {
    /** @type {[typeof ApiDocViewer, ]} */ ;
    // @ts-ignore
    const __VLS_10 = __VLS_asFunctionalComponent(ApiDocViewer, new ApiDocViewer({
        apiGroup: "default",
    }));
    const __VLS_11 = __VLS_10({
        apiGroup: "default",
    }, ...__VLS_functionalComponentArgsRest(__VLS_10));
}
/** @type {__VLS_StyleScopedClasses['main-container']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            HeaderNavBar: HeaderNavBar,
            SideNavBar: SideNavBar,
            ApiDocViewer: ApiDocViewer,
            showApiDoc: showApiDoc,
            showAside: showAside,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
