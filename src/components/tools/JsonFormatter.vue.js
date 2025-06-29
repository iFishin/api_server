import { ref, computed } from 'vue';
const inputJson = ref('');
const outputJson = ref('');
const validationError = ref('');
const indentSize = ref('2');
const sortKeys = ref(false);
const compactMode = ref(false);
const formattedJson = computed(() => {
    if (!outputJson.value)
        return '';
    return highlightJson(outputJson.value);
});
const validateJson = () => {
    if (!inputJson.value.trim()) {
        validationError.value = '';
        outputJson.value = '';
        return;
    }
    try {
        JSON.parse(inputJson.value);
        validationError.value = '';
    }
    catch (error) {
        validationError.value = `Invalid JSON: ${error.message}`;
    }
};
const formatJson = () => {
    if (!inputJson.value.trim()) {
        outputJson.value = '';
        return;
    }
    try {
        let parsed = JSON.parse(inputJson.value);
        if (sortKeys.value) {
            parsed = sortObjectKeys(parsed);
        }
        const indent = indentSize.value === '\t' ? '\t' : parseInt(indentSize.value);
        outputJson.value = compactMode.value
            ? JSON.stringify(parsed)
            : JSON.stringify(parsed, null, indent);
        validationError.value = '';
    }
    catch (error) {
        validationError.value = `Error formatting JSON: ${error.message}`;
    }
};
const sortObjectKeys = (obj) => {
    if (obj === null || typeof obj !== 'object')
        return obj;
    if (Array.isArray(obj)) {
        return obj.map(sortObjectKeys);
    }
    const sorted = {};
    Object.keys(obj).sort().forEach(key => {
        sorted[key] = sortObjectKeys(obj[key]);
    });
    return sorted;
};
const highlightJson = (jsonString) => {
    return jsonString
        .replace(/(".*?")\s*:/g, '<span class="json-key">$1</span>:')
        .replace(/:\s*(".*?")/g, ': <span class="json-string">$1</span>')
        .replace(/:\s*(true|false)/g, ': <span class="json-boolean">$1</span>')
        .replace(/:\s*(null)/g, ': <span class="json-null">$1</span>')
        .replace(/:\s*(\d+)/g, ': <span class="json-number">$1</span>');
};
const clearInput = () => {
    inputJson.value = '';
    outputJson.value = '';
    validationError.value = '';
};
const copyOutput = async () => {
    if (outputJson.value) {
        try {
            await navigator.clipboard.writeText(outputJson.value);
            // 可以添加toast提示
        }
        catch (err) {
            console.error('Failed to copy:', err);
        }
    }
};
const downloadJson = () => {
    if (outputJson.value) {
        const blob = new Blob([outputJson.value], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'formatted.json';
        a.click();
        URL.revokeObjectURL(url);
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['option-group']} */ ;
/** @type {__VLS_StyleScopedClasses['option-group']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['options-panel']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "json-formatter" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tool-layout" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.clearInput) },
    ...{ class: "btn btn-secondary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.formatJson) },
    ...{ class: "btn btn-primary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.textarea, __VLS_intrinsicElements.textarea)({
    ...{ onInput: (__VLS_ctx.validateJson) },
    value: (__VLS_ctx.inputJson),
    placeholder: "Paste your JSON here...",
    ...{ class: "json-input" },
});
if (__VLS_ctx.validationError) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "error-message" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fas fa-exclamation-triangle" },
    });
    (__VLS_ctx.validationError);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "output-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.copyOutput) },
    ...{ class: "btn btn-secondary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "fas fa-copy" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.downloadJson) },
    ...{ class: "btn btn-secondary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "fas fa-download" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({
    ...{ class: "json-output" },
});
__VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.formattedJson) }, null, null);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "options-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "option-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    ...{ onChange: (__VLS_ctx.formatJson) },
    value: (__VLS_ctx.indentSize),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "2",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "4",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "\u005c\u0074",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "option-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
    ...{ onChange: (__VLS_ctx.formatJson) },
    type: "checkbox",
});
(__VLS_ctx.sortKeys);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "option-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
    ...{ onChange: (__VLS_ctx.formatJson) },
    type: "checkbox",
});
(__VLS_ctx.compactMode);
/** @type {__VLS_StyleScopedClasses['json-formatter']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['input-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['json-input']} */ ;
/** @type {__VLS_StyleScopedClasses['error-message']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-exclamation-triangle']} */ ;
/** @type {__VLS_StyleScopedClasses['output-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-download']} */ ;
/** @type {__VLS_StyleScopedClasses['json-output']} */ ;
/** @type {__VLS_StyleScopedClasses['options-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['option-group']} */ ;
/** @type {__VLS_StyleScopedClasses['option-group']} */ ;
/** @type {__VLS_StyleScopedClasses['option-group']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            inputJson: inputJson,
            validationError: validationError,
            indentSize: indentSize,
            sortKeys: sortKeys,
            compactMode: compactMode,
            formattedJson: formattedJson,
            validateJson: validateJson,
            formatJson: formatJson,
            clearInput: clearInput,
            copyOutput: copyOutput,
            downloadJson: downloadJson,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
