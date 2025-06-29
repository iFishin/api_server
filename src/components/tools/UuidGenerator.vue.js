import { ref, computed, onMounted } from 'vue';
const selectedVersion = ref('v4');
const includeBraces = ref(false);
const includeHyphens = ref(true);
const upperCase = ref(false);
const currentUuid = ref('');
const bulkCount = ref(10);
const bulkFormat = ref('standard');
const bulkOutput = ref('');
const uuidToValidate = ref('');
const validationResult = ref(null);
const totalGenerated = ref(0);
const sessionCount = ref(0);
const lastGeneratedTime = ref('');
// 格式变体计算属性
const formatVariants = computed(() => {
    if (!currentUuid.value)
        return [];
    const baseUuid = currentUuid.value.replace(/[{}-]/g, '').toLowerCase();
    return [
        {
            name: 'Standard',
            value: formatUuid(baseUuid, true, false, false)
        },
        {
            name: 'Compact',
            value: formatUuid(baseUuid, false, false, false)
        },
        {
            name: 'With Braces',
            value: formatUuid(baseUuid, true, true, false)
        },
        {
            name: 'Uppercase',
            value: formatUuid(baseUuid, true, false, true)
        },
        {
            name: 'Uppercase + Braces',
            value: formatUuid(baseUuid, true, true, true)
        }
    ];
});
const generateUuid = () => {
    let uuid = '';
    switch (selectedVersion.value) {
        case 'v4':
            uuid = generateV4();
            break;
        case 'v1':
            uuid = generateV1();
            break;
        case 'nil':
            uuid = '00000000-0000-0000-0000-000000000000';
            break;
    }
    currentUuid.value = formatUuid(uuid, includeHyphens.value, includeBraces.value, upperCase.value);
    updateStats();
};
const generateV4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};
const generateV1 = () => {
    // 简化的 V1 UUID 生成（实际实现会更复杂）
    const timestamp = Date.now();
    const timeHex = timestamp.toString(16).padStart(12, '0');
    const clockSeq = Math.random().toString(16).substr(2, 4);
    const node = Math.random().toString(16).substr(2, 12);
    return `${timeHex.substr(0, 8)}-${timeHex.substr(8, 4)}-1${timeHex.substr(12, 3)}-${clockSeq}-${node}`;
};
const formatUuid = (uuid, hyphens, braces, upper) => {
    let formatted = uuid.replace(/[{}-]/g, '');
    if (hyphens) {
        formatted = `${formatted.substr(0, 8)}-${formatted.substr(8, 4)}-${formatted.substr(12, 4)}-${formatted.substr(16, 4)}-${formatted.substr(20, 12)}`;
    }
    if (braces) {
        formatted = `{${formatted}}`;
    }
    if (upper) {
        formatted = formatted.toUpperCase();
    }
    return formatted;
};
const updateFormats = () => {
    if (currentUuid.value) {
        const baseUuid = currentUuid.value.replace(/[{}-]/g, '').toLowerCase();
        currentUuid.value = formatUuid(baseUuid, includeHyphens.value, includeBraces.value, upperCase.value);
    }
};
const generateBulk = () => {
    const uuids = [];
    for (let i = 0; i < bulkCount.value; i++) {
        let uuid = generateV4();
        switch (bulkFormat.value) {
            case 'compact':
                uuid = uuid.replace(/-/g, '');
                break;
            case 'braces':
                uuid = `{${uuid}}`;
                break;
            case 'uppercase':
                uuid = uuid.toUpperCase();
                break;
        }
        uuids.push(uuid);
    }
    bulkOutput.value = uuids.join('\n');
    totalGenerated.value += bulkCount.value;
    sessionCount.value += bulkCount.value;
    lastGeneratedTime.value = new Date().toLocaleTimeString();
};
const validateUuid = () => {
    if (!uuidToValidate.value.trim()) {
        validationResult.value = null;
        return;
    }
    const uuid = uuidToValidate.value.trim();
    const uuidRegex = /^[{]?[0-9a-fA-F]{8}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{12}[}]?$/;
    if (!uuidRegex.test(uuid)) {
        validationResult.value = { isValid: false };
        return;
    }
    const cleanUuid = uuid.replace(/[{}-]/g, '');
    const version = parseInt(cleanUuid.charAt(12), 16);
    const variant = parseInt(cleanUuid.charAt(16), 16);
    let variantName = 'Unknown';
    if ((variant & 0x8) === 0)
        variantName = 'NCS';
    else if ((variant & 0xC) === 0x8)
        variantName = 'RFC 4122';
    else if ((variant & 0xE) === 0xC)
        variantName = 'Microsoft';
    validationResult.value = {
        isValid: true,
        version: `Version ${version}`,
        variant: variantName,
        timestamp: version === 1 ? 'Available (V1)' : 'Not available'
    };
};
const updateStats = () => {
    totalGenerated.value++;
    sessionCount.value++;
    lastGeneratedTime.value = new Date().toLocaleTimeString();
};
const copyUuid = async (uuid) => {
    try {
        await navigator.clipboard.writeText(uuid);
    }
    catch (err) {
        console.error('Failed to copy:', err);
    }
};
const copyBulkUuids = async () => {
    if (bulkOutput.value) {
        try {
            await navigator.clipboard.writeText(bulkOutput.value);
        }
        catch (err) {
            console.error('Failed to copy:', err);
        }
    }
};
const downloadUuids = () => {
    if (bulkOutput.value) {
        const blob = new Blob([bulkOutput.value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'uuids.txt';
        a.click();
        URL.revokeObjectURL(url);
    }
};
const clearAll = () => {
    currentUuid.value = '';
};
const clearBulk = () => {
    bulkOutput.value = '';
};
onMounted(() => {
    generateUuid();
    // 从 localStorage 加载统计数据
    const savedStats = localStorage.getItem('uuid-generator-stats');
    if (savedStats) {
        const stats = JSON.parse(savedStats);
        totalGenerated.value = stats.total || 0;
    }
});
// 保存统计数据
const saveStats = () => {
    localStorage.setItem('uuid-generator-stats', JSON.stringify({
        total: totalGenerated.value
    }));
};
// 监听统计变化并保存
setInterval(saveStats, 5000);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['format-checkboxes']} */ ;
/** @type {__VLS_StyleScopedClasses['copy-btn-small']} */ ;
/** @type {__VLS_StyleScopedClasses['format-variants']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-item']} */ ;
/** @type {__VLS_StyleScopedClasses['validation-section']} */ ;
/** @type {__VLS_StyleScopedClasses['result-status']} */ ;
/** @type {__VLS_StyleScopedClasses['result-status']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-section']} */ ;
/** @type {__VLS_StyleScopedClasses['generator-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['validator-content']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-grid']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "uuid-generator" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "generator-layout" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "generation-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.generateUuid) },
    ...{ class: "btn btn-primary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "fas fa-plus" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.clearAll) },
    ...{ class: "btn btn-secondary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "uuid-types" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "type-selector" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    ...{ onChange: (__VLS_ctx.generateUuid) },
    value: (__VLS_ctx.selectedVersion),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "v4",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "v1",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "nil",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "format-options" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "format-checkboxes" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
    ...{ onChange: (__VLS_ctx.updateFormats) },
    type: "checkbox",
});
(__VLS_ctx.includeBraces);
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
    ...{ onChange: (__VLS_ctx.updateFormats) },
    type: "checkbox",
});
(__VLS_ctx.includeHyphens);
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
    ...{ onChange: (__VLS_ctx.updateFormats) },
    type: "checkbox",
});
(__VLS_ctx.upperCase);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "current-uuid" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "uuid-display" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    readonly: true,
    ...{ class: "uuid-input" },
});
(__VLS_ctx.currentUuid);
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.copyUuid(__VLS_ctx.currentUuid);
        } },
    ...{ class: "copy-btn" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "fas fa-copy" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "format-variants" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "variant-list" },
});
for (const [variant, index] of __VLS_getVForSourceType((__VLS_ctx.formatVariants))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
        ...{ class: "variant-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    (variant.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "variant-display" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        value: (variant.value),
        readonly: true,
        ...{ class: "variant-input" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.copyUuid(variant.value);
            } },
        ...{ class: "copy-btn-small" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fas fa-copy" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "batch-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.generateBulk) },
    ...{ class: "btn btn-primary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.clearBulk) },
    ...{ class: "btn btn-secondary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "bulk-options" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "option-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    type: "number",
    min: "1",
    max: "1000",
    ...{ class: "count-input" },
});
(__VLS_ctx.bulkCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "option-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    value: (__VLS_ctx.bulkFormat),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "standard",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "compact",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "braces",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "uppercase",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "bulk-output" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.textarea, __VLS_intrinsicElements.textarea)({
    value: (__VLS_ctx.bulkOutput),
    readonly: true,
    ...{ class: "bulk-textarea" },
    placeholder: "Bulk generated UUIDs will appear here...",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "bulk-actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.copyBulkUuids) },
    ...{ class: "copy-btn" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "fas fa-copy" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.downloadUuids) },
    ...{ class: "download-btn" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "fas fa-download" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "validation-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.validateUuid) },
    ...{ class: "btn btn-primary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "validator-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-area" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ onInput: (__VLS_ctx.validateUuid) },
    placeholder: "Enter UUID to validate...",
    ...{ class: "validate-input" },
});
(__VLS_ctx.uuidToValidate);
if (__VLS_ctx.validationResult) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "validation-result" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: (['result-status', __VLS_ctx.validationResult.isValid ? 'valid' : 'invalid']) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: (__VLS_ctx.validationResult.isValid ? 'fas fa-check-circle' : 'fas fa-times-circle') },
    });
    (__VLS_ctx.validationResult.isValid ? 'Valid UUID' : 'Invalid UUID');
    if (__VLS_ctx.validationResult.isValid) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "uuid-info" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "info-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (__VLS_ctx.validationResult.version);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "info-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (__VLS_ctx.validationResult.variant);
        if (__VLS_ctx.validationResult.timestamp) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "info-item" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
            (__VLS_ctx.validationResult.timestamp);
        }
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stats-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stats-grid" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "stat-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "stat-value" },
});
(__VLS_ctx.totalGenerated);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "stat-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "stat-value" },
});
(__VLS_ctx.sessionCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "stat-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "stat-value" },
});
(__VLS_ctx.lastGeneratedTime);
/** @type {__VLS_StyleScopedClasses['uuid-generator']} */ ;
/** @type {__VLS_StyleScopedClasses['generator-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['generation-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-plus']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['uuid-types']} */ ;
/** @type {__VLS_StyleScopedClasses['type-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['format-options']} */ ;
/** @type {__VLS_StyleScopedClasses['format-checkboxes']} */ ;
/** @type {__VLS_StyleScopedClasses['current-uuid']} */ ;
/** @type {__VLS_StyleScopedClasses['uuid-display']} */ ;
/** @type {__VLS_StyleScopedClasses['uuid-input']} */ ;
/** @type {__VLS_StyleScopedClasses['copy-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['format-variants']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-list']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-item']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-display']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-input']} */ ;
/** @type {__VLS_StyleScopedClasses['copy-btn-small']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['batch-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['bulk-options']} */ ;
/** @type {__VLS_StyleScopedClasses['option-group']} */ ;
/** @type {__VLS_StyleScopedClasses['count-input']} */ ;
/** @type {__VLS_StyleScopedClasses['option-group']} */ ;
/** @type {__VLS_StyleScopedClasses['bulk-output']} */ ;
/** @type {__VLS_StyleScopedClasses['bulk-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['bulk-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['copy-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['download-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-download']} */ ;
/** @type {__VLS_StyleScopedClasses['validation-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['validator-content']} */ ;
/** @type {__VLS_StyleScopedClasses['input-area']} */ ;
/** @type {__VLS_StyleScopedClasses['validate-input']} */ ;
/** @type {__VLS_StyleScopedClasses['validation-result']} */ ;
/** @type {__VLS_StyleScopedClasses['result-status']} */ ;
/** @type {__VLS_StyleScopedClasses['uuid-info']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-section']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            selectedVersion: selectedVersion,
            includeBraces: includeBraces,
            includeHyphens: includeHyphens,
            upperCase: upperCase,
            currentUuid: currentUuid,
            bulkCount: bulkCount,
            bulkFormat: bulkFormat,
            bulkOutput: bulkOutput,
            uuidToValidate: uuidToValidate,
            validationResult: validationResult,
            totalGenerated: totalGenerated,
            sessionCount: sessionCount,
            lastGeneratedTime: lastGeneratedTime,
            formatVariants: formatVariants,
            generateUuid: generateUuid,
            updateFormats: updateFormats,
            generateBulk: generateBulk,
            validateUuid: validateUuid,
            copyUuid: copyUuid,
            copyBulkUuids: copyBulkUuids,
            downloadUuids: downloadUuids,
            clearAll: clearAll,
            clearBulk: clearBulk,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
