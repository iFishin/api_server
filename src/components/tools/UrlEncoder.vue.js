import { ref, computed } from 'vue';
const inputUrl = ref('');
const encodedInput = ref('');
const encodedOutput = ref('');
const decodedOutput = ref('');
const decodeError = ref('');
const encodingType = ref('component');
const encodeSpaceAsPlus = ref(false);
const urlAnalysis = computed(() => {
    if (!inputUrl.value || !isValidUrl(inputUrl.value))
        return null;
    try {
        return new URL(inputUrl.value);
    }
    catch {
        return null;
    }
});
const isValidUrl = (string) => {
    try {
        new URL(string);
        return true;
    }
    catch {
        return false;
    }
};
const encodeUrl = () => {
    if (!inputUrl.value) {
        encodedOutput.value = '';
        return;
    }
    try {
        let result = '';
        if (encodingType.value === 'component') {
            result = encodeURIComponent(inputUrl.value);
        }
        else {
            result = encodeURI(inputUrl.value);
        }
        if (encodeSpaceAsPlus.value) {
            result = result.replace(/%20/g, '+');
        }
        encodedOutput.value = result;
    }
    catch (error) {
        console.error('Encoding error:', error);
    }
};
const decodeUrl = () => {
    if (!encodedInput.value) {
        decodedOutput.value = '';
        decodeError.value = '';
        return;
    }
    try {
        let input = encodedInput.value;
        // 处理 + 号
        if (input.includes('+')) {
            input = input.replace(/\+/g, '%20');
        }
        decodedOutput.value = decodeURIComponent(input);
        decodeError.value = '';
    }
    catch (error) {
        decodeError.value = 'Invalid encoded URL';
        decodedOutput.value = '';
    }
};
const clearEncode = () => {
    inputUrl.value = '';
    encodedOutput.value = '';
};
const clearDecode = () => {
    encodedInput.value = '';
    decodedOutput.value = '';
    decodeError.value = '';
};
const copyEncoded = async () => {
    if (encodedOutput.value) {
        try {
            await navigator.clipboard.writeText(encodedOutput.value);
        }
        catch (err) {
            console.error('Failed to copy:', err);
        }
    }
};
const copyDecoded = async () => {
    if (decodedOutput.value) {
        try {
            await navigator.clipboard.writeText(decodedOutput.value);
        }
        catch (err) {
            console.error('Failed to copy:', err);
        }
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['encoder-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['options-panel']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "url-encoder" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "encoder-layout" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "encode-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.clearEncode) },
    ...{ class: "btn btn-secondary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.encodeUrl) },
    ...{ class: "btn btn-primary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-area" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.textarea, __VLS_intrinsicElements.textarea)({
    ...{ onInput: (__VLS_ctx.encodeUrl) },
    value: (__VLS_ctx.inputUrl),
    placeholder: "Enter URL or text to encode...",
    ...{ class: "input-textarea" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "output-area" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.textarea, __VLS_intrinsicElements.textarea)({
    value: (__VLS_ctx.encodedOutput),
    readonly: true,
    ...{ class: "output-textarea" },
    placeholder: "Encoded URL will appear here...",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.copyEncoded) },
    ...{ class: "copy-btn" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "fas fa-copy" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "decode-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.clearDecode) },
    ...{ class: "btn btn-secondary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.decodeUrl) },
    ...{ class: "btn btn-primary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-area" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.textarea, __VLS_intrinsicElements.textarea)({
    ...{ onInput: (__VLS_ctx.decodeUrl) },
    value: (__VLS_ctx.encodedInput),
    placeholder: "Enter encoded URL to decode...",
    ...{ class: "input-textarea" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "output-area" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.textarea, __VLS_intrinsicElements.textarea)({
    value: (__VLS_ctx.decodedOutput),
    readonly: true,
    ...{ class: "output-textarea" },
    placeholder: "Decoded URL will appear here...",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.copyDecoded) },
    ...{ class: "copy-btn" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "fas fa-copy" },
});
if (__VLS_ctx.decodeError) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "error-message" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fas fa-exclamation-triangle" },
    });
    (__VLS_ctx.decodeError);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "options-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "option-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    ...{ onChange: (__VLS_ctx.encodeUrl) },
    value: (__VLS_ctx.encodingType),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "component",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "uri",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "option-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
    ...{ onChange: (__VLS_ctx.encodeUrl) },
    type: "checkbox",
});
(__VLS_ctx.encodeSpaceAsPlus);
if (__VLS_ctx.urlAnalysis) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "analysis-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "analysis-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "analysis-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.urlAnalysis.protocol);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "analysis-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.urlAnalysis.host);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "analysis-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.urlAnalysis.port || 'default');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "analysis-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.urlAnalysis.pathname);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "analysis-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.urlAnalysis.search);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "analysis-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.urlAnalysis.hash);
}
/** @type {__VLS_StyleScopedClasses['url-encoder']} */ ;
/** @type {__VLS_StyleScopedClasses['encoder-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['encode-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['input-area']} */ ;
/** @type {__VLS_StyleScopedClasses['input-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['output-area']} */ ;
/** @type {__VLS_StyleScopedClasses['output-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['copy-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['decode-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['input-area']} */ ;
/** @type {__VLS_StyleScopedClasses['input-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['output-area']} */ ;
/** @type {__VLS_StyleScopedClasses['output-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['copy-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['error-message']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-exclamation-triangle']} */ ;
/** @type {__VLS_StyleScopedClasses['options-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['option-group']} */ ;
/** @type {__VLS_StyleScopedClasses['option-group']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-item']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-item']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-item']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-item']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-item']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-item']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            inputUrl: inputUrl,
            encodedInput: encodedInput,
            encodedOutput: encodedOutput,
            decodedOutput: decodedOutput,
            decodeError: decodeError,
            encodingType: encodingType,
            encodeSpaceAsPlus: encodeSpaceAsPlus,
            urlAnalysis: urlAnalysis,
            encodeUrl: encodeUrl,
            decodeUrl: decodeUrl,
            clearEncode: clearEncode,
            clearDecode: clearDecode,
            copyEncoded: copyEncoded,
            copyDecoded: copyDecoded,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
