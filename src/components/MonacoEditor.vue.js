import MonacoEditor from 'monaco-editor-vue3';
const props = defineProps();
const emit = defineEmits(['update:modelValue', 'change']);
const onChange = (val) => {
    emit('update:modelValue', val);
    emit('change', val);
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.MonacoEditor;
/** @type {[typeof __VLS_components.MonacoEditor, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onUpdate:value': {} },
    value: (__VLS_ctx.modelValue),
    language: (__VLS_ctx.language),
    options: (__VLS_ctx.options),
    ...{ class: "monaco-editor" },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onUpdate:value': {} },
    value: (__VLS_ctx.modelValue),
    language: (__VLS_ctx.language),
    options: (__VLS_ctx.options),
    ...{ class: "monaco-editor" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    'onUpdate:value': (__VLS_ctx.onChange)
};
var __VLS_8 = {};
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['monaco-editor']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            MonacoEditor: MonacoEditor,
            onChange: onChange,
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
