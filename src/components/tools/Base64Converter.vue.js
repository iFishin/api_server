import { ref, computed } from 'vue';
const inputText = ref('');
const base64Input = ref('');
const encodedOutput = ref('');
const decodedOutput = ref('');
const encodeInputType = ref('text');
const decodeOutputType = ref('text');
const decodeError = ref('');
const fileInput = ref();
const originalSize = computed(() => {
    return new Blob([inputText.value]).size;
});
const encodedSize = computed(() => {
    return new Blob([encodedOutput.value]).size;
});
const sizeIncrease = computed(() => {
    if (originalSize.value === 0)
        return 0;
    return Math.round(((encodedSize.value - originalSize.value) / originalSize.value) * 100);
});
const encodeText = () => {
    if (!inputText.value) {
        encodedOutput.value = '';
        return;
    }
    try {
        encodedOutput.value = btoa(unescape(encodeURIComponent(inputText.value)));
    }
    catch (error) {
        console.error('Encoding error:', error);
    }
};
const decodeText = () => {
    if (!base64Input.value) {
        decodedOutput.value = '';
        decodeError.value = '';
        return;
    }
    try {
        const decoded = atob(base64Input.value);
        decodedOutput.value = decodeURIComponent(escape(decoded));
        decodeError.value = '';
    }
    catch (error) {
        decodeError.value = 'Invalid Base64 string';
        decodedOutput.value = '';
    }
};
const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
        readFile(file);
    }
};
const handleFileDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) {
        readFile(file);
    }
};
const readFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
            // 对于文本文件
            inputText.value = result;
            encodeText();
        }
        else if (result instanceof ArrayBuffer) {
            // 对于二进制文件
            const bytes = new Uint8Array(result);
            const binary = String.fromCharCode(...bytes);
            encodedOutput.value = btoa(binary);
        }
    };
    if (file.type.startsWith('text/')) {
        reader.readAsText(file);
    }
    else {
        reader.readAsArrayBuffer(file);
    }
};
const handleInputTypeChange = () => {
    inputText.value = '';
    encodedOutput.value = '';
};
const clearEncode = () => {
    inputText.value = '';
    encodedOutput.value = '';
    if (fileInput.value) {
        fileInput.value.value = '';
    }
};
const clearDecode = () => {
    base64Input.value = '';
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
const downloadDecoded = () => {
    if (!base64Input.value)
        return;
    try {
        const binary = atob(base64Input.value);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes]);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'decoded-file';
        a.click();
        URL.revokeObjectURL(url);
    }
    catch (error) {
        decodeError.value = 'Failed to decode file';
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['file-drop-zone']} */ ;
/** @type {__VLS_StyleScopedClasses['converter-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['info-panel']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "base64-converter" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "converter-layout" },
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
    ...{ onClick: (__VLS_ctx.encodeText) },
    ...{ class: "btn btn-primary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    ...{ onChange: (__VLS_ctx.handleInputTypeChange) },
    value: (__VLS_ctx.encodeInputType),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "text",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "file",
});
if (__VLS_ctx.encodeInputType === 'text') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "text-input" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.textarea, __VLS_intrinsicElements.textarea)({
        ...{ onInput: (__VLS_ctx.encodeText) },
        value: (__VLS_ctx.inputText),
        placeholder: "Enter text to encode...",
        ...{ class: "input-textarea" },
    });
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "file-input" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
        ...{ onChange: (__VLS_ctx.handleFileSelect) },
        type: "file",
        ...{ class: "file-input-element" },
        ref: "fileInput",
    });
    /** @type {typeof __VLS_ctx.fileInput} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onDrop: (__VLS_ctx.handleFileDrop) },
        ...{ onDragover: () => { } },
        ...{ class: "file-drop-zone" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fas fa-cloud-upload-alt" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "output-area" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.textarea, __VLS_intrinsicElements.textarea)({
    value: (__VLS_ctx.encodedOutput),
    readonly: true,
    ...{ class: "output-textarea" },
    placeholder: "Encoded result will appear here...",
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
    ...{ onClick: (__VLS_ctx.decodeText) },
    ...{ class: "btn btn-primary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-area" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.textarea, __VLS_intrinsicElements.textarea)({
    ...{ onInput: (__VLS_ctx.decodeText) },
    value: (__VLS_ctx.base64Input),
    placeholder: "Enter Base64 string to decode...",
    ...{ class: "input-textarea" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "output-area" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "output-type-selector" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
    type: "radio",
    value: "text",
});
(__VLS_ctx.decodeOutputType);
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
    type: "radio",
    value: "download",
});
(__VLS_ctx.decodeOutputType);
if (__VLS_ctx.decodeOutputType === 'text') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.textarea, __VLS_intrinsicElements.textarea)({
        value: (__VLS_ctx.decodedOutput),
        readonly: true,
        ...{ class: "output-textarea" },
        placeholder: "Decoded result will appear here...",
    });
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "download-area" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.downloadDecoded) },
        ...{ class: "btn btn-success" },
        disabled: (!__VLS_ctx.decodedOutput),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fas fa-download" },
    });
}
if (__VLS_ctx.decodeOutputType === 'text') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.copyDecoded) },
        ...{ class: "copy-btn" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fas fa-copy" },
    });
}
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
    ...{ class: "info-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.originalSize);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.encodedSize);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.sizeIncrease);
/** @type {__VLS_StyleScopedClasses['base64-converter']} */ ;
/** @type {__VLS_StyleScopedClasses['converter-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['encode-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['text-input']} */ ;
/** @type {__VLS_StyleScopedClasses['input-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['file-input']} */ ;
/** @type {__VLS_StyleScopedClasses['file-input-element']} */ ;
/** @type {__VLS_StyleScopedClasses['file-drop-zone']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-cloud-upload-alt']} */ ;
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
/** @type {__VLS_StyleScopedClasses['output-type-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['output-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['download-area']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-success']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-download']} */ ;
/** @type {__VLS_StyleScopedClasses['copy-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['error-message']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-exclamation-triangle']} */ ;
/** @type {__VLS_StyleScopedClasses['info-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            inputText: inputText,
            base64Input: base64Input,
            encodedOutput: encodedOutput,
            decodedOutput: decodedOutput,
            encodeInputType: encodeInputType,
            decodeOutputType: decodeOutputType,
            decodeError: decodeError,
            fileInput: fileInput,
            originalSize: originalSize,
            encodedSize: encodedSize,
            sizeIncrease: sizeIncrease,
            encodeText: encodeText,
            decodeText: decodeText,
            handleFileSelect: handleFileSelect,
            handleFileDrop: handleFileDrop,
            handleInputTypeChange: handleInputTypeChange,
            clearEncode: clearEncode,
            clearDecode: clearDecode,
            copyEncoded: copyEncoded,
            copyDecoded: copyDecoded,
            downloadDecoded: downloadDecoded,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
