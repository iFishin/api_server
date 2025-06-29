import { ref, computed, watch } from 'vue';
// 响应式数据
const length = ref(12);
const maxLength = ref(1000); // 滑块最大值
const includeUppercase = ref(true);
const includeLowercase = ref(true);
const includeNumbers = ref(true);
const includeSymbols = ref(false);
const includeSpace = ref(false);
const customCharacters = ref('');
const excludeSimilar = ref(false);
const generatedString = ref('');
const batchResults = ref([]);
const copyStatus = ref(''); // 复制状态提示
// 字符集定义
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const SIMILAR_CHARS = '0Ol1I';
// 计算属性
const availableChars = computed(() => {
    let chars = '';
    if (includeUppercase.value)
        chars += UPPERCASE;
    if (includeLowercase.value)
        chars += LOWERCASE;
    if (includeNumbers.value)
        chars += NUMBERS;
    if (includeSymbols.value)
        chars += SYMBOLS;
    if (includeSpace.value)
        chars += ' ';
    if (customCharacters.value)
        chars += customCharacters.value;
    if (excludeSimilar.value) {
        chars = chars.split('').filter(char => !SIMILAR_CHARS.includes(char)).join('');
    }
    // 去重
    return [...new Set(chars.split(''))].join('');
});
const hasValidCharSet = computed(() => {
    return availableChars.value.length > 0;
});
// 监听最大值变化，确保当前长度不超过最大值
watch(maxLength, (newMax) => {
    if (length.value > newMax) {
        length.value = newMax;
    }
}, { immediate: true });
// 方法
const generateString = () => {
    if (!hasValidCharSet.value)
        return;
    let result = '';
    const chars = availableChars.value;
    for (let i = 0; i < length.value; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    generatedString.value = result;
    batchResults.value = []; // 清空批量结果
};
const generateMultiple = () => {
    if (!hasValidCharSet.value)
        return;
    const results = [];
    for (let i = 0; i < 10; i++) {
        let result = '';
        const chars = availableChars.value;
        for (let j = 0; j < length.value; j++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        results.push(result);
    }
    batchResults.value = results;
    generatedString.value = ''; // 清空单个结果
};
const getCharSetInfo = () => {
    const sets = [];
    if (includeUppercase.value)
        sets.push('大写');
    if (includeLowercase.value)
        sets.push('小写');
    if (includeNumbers.value)
        sets.push('数字');
    if (includeSymbols.value)
        sets.push('符号');
    if (includeSpace.value)
        sets.push('空格');
    if (customCharacters.value)
        sets.push('自定义');
    return sets.join(', ') || '无';
};
const copyToClipboard = async (text) => {
    try {
        // 首先尝试使用现代 Clipboard API
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            console.log('复制成功:', text.slice(0, 20) + (text.length > 20 ? '...' : ''));
            showCopyStatus('复制成功!');
            return;
        }
        // 回退到传统方法
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (successful) {
            console.log('复制成功:', text.slice(0, 20) + (text.length > 20 ? '...' : ''));
            showCopyStatus('复制成功!');
        }
        else {
            throw new Error('复制命令执行失败');
        }
    }
    catch (err) {
        console.error('复制失败:', err);
        showCopyStatus('复制失败，请手动复制');
        // 最后的回退：提示用户手动复制
        setTimeout(() => {
            const result = prompt('自动复制失败，请手动复制以下内容:', text);
            if (result !== null) {
                console.log('用户已查看内容');
            }
        }, 100);
    }
};
const showCopyStatus = (message) => {
    copyStatus.value = message;
    setTimeout(() => {
        copyStatus.value = '';
    }, 2000);
};
const copyAllToClipboard = async () => {
    const allText = batchResults.value.join('\n');
    await copyToClipboard(allText);
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['controls-section']} */ ;
/** @type {__VLS_StyleScopedClasses['controls-section']} */ ;
/** @type {__VLS_StyleScopedClasses['output-section']} */ ;
/** @type {__VLS_StyleScopedClasses['controls-section']} */ ;
/** @type {__VLS_StyleScopedClasses['output-section']} */ ;
/** @type {__VLS_StyleScopedClasses['controls-section']} */ ;
/** @type {__VLS_StyleScopedClasses['output-section']} */ ;
/** @type {__VLS_StyleScopedClasses['controls-section']} */ ;
/** @type {__VLS_StyleScopedClasses['controls-section']} */ ;
/** @type {__VLS_StyleScopedClasses['control-group']} */ ;
/** @type {__VLS_StyleScopedClasses['length-labels']} */ ;
/** @type {__VLS_StyleScopedClasses['length-input']} */ ;
/** @type {__VLS_StyleScopedClasses['length-slider']} */ ;
/** @type {__VLS_StyleScopedClasses['length-slider']} */ ;
/** @type {__VLS_StyleScopedClasses['length-slider']} */ ;
/** @type {__VLS_StyleScopedClasses['max-length-input']} */ ;
/** @type {__VLS_StyleScopedClasses['length-info']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-item']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-item']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-checkbox']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-item']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-checkbox']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-item']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-checkbox']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-item']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-checkbox']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-input']} */ ;
/** @type {__VLS_StyleScopedClasses['generate-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['generate-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['batch-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['batch-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['generate-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['batch-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['output-section']} */ ;
/** @type {__VLS_StyleScopedClasses['output-section']} */ ;
/** @type {__VLS_StyleScopedClasses['copy-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['copy-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['copy-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['copy-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['result-content']} */ ;
/** @type {__VLS_StyleScopedClasses['result-content']} */ ;
/** @type {__VLS_StyleScopedClasses['batch-item']} */ ;
/** @type {__VLS_StyleScopedClasses['batch-item']} */ ;
/** @type {__VLS_StyleScopedClasses['batch-item']} */ ;
/** @type {__VLS_StyleScopedClasses['batch-item']} */ ;
/** @type {__VLS_StyleScopedClasses['copy-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['charset-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['charset-display']} */ ;
/** @type {__VLS_StyleScopedClasses['charset-display']} */ ;
/** @type {__VLS_StyleScopedClasses['generator-container']} */ ;
/** @type {__VLS_StyleScopedClasses['action-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['string-generator']} */ ;
/** @type {__VLS_StyleScopedClasses['controls-section']} */ ;
/** @type {__VLS_StyleScopedClasses['output-section']} */ ;
/** @type {__VLS_StyleScopedClasses['length-controls']} */ ;
/** @type {__VLS_StyleScopedClasses['length-labels']} */ ;
/** @type {__VLS_StyleScopedClasses['slider-container']} */ ;
/** @type {__VLS_StyleScopedClasses['max-length-control']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "string-generator" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "generator-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "controls-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "fas fa-dice" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "description" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "control-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "length-labels" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    for: "length",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    for: "maxLength",
    ...{ class: "max-length-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "length-controls" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    id: "length",
    type: "number",
    min: "1",
    max: (__VLS_ctx.maxLength),
    ...{ class: "length-input" },
});
(__VLS_ctx.length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "slider-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    type: "range",
    min: "1",
    max: (__VLS_ctx.maxLength),
    ...{ class: "length-slider" },
});
(__VLS_ctx.length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "slider-labels" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "slider-min" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "slider-max" },
});
(__VLS_ctx.maxLength);
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    id: "maxLength",
    type: "number",
    min: "10",
    max: "10000",
    ...{ class: "max-length-input" },
});
(__VLS_ctx.maxLength);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "length-info" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.maxLength);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "control-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "checkbox-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "checkbox-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    type: "checkbox",
});
(__VLS_ctx.includeUppercase);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "custom-checkbox" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "checkbox-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "checkbox-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    type: "checkbox",
});
(__VLS_ctx.includeLowercase);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "custom-checkbox" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "checkbox-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "checkbox-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    type: "checkbox",
});
(__VLS_ctx.includeNumbers);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "custom-checkbox" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "checkbox-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "checkbox-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    type: "checkbox",
});
(__VLS_ctx.includeSymbols);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "custom-checkbox" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "checkbox-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "checkbox-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    type: "checkbox",
});
(__VLS_ctx.includeSpace);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "custom-checkbox" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "checkbox-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "control-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    for: "customChars",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    id: "customChars",
    value: (__VLS_ctx.customCharacters),
    type: "text",
    placeholder: "输入自定义字符",
    ...{ class: "custom-input" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({
    ...{ class: "help-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "control-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "checkbox-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    type: "checkbox",
});
(__VLS_ctx.excludeSimilar);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "custom-checkbox" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "checkbox-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "action-buttons" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.generateString) },
    ...{ class: "generate-btn" },
    disabled: (!__VLS_ctx.hasValidCharSet),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "fas fa-magic" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.generateMultiple) },
    ...{ class: "batch-btn" },
    disabled: (!__VLS_ctx.hasValidCharSet),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "fas fa-layer-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "output-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
if (__VLS_ctx.copyStatus) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "copy-status" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fas fa-check-circle" },
    });
    (__VLS_ctx.copyStatus);
}
if (__VLS_ctx.generatedString) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "result-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "result-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "result-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.generatedString))
                    return;
                __VLS_ctx.copyToClipboard(__VLS_ctx.generatedString);
            } },
        ...{ class: "copy-btn" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fas fa-copy" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "result-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.code, __VLS_intrinsicElements.code)({});
    (__VLS_ctx.generatedString);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "result-info" },
    });
    (__VLS_ctx.generatedString.length);
    (__VLS_ctx.getCharSetInfo());
}
if (__VLS_ctx.batchResults.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "batch-results" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "result-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "result-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.copyAllToClipboard) },
        ...{ class: "copy-btn" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fas fa-copy" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "batch-list" },
    });
    for (const [str, index] of __VLS_getVForSourceType((__VLS_ctx.batchResults))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.batchResults.length > 0))
                        return;
                    __VLS_ctx.copyToClipboard(str);
                } },
            key: (index),
            ...{ class: "batch-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.code, __VLS_intrinsicElements.code)({});
        (str);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
            ...{ class: "fas fa-copy copy-icon" },
        });
    }
}
if (__VLS_ctx.availableChars) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "charset-preview" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "charset-display" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.code, __VLS_intrinsicElements.code)({});
    (__VLS_ctx.availableChars.slice(0, 100));
    (__VLS_ctx.availableChars.length > 100 ? '...' : '');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "charset-info" },
    });
    (__VLS_ctx.availableChars.length);
}
/** @type {__VLS_StyleScopedClasses['string-generator']} */ ;
/** @type {__VLS_StyleScopedClasses['generator-container']} */ ;
/** @type {__VLS_StyleScopedClasses['controls-section']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-dice']} */ ;
/** @type {__VLS_StyleScopedClasses['description']} */ ;
/** @type {__VLS_StyleScopedClasses['control-group']} */ ;
/** @type {__VLS_StyleScopedClasses['length-labels']} */ ;
/** @type {__VLS_StyleScopedClasses['max-length-label']} */ ;
/** @type {__VLS_StyleScopedClasses['length-controls']} */ ;
/** @type {__VLS_StyleScopedClasses['length-input']} */ ;
/** @type {__VLS_StyleScopedClasses['slider-container']} */ ;
/** @type {__VLS_StyleScopedClasses['length-slider']} */ ;
/** @type {__VLS_StyleScopedClasses['slider-labels']} */ ;
/** @type {__VLS_StyleScopedClasses['slider-min']} */ ;
/** @type {__VLS_StyleScopedClasses['slider-max']} */ ;
/** @type {__VLS_StyleScopedClasses['max-length-input']} */ ;
/** @type {__VLS_StyleScopedClasses['length-info']} */ ;
/** @type {__VLS_StyleScopedClasses['control-group']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-group']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-item']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-checkbox']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-text']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-item']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-checkbox']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-text']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-item']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-checkbox']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-text']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-item']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-checkbox']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-text']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-item']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-checkbox']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-text']} */ ;
/** @type {__VLS_StyleScopedClasses['control-group']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-input']} */ ;
/** @type {__VLS_StyleScopedClasses['help-text']} */ ;
/** @type {__VLS_StyleScopedClasses['control-group']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-item']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-checkbox']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-text']} */ ;
/** @type {__VLS_StyleScopedClasses['action-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['generate-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-magic']} */ ;
/** @type {__VLS_StyleScopedClasses['batch-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-layer-group']} */ ;
/** @type {__VLS_StyleScopedClasses['output-section']} */ ;
/** @type {__VLS_StyleScopedClasses['copy-status']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-check-circle']} */ ;
/** @type {__VLS_StyleScopedClasses['result-item']} */ ;
/** @type {__VLS_StyleScopedClasses['result-header']} */ ;
/** @type {__VLS_StyleScopedClasses['result-label']} */ ;
/** @type {__VLS_StyleScopedClasses['copy-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['result-content']} */ ;
/** @type {__VLS_StyleScopedClasses['result-info']} */ ;
/** @type {__VLS_StyleScopedClasses['batch-results']} */ ;
/** @type {__VLS_StyleScopedClasses['result-header']} */ ;
/** @type {__VLS_StyleScopedClasses['result-label']} */ ;
/** @type {__VLS_StyleScopedClasses['copy-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['batch-list']} */ ;
/** @type {__VLS_StyleScopedClasses['batch-item']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['copy-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['charset-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['charset-display']} */ ;
/** @type {__VLS_StyleScopedClasses['charset-info']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            length: length,
            maxLength: maxLength,
            includeUppercase: includeUppercase,
            includeLowercase: includeLowercase,
            includeNumbers: includeNumbers,
            includeSymbols: includeSymbols,
            includeSpace: includeSpace,
            customCharacters: customCharacters,
            excludeSimilar: excludeSimilar,
            generatedString: generatedString,
            batchResults: batchResults,
            copyStatus: copyStatus,
            availableChars: availableChars,
            hasValidCharSet: hasValidCharSet,
            generateString: generateString,
            generateMultiple: generateMultiple,
            getCharSetInfo: getCharSetInfo,
            copyToClipboard: copyToClipboard,
            copyAllToClipboard: copyAllToClipboard,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
