import { ref, computed, onMounted, onUnmounted } from 'vue';
const inputTimestamp = ref('');
const inputDate = ref('');
const batchInput = ref('');
const batchOutput = ref('');
const timestampUnit = ref('seconds');
const selectedTimezone = ref('local');
const currentTime = ref(new Date());
let timeInterval;
// 当前时间相关计算属性
const currentTimestamp = computed(() => Math.floor(currentTime.value.getTime() / 1000));
const currentDateTime = computed(() => currentTime.value.toLocaleString());
const currentUtcTime = computed(() => currentTime.value.toUTCString());
const currentIsoTime = computed(() => currentTime.value.toISOString());
// 转换结果
const convertedLocalDate = ref('');
const convertedUtcDate = ref('');
const convertedIsoDate = ref('');
const relativeTime = ref('');
const outputTimestampSeconds = ref('');
const outputTimestampMilliseconds = ref('');
const convertFromTimestamp = () => {
    if (!inputTimestamp.value) {
        convertedLocalDate.value = '';
        convertedUtcDate.value = '';
        convertedIsoDate.value = '';
        relativeTime.value = '';
        return;
    }
    try {
        let timestamp = parseInt(inputTimestamp.value);
        if (timestampUnit.value === 'seconds') {
            timestamp *= 1000;
        }
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) {
            throw new Error('Invalid timestamp');
        }
        convertedLocalDate.value = date.toLocaleString();
        convertedUtcDate.value = date.toUTCString();
        convertedIsoDate.value = date.toISOString();
        relativeTime.value = getRelativeTime(date);
    }
    catch (error) {
        convertedLocalDate.value = 'Invalid timestamp';
        convertedUtcDate.value = '';
        convertedIsoDate.value = '';
        relativeTime.value = '';
    }
};
const convertToTimestamp = () => {
    if (!inputDate.value) {
        outputTimestampSeconds.value = '';
        outputTimestampMilliseconds.value = '';
        return;
    }
    try {
        let date;
        if (selectedTimezone.value === 'utc') {
            date = new Date(inputDate.value + 'Z');
        }
        else {
            date = new Date(inputDate.value);
        }
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date');
        }
        const timestamp = date.getTime();
        outputTimestampSeconds.value = Math.floor(timestamp / 1000).toString();
        outputTimestampMilliseconds.value = timestamp.toString();
    }
    catch (error) {
        outputTimestampSeconds.value = 'Invalid date';
        outputTimestampMilliseconds.value = '';
    }
};
const getRelativeTime = (date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (Math.abs(diffSeconds) < 60) {
        return `${diffSeconds} seconds ago`;
    }
    else if (Math.abs(diffMinutes) < 60) {
        return `${diffMinutes} minutes ago`;
    }
    else if (Math.abs(diffHours) < 24) {
        return `${diffHours} hours ago`;
    }
    else {
        return `${diffDays} days ago`;
    }
};
const convertBatch = () => {
    if (!batchInput.value.trim()) {
        batchOutput.value = '';
        return;
    }
    const lines = batchInput.value.trim().split('\n');
    const results = [];
    lines.forEach((line, index) => {
        const timestamp = line.trim();
        if (!timestamp)
            return;
        try {
            let ts = parseInt(timestamp);
            // 自动检测单位
            if (ts.toString().length <= 10) {
                ts *= 1000;
            }
            const date = new Date(ts);
            if (isNaN(date.getTime())) {
                results.push(`Line ${index + 1}: Invalid timestamp - ${timestamp}`);
            }
            else {
                results.push(`${timestamp} -> ${date.toLocaleString()} (${date.toISOString()})`);
            }
        }
        catch (error) {
            results.push(`Line ${index + 1}: Error - ${timestamp}`);
        }
    });
    batchOutput.value = results.join('\n');
};
const refreshTime = () => {
    currentTime.value = new Date();
};
const useCurrentTimestamp = () => {
    inputTimestamp.value = currentTimestamp.value.toString();
    convertFromTimestamp();
};
const useCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    inputDate.value = `${year}-${month}-${day}T${hours}:${minutes}`;
    convertToTimestamp();
};
const clearTimestamp = () => {
    inputTimestamp.value = '';
    convertedLocalDate.value = '';
    convertedUtcDate.value = '';
    convertedIsoDate.value = '';
    relativeTime.value = '';
};
const clearDate = () => {
    inputDate.value = '';
    outputTimestampSeconds.value = '';
    outputTimestampMilliseconds.value = '';
};
const clearBatch = () => {
    batchInput.value = '';
    batchOutput.value = '';
};
const copyBatchResults = async () => {
    if (batchOutput.value) {
        try {
            await navigator.clipboard.writeText(batchOutput.value);
        }
        catch (err) {
            console.error('Failed to copy:', err);
        }
    }
};
onMounted(() => {
    // 每秒更新当前时间
    timeInterval = setInterval(() => {
        currentTime.value = new Date();
    }, 1000);
});
onUnmounted(() => {
    if (timeInterval) {
        clearInterval(timeInterval);
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['time-item']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['timestamp-type']} */ ;
/** @type {__VLS_StyleScopedClasses['date-format-options']} */ ;
/** @type {__VLS_StyleScopedClasses['output-item']} */ ;
/** @type {__VLS_StyleScopedClasses['conversion-section']} */ ;
/** @type {__VLS_StyleScopedClasses['batch-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['current-time-grid']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "timestamp-converter" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "converter-layout" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "current-time-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.refreshTime) },
    ...{ class: "btn btn-secondary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "fas fa-sync-alt" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "current-time-grid" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "time-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "time-value" },
});
(__VLS_ctx.currentTimestamp);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "time-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "time-value" },
});
(__VLS_ctx.currentDateTime);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "time-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "time-value" },
});
(__VLS_ctx.currentUtcTime);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "time-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "time-value" },
});
(__VLS_ctx.currentIsoTime);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "conversion-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "timestamp-to-date" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.clearTimestamp) },
    ...{ class: "btn btn-secondary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.useCurrentTimestamp) },
    ...{ class: "btn btn-primary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ onInput: (__VLS_ctx.convertFromTimestamp) },
    value: (__VLS_ctx.inputTimestamp),
    type: "text",
    placeholder: "Enter timestamp (seconds or milliseconds)",
    ...{ class: "input-field" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "timestamp-type" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
    ...{ onChange: (__VLS_ctx.convertFromTimestamp) },
    type: "radio",
    value: "seconds",
});
(__VLS_ctx.timestampUnit);
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
    ...{ onChange: (__VLS_ctx.convertFromTimestamp) },
    type: "radio",
    value: "milliseconds",
});
(__VLS_ctx.timestampUnit);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "output-area" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "output-grid" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "output-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    readonly: true,
    ...{ class: "output-field" },
});
(__VLS_ctx.convertedLocalDate);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "output-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    readonly: true,
    ...{ class: "output-field" },
});
(__VLS_ctx.convertedUtcDate);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "output-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    readonly: true,
    ...{ class: "output-field" },
});
(__VLS_ctx.convertedIsoDate);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "output-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    readonly: true,
    ...{ class: "output-field" },
});
(__VLS_ctx.relativeTime);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "date-to-timestamp" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.clearDate) },
    ...{ class: "btn btn-secondary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.useCurrentDate) },
    ...{ class: "btn btn-primary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ onInput: (__VLS_ctx.convertToTimestamp) },
    type: "datetime-local",
    ...{ class: "input-field" },
});
(__VLS_ctx.inputDate);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "date-format-options" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    ...{ onChange: (__VLS_ctx.convertToTimestamp) },
    value: (__VLS_ctx.selectedTimezone),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "local",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "utc",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "output-area" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "output-grid" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "output-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    readonly: true,
    ...{ class: "output-field" },
});
(__VLS_ctx.outputTimestampSeconds);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "output-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    readonly: true,
    ...{ class: "output-field" },
});
(__VLS_ctx.outputTimestampMilliseconds);
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
    ...{ onClick: (__VLS_ctx.clearBatch) },
    ...{ class: "btn btn-secondary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.convertBatch) },
    ...{ class: "btn btn-primary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "batch-layout" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "batch-input" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.textarea, __VLS_intrinsicElements.textarea)({
    value: (__VLS_ctx.batchInput),
    placeholder: "Enter timestamps, one per line...",
    ...{ class: "batch-textarea" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "batch-output" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.textarea, __VLS_intrinsicElements.textarea)({
    value: (__VLS_ctx.batchOutput),
    readonly: true,
    ...{ class: "batch-textarea" },
    placeholder: "Conversion results will appear here...",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.copyBatchResults) },
    ...{ class: "copy-btn" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "fas fa-copy" },
});
/** @type {__VLS_StyleScopedClasses['timestamp-converter']} */ ;
/** @type {__VLS_StyleScopedClasses['converter-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['current-time-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-sync-alt']} */ ;
/** @type {__VLS_StyleScopedClasses['current-time-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['time-item']} */ ;
/** @type {__VLS_StyleScopedClasses['time-value']} */ ;
/** @type {__VLS_StyleScopedClasses['time-item']} */ ;
/** @type {__VLS_StyleScopedClasses['time-value']} */ ;
/** @type {__VLS_StyleScopedClasses['time-item']} */ ;
/** @type {__VLS_StyleScopedClasses['time-value']} */ ;
/** @type {__VLS_StyleScopedClasses['time-item']} */ ;
/** @type {__VLS_StyleScopedClasses['time-value']} */ ;
/** @type {__VLS_StyleScopedClasses['conversion-section']} */ ;
/** @type {__VLS_StyleScopedClasses['timestamp-to-date']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['input-field']} */ ;
/** @type {__VLS_StyleScopedClasses['timestamp-type']} */ ;
/** @type {__VLS_StyleScopedClasses['output-area']} */ ;
/** @type {__VLS_StyleScopedClasses['output-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['output-item']} */ ;
/** @type {__VLS_StyleScopedClasses['output-field']} */ ;
/** @type {__VLS_StyleScopedClasses['output-item']} */ ;
/** @type {__VLS_StyleScopedClasses['output-field']} */ ;
/** @type {__VLS_StyleScopedClasses['output-item']} */ ;
/** @type {__VLS_StyleScopedClasses['output-field']} */ ;
/** @type {__VLS_StyleScopedClasses['output-item']} */ ;
/** @type {__VLS_StyleScopedClasses['output-field']} */ ;
/** @type {__VLS_StyleScopedClasses['date-to-timestamp']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['input-field']} */ ;
/** @type {__VLS_StyleScopedClasses['date-format-options']} */ ;
/** @type {__VLS_StyleScopedClasses['output-area']} */ ;
/** @type {__VLS_StyleScopedClasses['output-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['output-item']} */ ;
/** @type {__VLS_StyleScopedClasses['output-field']} */ ;
/** @type {__VLS_StyleScopedClasses['output-item']} */ ;
/** @type {__VLS_StyleScopedClasses['output-field']} */ ;
/** @type {__VLS_StyleScopedClasses['batch-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['batch-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['batch-input']} */ ;
/** @type {__VLS_StyleScopedClasses['batch-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['batch-output']} */ ;
/** @type {__VLS_StyleScopedClasses['batch-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['copy-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-copy']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            inputTimestamp: inputTimestamp,
            inputDate: inputDate,
            batchInput: batchInput,
            batchOutput: batchOutput,
            timestampUnit: timestampUnit,
            selectedTimezone: selectedTimezone,
            currentTimestamp: currentTimestamp,
            currentDateTime: currentDateTime,
            currentUtcTime: currentUtcTime,
            currentIsoTime: currentIsoTime,
            convertedLocalDate: convertedLocalDate,
            convertedUtcDate: convertedUtcDate,
            convertedIsoDate: convertedIsoDate,
            relativeTime: relativeTime,
            outputTimestampSeconds: outputTimestampSeconds,
            outputTimestampMilliseconds: outputTimestampMilliseconds,
            convertFromTimestamp: convertFromTimestamp,
            convertToTimestamp: convertToTimestamp,
            convertBatch: convertBatch,
            refreshTime: refreshTime,
            useCurrentTimestamp: useCurrentTimestamp,
            useCurrentDate: useCurrentDate,
            clearTimestamp: clearTimestamp,
            clearDate: clearDate,
            clearBatch: clearBatch,
            copyBatchResults: copyBatchResults,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
