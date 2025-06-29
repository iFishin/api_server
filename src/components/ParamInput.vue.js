import { ref, watch } from 'vue';
const props = defineProps();
const emit = defineEmits(['update:modelValue', 'change']);
const inputValue = ref(props.modelValue ?? '');
watch(() => props.modelValue, v => inputValue.value = v);
watch(inputValue, v => emit('change', v));
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['param-input']} */ ;
/** @type {__VLS_StyleScopedClasses['input-required']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "param-input-wrapper" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ onInput: (...[$event]) => {
            __VLS_ctx.$emit('update:modelValue', __VLS_ctx.inputValue);
        } },
    type: (__VLS_ctx.param.schema?.type === 'number' ? 'number' : 'text'),
    placeholder: (__VLS_ctx.param.description),
    required: (__VLS_ctx.param.required),
    ...{ class: "param-input" },
    step: (__VLS_ctx.param.schema?.type === 'number' ? 'any' : undefined),
    autocomplete: ('off'),
});
(__VLS_ctx.inputValue);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "input-required" },
    ...{ class: ({ visible: __VLS_ctx.param.required }) },
});
/** @type {__VLS_StyleScopedClasses['param-input-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['param-input']} */ ;
/** @type {__VLS_StyleScopedClasses['input-required']} */ ;
/** @type {__VLS_StyleScopedClasses['visible']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            inputValue: inputValue,
        };
    },
    emits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
