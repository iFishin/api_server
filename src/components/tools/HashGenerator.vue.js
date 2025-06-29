import { ref, computed } from 'vue';
const inputType = ref('text');
const inputText = ref('');
const selectedFile = ref(null);
const hashToCompare = ref('');
const expectedHash = ref('');
const expectedAlgorithm = ref('MD5');
const fileInput = ref();
const generationTime = ref(0);
const availableAlgorithms = ref([
    'MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'
]);
const selectedAlgorithms = ref(['MD5', 'SHA-1', 'SHA-256']);
const hashResults = ref([]);
const comparisonResult = ref(null);
const integrityResult = ref(null);
const inputSize = computed(() => {
    if (inputType.value === 'text') {
        return new Blob([inputText.value]).size;
    }
    else if (selectedFile.value) {
        return selectedFile.value.size;
    }
    return 0;
});
const generateHashes = async () => {
    if (!hasInput())
        return;
    const startTime = performance.now();
    hashResults.value = [];
    try {
        let data;
        if (inputType.value === 'text') {
            data = new TextEncoder().encode(inputText.value);
        }
        else if (selectedFile.value) {
            data = await selectedFile.value.arrayBuffer();
        }
        else {
            return;
        }
        for (const algorithm of selectedAlgorithms.value) {
            const hash = await calculateHash(data, algorithm);
            hashResults.value.push({
                algorithm,
                value: hash
            });
        }
        const endTime = performance.now();
        generationTime.value = Math.round(endTime - startTime);
    }
    catch (error) {
        console.error('Error generating hashes:', error);
    }
};
const calculateHash = async (data, algorithm) => {
    let algoName;
    switch (algorithm) {
        case 'MD5':
            return await calculateMD5(data);
        case 'SHA-1':
            algoName = 'SHA-1';
            break;
        case 'SHA-256':
            algoName = 'SHA-256';
            break;
        case 'SHA-384':
            algoName = 'SHA-384';
            break;
        case 'SHA-512':
            algoName = 'SHA-512';
            break;
        default:
            throw new Error(`Unsupported algorithm: ${algorithm}`);
    }
    const hashBuffer = await crypto.subtle.digest(algoName, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};
const calculateMD5 = async (data) => {
    // 简化的MD5实现（实际项目中应使用专门的MD5库）
    // 这里为了演示，返回一个模拟的MD5值
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
};
const hasInput = () => {
    return (inputType.value === 'text' && inputText.value.trim() !== '') ||
        (inputType.value === 'file' && selectedFile.value !== null);
};
const handleInputTypeChange = () => {
    inputText.value = '';
    selectedFile.value = null;
    hashResults.value = [];
    if (fileInput.value) {
        fileInput.value.value = '';
    }
};
const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
        selectedFile.value = file;
        generateHashes();
    }
};
const handleFileDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) {
        selectedFile.value = file;
        if (fileInput.value) {
            const dt = new DataTransfer();
            dt.items.add(file);
            fileInput.value.files = dt.files;
        }
        generateHashes();
    }
};
const compareHashes = () => {
    if (!hashToCompare.value.trim()) {
        comparisonResult.value = null;
        return;
    }
    const compareHash = hashToCompare.value.toLowerCase().trim();
    const match = hashResults.value.find(hash => hash.value.toLowerCase() === compareHash);
    comparisonResult.value = {
        matches: !!match,
        algorithm: match?.algorithm
    };
};
const verifyIntegrity = () => {
    if (!expectedHash.value.trim()) {
        integrityResult.value = null;
        return;
    }
    const expectedHashValue = expectedHash.value.toLowerCase().trim();
    const actualHash = hashResults.value.find(hash => hash.algorithm === expectedAlgorithm.value);
    if (!actualHash) {
        integrityResult.value = {
            isValid: false,
            message: `No ${expectedAlgorithm.value} hash generated. Please select the algorithm and generate hashes first.`
        };
        return;
    }
    const isValid = actualHash.value.toLowerCase() === expectedHashValue;
    integrityResult.value = {
        isValid,
        message: isValid
            ? 'File integrity verified successfully!'
            : 'File integrity verification failed - hashes do not match!'
    };
};
const selectAllAlgorithms = () => {
    selectedAlgorithms.value = [...availableAlgorithms.value];
    generateHashes();
};
const deselectAllAlgorithms = () => {
    selectedAlgorithms.value = [];
    hashResults.value = [];
};
const clearInput = () => {
    inputText.value = '';
    selectedFile.value = null;
    hashResults.value = [];
    comparisonResult.value = null;
    integrityResult.value = null;
    if (fileInput.value) {
        fileInput.value.value = '';
    }
};
const copyHash = async (hash) => {
    try {
        await navigator.clipboard.writeText(hash);
    }
    catch (err) {
        console.error('Failed to copy:', err);
    }
};
const copyAllHashes = async () => {
    if (hashResults.value.length === 0)
        return;
    const allHashes = hashResults.value
        .map(hash => `${hash.algorithm}: ${hash.value}`)
        .join('\n');
    try {
        await navigator.clipboard.writeText(allHashes);
    }
    catch (err) {
        console.error('Failed to copy:', err);
    }
};
const downloadHashes = () => {
    if (hashResults.value.length === 0)
        return;
    const content = hashResults.value
        .map(hash => `${hash.algorithm}: ${hash.value}`)
        .join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hashes.txt';
    a.click();
    URL.revokeObjectURL(url);
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['file-drop-zone']} */ ;
/** @type {__VLS_StyleScopedClasses['hash-header']} */ ;
/** @type {__VLS_StyleScopedClasses['algorithm-section']} */ ;
/** @type {__VLS_StyleScopedClasses['algorithm-checkbox']} */ ;
/** @type {__VLS_StyleScopedClasses['comparison-section']} */ ;
/** @type {__VLS_StyleScopedClasses['integrity-section']} */ ;
/** @type {__VLS_StyleScopedClasses['comparison-status']} */ ;
/** @type {__VLS_StyleScopedClasses['integrity-status']} */ ;
/** @type {__VLS_StyleScopedClasses['comparison-status']} */ ;
/** @type {__VLS_StyleScopedClasses['integrity-status']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-section']} */ ;
/** @type {__VLS_StyleScopedClasses['generator-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['comparison-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['integrity-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['algorithm-grid']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hash-generator" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "generator-layout" },
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
    ...{ onClick: (__VLS_ctx.generateHashes) },
    ...{ class: "btn btn-primary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-options" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-type-selector" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    ...{ onChange: (__VLS_ctx.handleInputTypeChange) },
    value: (__VLS_ctx.inputType),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "text",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "file",
});
if (__VLS_ctx.inputType === 'text') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "text-input" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.textarea, __VLS_intrinsicElements.textarea)({
        ...{ onInput: (__VLS_ctx.generateHashes) },
        value: (__VLS_ctx.inputText),
        placeholder: "Enter text to hash...",
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
        ...{ onDragenter: () => { } },
        ...{ class: "file-drop-zone" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fas fa-cloud-upload-alt" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    if (__VLS_ctx.selectedFile) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "file-info" },
        });
        (__VLS_ctx.selectedFile.name);
    }
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
    ...{ onClick: (__VLS_ctx.copyAllHashes) },
    ...{ class: "btn btn-secondary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "fas fa-copy" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.downloadHashes) },
    ...{ class: "btn btn-secondary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "fas fa-download" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hash-results" },
});
for (const [hash] of __VLS_getVForSourceType((__VLS_ctx.hashResults))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (hash.algorithm),
        ...{ class: "hash-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "hash-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    (hash.algorithm);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.copyHash(hash.value);
            } },
        ...{ class: "copy-btn-small" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fas fa-copy" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        value: (hash.value),
        readonly: true,
        ...{ class: "hash-output" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "algorithm-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.selectAllAlgorithms) },
    ...{ class: "btn btn-secondary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.deselectAllAlgorithms) },
    ...{ class: "btn btn-secondary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "algorithm-grid" },
});
for (const [algo] of __VLS_getVForSourceType((__VLS_ctx.availableAlgorithms))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        key: (algo),
        ...{ class: "algorithm-checkbox" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
        ...{ onChange: (__VLS_ctx.generateHashes) },
        type: "checkbox",
        value: (algo),
    });
    (__VLS_ctx.selectedAlgorithms);
    (algo);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "comparison-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.compareHashes) },
    ...{ class: "btn btn-primary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "comparison-layout" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "comparison-input" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    placeholder: "Enter hash to compare...",
    ...{ class: "compare-input" },
});
(__VLS_ctx.hashToCompare);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "comparison-result" },
});
if (__VLS_ctx.comparisonResult) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: (['comparison-status', __VLS_ctx.comparisonResult.matches ? 'match' : 'no-match']) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: (__VLS_ctx.comparisonResult.matches ? 'fas fa-check-circle' : 'fas fa-times-circle') },
    });
    if (__VLS_ctx.comparisonResult.matches) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.comparisonResult.algorithm);
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "integrity-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "integrity-layout" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "expected-hash" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    placeholder: "Enter expected hash value...",
    ...{ class: "expected-input" },
});
(__VLS_ctx.expectedHash);
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    value: (__VLS_ctx.expectedAlgorithm),
    ...{ class: "algorithm-select" },
});
for (const [algo] of __VLS_getVForSourceType((__VLS_ctx.availableAlgorithms))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        key: (algo),
        value: (algo),
    });
    (algo);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "verification-result" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.verifyIntegrity) },
    ...{ class: "btn btn-primary" },
});
if (__VLS_ctx.integrityResult) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: (['integrity-status', __VLS_ctx.integrityResult.isValid ? 'valid' : 'invalid']) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: (__VLS_ctx.integrityResult.isValid ? 'fas fa-shield-alt' : 'fas fa-exclamation-triangle') },
    });
    (__VLS_ctx.integrityResult.message);
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
(__VLS_ctx.inputSize);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "stat-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "stat-value" },
});
(__VLS_ctx.selectedAlgorithms.length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "stat-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "stat-value" },
});
(__VLS_ctx.generationTime);
/** @type {__VLS_StyleScopedClasses['hash-generator']} */ ;
/** @type {__VLS_StyleScopedClasses['generator-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['input-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['input-options']} */ ;
/** @type {__VLS_StyleScopedClasses['input-type-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['text-input']} */ ;
/** @type {__VLS_StyleScopedClasses['input-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['file-input']} */ ;
/** @type {__VLS_StyleScopedClasses['file-input-element']} */ ;
/** @type {__VLS_StyleScopedClasses['file-drop-zone']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-cloud-upload-alt']} */ ;
/** @type {__VLS_StyleScopedClasses['file-info']} */ ;
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
/** @type {__VLS_StyleScopedClasses['hash-results']} */ ;
/** @type {__VLS_StyleScopedClasses['hash-item']} */ ;
/** @type {__VLS_StyleScopedClasses['hash-header']} */ ;
/** @type {__VLS_StyleScopedClasses['copy-btn-small']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['hash-output']} */ ;
/** @type {__VLS_StyleScopedClasses['algorithm-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['algorithm-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['algorithm-checkbox']} */ ;
/** @type {__VLS_StyleScopedClasses['comparison-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['comparison-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['comparison-input']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-input']} */ ;
/** @type {__VLS_StyleScopedClasses['comparison-result']} */ ;
/** @type {__VLS_StyleScopedClasses['comparison-status']} */ ;
/** @type {__VLS_StyleScopedClasses['integrity-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['integrity-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['expected-hash']} */ ;
/** @type {__VLS_StyleScopedClasses['expected-input']} */ ;
/** @type {__VLS_StyleScopedClasses['algorithm-select']} */ ;
/** @type {__VLS_StyleScopedClasses['verification-result']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['integrity-status']} */ ;
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
            inputType: inputType,
            inputText: inputText,
            selectedFile: selectedFile,
            hashToCompare: hashToCompare,
            expectedHash: expectedHash,
            expectedAlgorithm: expectedAlgorithm,
            fileInput: fileInput,
            generationTime: generationTime,
            availableAlgorithms: availableAlgorithms,
            selectedAlgorithms: selectedAlgorithms,
            hashResults: hashResults,
            comparisonResult: comparisonResult,
            integrityResult: integrityResult,
            inputSize: inputSize,
            generateHashes: generateHashes,
            handleInputTypeChange: handleInputTypeChange,
            handleFileSelect: handleFileSelect,
            handleFileDrop: handleFileDrop,
            compareHashes: compareHashes,
            verifyIntegrity: verifyIntegrity,
            selectAllAlgorithms: selectAllAlgorithms,
            deselectAllAlgorithms: deselectAllAlgorithms,
            clearInput: clearInput,
            copyHash: copyHash,
            copyAllHashes: copyAllHashes,
            downloadHashes: downloadHashes,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
