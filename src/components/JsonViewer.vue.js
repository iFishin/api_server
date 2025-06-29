import { computed } from 'vue';
const props = defineProps();
const prettyJson = computed(() => typeof props.value === 'string'
    ? props.value
    : JSON.stringify(props.value, null, 2));
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({
    ...{ class: "json-viewer" },
});
(__VLS_ctx.prettyJson);
/** @type {__VLS_StyleScopedClasses['json-viewer']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            prettyJson: prettyJson,
        };
    },
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
