import { defineComponent, onMounted, watch, ref } from 'vue';
import IconApi from '../components/icons/IconApi.vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
export default defineComponent({
    name: 'HeaderNavBar',
    components: {
        IconApi
    },
    setup() {
        const store = useStore();
        const route = useRoute();
        const menuItems = ref([]);
        const menuOpen = ref(false);
        menuItems.value = ['USERS', 'HTTP', 'TCP_UDP', 'MQTT'];
        onMounted(() => {
            const apiConfig = store.state.apiConfig;
            if (apiConfig) {
                menuItems.value = Object.keys(apiConfig);
            }
        });
        const updateTitle = (title) => {
            store.commit('setCurrentPageTitle', title.substring(1));
        };
        watch(() => route.path, (newPath) => {
            updateTitle(newPath);
            menuOpen.value = false; // 自动关闭菜单
        });
        function toggleMenu() {
            menuOpen.value = !menuOpen.value;
        }
        return {
            menuItems,
            updateTitle,
            menuOpen,
            toggleMenu
        };
    }
});
debugger; /* PartiallyEnd: #3632/script.vue */
const __VLS_ctx = {};
const __VLS_componentsOption = {
    IconApi
};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['navbar-brand']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-brand']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['open']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['open']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['router-link-active']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['open']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-menu']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.nav, __VLS_intrinsicElements.nav)({
    ...{ class: "navbar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "navbar-brand" },
});
const __VLS_0 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    to: "/",
}));
const __VLS_2 = __VLS_1({
    to: "/",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.IconApi;
/** @type {[typeof __VLS_components.IconApi, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({}));
const __VLS_6 = __VLS_5({}, ...__VLS_functionalComponentArgsRest(__VLS_5));
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.toggleMenu) },
    ...{ class: "navbar-toggle" },
    'aria-label': "Toggle navigation",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: ({ open: __VLS_ctx.menuOpen }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: ({ open: __VLS_ctx.menuOpen }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: ({ open: __VLS_ctx.menuOpen }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({
    ...{ class: "navbar-menu" },
    ...{ class: ({ open: __VLS_ctx.menuOpen }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
    ...{ class: "nav-item" },
});
const __VLS_8 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    to: "/",
    ...{ class: "nav-link" },
}));
const __VLS_10 = __VLS_9({
    to: "/",
    ...{ class: "nav-link" },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "fas fa-home" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
var __VLS_11;
for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.menuItems))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
        key: (index),
        ...{ class: "nav-item" },
    });
    const __VLS_12 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        to: ('/' + item.toLowerCase()),
        ...{ class: "nav-link" },
    }));
    const __VLS_14 = __VLS_13({
        to: ('/' + item.toLowerCase()),
        ...{ class: "nav-link" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_15.slots.default;
    (item);
    var __VLS_15;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
    ...{ class: "nav-item" },
});
const __VLS_16 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    to: "/toolkit",
    ...{ class: "nav-link" },
}));
const __VLS_18 = __VLS_17({
    to: "/toolkit",
    ...{ class: "nav-link" },
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "fas fa-cog" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
var __VLS_19;
__VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
    ...{ class: "nav-item" },
});
const __VLS_20 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    to: "/webdav-ui",
    ...{ class: "nav-link" },
}));
const __VLS_22 = __VLS_21({
    to: "/webdav-ui",
    ...{ class: "nav-link" },
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "fas fa-cloud" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
var __VLS_23;
/** @type {__VLS_StyleScopedClasses['navbar']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-brand']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['open']} */ ;
/** @type {__VLS_StyleScopedClasses['open']} */ ;
/** @type {__VLS_StyleScopedClasses['open']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['open']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-item']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-home']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-item']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-item']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-cog']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-item']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-cloud']} */ ;
var __VLS_dollars;
let __VLS_self;
