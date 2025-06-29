import { computed } from 'vue';
const props = defineProps();
const schemaType = computed(() => {
    const schema = props.param.schema;
    if (schema.format)
        return `${schema.type} (${schema.format})`;
    return schema.type;
});
const example = computed(() => props.param.schema.example ?? '');
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "param-detail" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "param-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "param-name-badge" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "param-icon" },
});
(__VLS_ctx.param.name);
if (__VLS_ctx.param.required) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "param-required-badge" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "param-type-badge" },
});
(__VLS_ctx.schemaType);
if (__VLS_ctx.param.description) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "param-description" },
    });
    (__VLS_ctx.param.description);
}
if (__VLS_ctx.example) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "param-example" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "example-badge" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.code, __VLS_intrinsicElements.code)({});
    (__VLS_ctx.example);
}
/** @type {__VLS_StyleScopedClasses['param-detail']} */ ;
/** @type {__VLS_StyleScopedClasses['param-header']} */ ;
/** @type {__VLS_StyleScopedClasses['param-name-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['param-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['param-required-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['param-type-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['param-description']} */ ;
/** @type {__VLS_StyleScopedClasses['param-example']} */ ;
/** @type {__VLS_StyleScopedClasses['example-badge']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            schemaType: schemaType,
            example: example,
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
