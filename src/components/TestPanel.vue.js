import { ref, computed, onMounted } from 'vue';
import { useClipboard } from '@vueuse/core';
import SvgIcon from './SvgIcon.vue';
import LoadingSpinner from './LoadingSpinner.vue';
import ParamInput from './ParamInput.vue';
import MonacoEditor from './MonacoEditor.vue';
import JsonViewer from './JsonViewer.vue';
const props = defineProps();
// 响应式状态
const paramValues = ref({});
const requestBody = ref('');
const loading = ref(false);
const response = ref(null);
const responseHeaders = ref(null);
const responseStatus = ref(null);
const responseTime = ref(null);
const error = ref(null);
const jsonError = ref(null);
const activeResponseTab = ref('Pretty');
const showHistory = ref(false);
const requestHistory = ref([]);
const editorOptions = ref({
    automaticLayout: true,
    minimap: { enabled: false },
    lineNumbers: 'off',
    scrollBeyondLastLine: false,
    fontSize: 14,
    theme: 'vs-dark'
});
// 计算属性
const pathParams = computed(() => props.api.parameters?.filter(p => p.in === 'path') || []);
const queryParams = computed(() => props.api.parameters?.filter(p => p.in === 'query') || []);
const hasPathParams = computed(() => pathParams.value.length > 0);
const hasQueryParams = computed(() => queryParams.value.length > 0);
const hasBodyParams = computed(() => !!props.api.requestBody?.content?.['application/json']);
const fullRequestUrl = computed(() => {
    let url = props.api.path;
    // 替换路径参数
    pathParams.value.forEach(p => {
        url = url.replace(`{${p.name}}`, paramValues.value[p.name] || `:${p.name}`);
    });
    // 添加查询参数
    const query = queryParams.value
        .map(p => `${p.name}=${paramValues.value[p.name] || ''}`)
        .filter(p => p.includes('='))
        .join('&');
    return query ? `${url}?${query}` : url;
});
const isJsonResponse = computed(() => responseHeaders.value?.['content-type']?.includes('application/json'));
const parsedResponse = computed(() => {
    if (!response.value || !isJsonResponse.value)
        return null;
    try {
        return JSON.parse(response.value);
    }
    catch {
        return null;
    }
});
const statusClass = computed(() => {
    if (!responseStatus.value)
        return '';
    return responseStatus.value >= 200 && responseStatus.value < 300
        ? 'success'
        : responseStatus.value >= 400 && responseStatus.value < 500
            ? 'client-error'
            : 'server-error';
});
const hasJsonError = computed(() => !!jsonError.value);
const responseTabs = computed(() => {
    const tabs = [];
    if (isJsonResponse.value)
        tabs.push('Pretty');
    tabs.push('Raw');
    if (responseHeaders.value)
        tabs.push('Headers');
    return tabs;
});
// 方法
const { copy } = useClipboard();
const updateUrlPreview = () => {
    // 触发响应式更新
};
const validateJson = () => {
    if (!requestBody.value) {
        jsonError.value = null;
        return;
    }
    try {
        JSON.parse(requestBody.value);
        jsonError.value = null;
    }
    catch (e) {
        jsonError.value = '无效的JSON格式';
    }
};
const sendRequest = async () => {
    loading.value = true;
    response.value = null;
    error.value = null;
    responseHeaders.value = null;
    responseStatus.value = null;
    const startTime = Date.now();
    try {
        // 构建URL
        let url = props.api.path;
        pathParams.value.forEach(p => {
            url = url.replace(`{${p.name}}`, encodeURIComponent(paramValues.value[p.name] || ''));
        });
        // 添加查询参数
        const query = queryParams.value
            .map(p => `${encodeURIComponent(p.name)}=${encodeURIComponent(paramValues.value[p.name] || '')}`)
            .filter(p => !p.endsWith('='))
            .join('&');
        if (query)
            url += (url.includes('?') ? '&' : '?') + query;
        // 请求配置
        const options = {
            method: props.api.method.toUpperCase(),
            headers: {}
        };
        // 添加请求体
        if (hasBodyParams.value && requestBody.value) {
            options.headers = {
                ...options.headers,
                'Content-Type': 'application/json'
            };
            options.body = requestBody.value;
        }
        const res = await fetch(url, options);
        responseStatus.value = res.status;
        responseHeaders.value = Object.fromEntries(res.headers.entries());
        const text = await res.text();
        response.value = text;
        if (!res.ok) {
            throw new Error(`HTTP ${res.status} ${res.statusText}`);
        }
        // 保存到历史记录
        saveToHistory({
            method: props.api.method,
            url,
            status: res.status,
            params: { ...paramValues.value },
            body: requestBody.value
        });
    }
    catch (err) {
        error.value = err instanceof Error ? err : new Error(String(err));
    }
    finally {
        loading.value = false;
        responseTime.value = Date.now() - startTime;
    }
};
const saveToHistory = (item) => {
    const historyItem = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        ...item
    };
    requestHistory.value.unshift(historyItem);
    // 限制历史记录数量
    if (requestHistory.value.length > 10) {
        requestHistory.value.pop();
    }
    // 保存到localStorage
    localStorage.setItem('apiTesterHistory', JSON.stringify(requestHistory.value));
};
const loadFromHistory = (item) => {
    // 加载参数
    if (item.params) {
        paramValues.value = { ...item.params };
    }
    // 加载请求体
    if (item.body) {
        requestBody.value = item.body;
    }
    showHistory.value = false;
};
const clearHistory = () => {
    requestHistory.value = [];
    localStorage.removeItem('apiTesterHistory');
};
const getStatusClass = (status) => {
    if (!status)
        return '';
    return status >= 200 && status < 300
        ? 'success'
        : status >= 400 && status < 500
            ? 'client-error'
            : 'server-error';
};
const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
};
const isHistoryActive = (item) => {
    return item.url === fullRequestUrl.value &&
        item.method === props.api.method.toUpperCase();
};
// 初始化
onMounted(() => {
    // 从localStorage加载历史记录
    const savedHistory = localStorage.getItem('apiTesterHistory');
    if (savedHistory) {
        try {
            requestHistory.value = JSON.parse(savedHistory);
        }
        catch {
            requestHistory.value = [];
        }
    }
    // 初始化请求体
    if (hasBodyParams.value) {
        const schema = props.api.requestBody?.content?.['application/json']?.schema;
        if (schema?.example) {
            requestBody.value = JSON.stringify(schema.example, null, 2);
        }
        else {
            requestBody.value = '{\n  \n}';
        }
    }
    // 初始化参数默认值
    props.api.parameters?.forEach(param => {
        if (param.schema?.example !== undefined) {
            paramValues.value[param.name] = param.schema.example;
        }
    });
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['clear-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['history-list']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['get']} */ ;
/** @type {__VLS_StyleScopedClasses['post']} */ ;
/** @type {__VLS_StyleScopedClasses['put']} */ ;
/** @type {__VLS_StyleScopedClasses['delete']} */ ;
/** @type {__VLS_StyleScopedClasses['success']} */ ;
/** @type {__VLS_StyleScopedClasses['client-error']} */ ;
/** @type {__VLS_StyleScopedClasses['server-error']} */ ;
/** @type {__VLS_StyleScopedClasses['test-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['request-controls']} */ ;
/** @type {__VLS_StyleScopedClasses['param-group-title']} */ ;
/** @type {__VLS_StyleScopedClasses['history-list']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "test-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "panel-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "request-method" },
    ...{ class: (__VLS_ctx.api.method.toLowerCase()) },
});
(__VLS_ctx.api.method.toUpperCase());
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "request-builder" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "url-display" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "url-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.code, __VLS_intrinsicElements.code)({
    ...{ class: "url-value" },
});
(__VLS_ctx.fullRequestUrl);
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.copy(__VLS_ctx.fullRequestUrl);
        } },
    ...{ class: "copy-btn" },
    title: "Copy URL",
});
/** @type {[typeof SvgIcon, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(SvgIcon, new SvgIcon({
    name: "copy",
}));
const __VLS_1 = __VLS_0({
    name: "copy",
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "params-section" },
});
if (__VLS_ctx.hasPathParams) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "param-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
        ...{ class: "param-group-title" },
    });
    /** @type {[typeof SvgIcon, ]} */ ;
    // @ts-ignore
    const __VLS_3 = __VLS_asFunctionalComponent(SvgIcon, new SvgIcon({
        name: "link",
        ...{ class: "icon" },
    }));
    const __VLS_4 = __VLS_3({
        name: "link",
        ...{ class: "icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_3));
    for (const [param] of __VLS_getVForSourceType((__VLS_ctx.pathParams))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (param.name),
            ...{ class: "param-item" },
        });
        /** @type {[typeof ParamInput, ]} */ ;
        // @ts-ignore
        const __VLS_6 = __VLS_asFunctionalComponent(ParamInput, new ParamInput({
            ...{ 'onChange': {} },
            param: (param),
            modelValue: (__VLS_ctx.paramValues[param.name]),
        }));
        const __VLS_7 = __VLS_6({
            ...{ 'onChange': {} },
            param: (param),
            modelValue: (__VLS_ctx.paramValues[param.name]),
        }, ...__VLS_functionalComponentArgsRest(__VLS_6));
        let __VLS_9;
        let __VLS_10;
        let __VLS_11;
        const __VLS_12 = {
            onChange: (__VLS_ctx.updateUrlPreview)
        };
        var __VLS_8;
    }
}
if (__VLS_ctx.hasQueryParams) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "param-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
        ...{ class: "param-group-title" },
    });
    /** @type {[typeof SvgIcon, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(SvgIcon, new SvgIcon({
        name: "search",
        ...{ class: "icon" },
    }));
    const __VLS_14 = __VLS_13({
        name: "search",
        ...{ class: "icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    for (const [param] of __VLS_getVForSourceType((__VLS_ctx.queryParams))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (param.name),
            ...{ class: "param-item" },
        });
        /** @type {[typeof ParamInput, ]} */ ;
        // @ts-ignore
        const __VLS_16 = __VLS_asFunctionalComponent(ParamInput, new ParamInput({
            ...{ 'onChange': {} },
            param: (param),
            modelValue: (__VLS_ctx.paramValues[param.name]),
        }));
        const __VLS_17 = __VLS_16({
            ...{ 'onChange': {} },
            param: (param),
            modelValue: (__VLS_ctx.paramValues[param.name]),
        }, ...__VLS_functionalComponentArgsRest(__VLS_16));
        let __VLS_19;
        let __VLS_20;
        let __VLS_21;
        const __VLS_22 = {
            onChange: (__VLS_ctx.updateUrlPreview)
        };
        var __VLS_18;
    }
}
if (__VLS_ctx.hasBodyParams) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "param-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
        ...{ class: "param-group-title" },
    });
    /** @type {[typeof SvgIcon, ]} */ ;
    // @ts-ignore
    const __VLS_23 = __VLS_asFunctionalComponent(SvgIcon, new SvgIcon({
        name: "json",
        ...{ class: "icon" },
    }));
    const __VLS_24 = __VLS_23({
        name: "json",
        ...{ class: "icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_23));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "body-format" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "json-editor-container" },
    });
    /** @type {[typeof MonacoEditor, ]} */ ;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent(MonacoEditor, new MonacoEditor({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.requestBody),
        language: "json",
        options: (__VLS_ctx.editorOptions),
    }));
    const __VLS_27 = __VLS_26({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.requestBody),
        language: "json",
        options: (__VLS_ctx.editorOptions),
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    let __VLS_29;
    let __VLS_30;
    let __VLS_31;
    const __VLS_32 = {
        onChange: (__VLS_ctx.validateJson)
    };
    var __VLS_28;
    if (__VLS_ctx.jsonError) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "json-error" },
        });
        /** @type {[typeof SvgIcon, ]} */ ;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(SvgIcon, new SvgIcon({
            name: "error",
        }));
        const __VLS_34 = __VLS_33({
            name: "error",
        }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        (__VLS_ctx.jsonError);
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "request-controls" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.sendRequest) },
    disabled: (__VLS_ctx.loading || __VLS_ctx.hasJsonError),
    ...{ class: "send-btn" },
    ...{ class: ({ loading: __VLS_ctx.loading }) },
});
if (!__VLS_ctx.loading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    /** @type {[typeof SvgIcon, ]} */ ;
    // @ts-ignore
    const __VLS_36 = __VLS_asFunctionalComponent(SvgIcon, new SvgIcon({
        name: "send",
    }));
    const __VLS_37 = __VLS_36({
        name: "send",
    }, ...__VLS_functionalComponentArgsRest(__VLS_36));
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    /** @type {[typeof LoadingSpinner, ]} */ ;
    // @ts-ignore
    const __VLS_39 = __VLS_asFunctionalComponent(LoadingSpinner, new LoadingSpinner({}));
    const __VLS_40 = __VLS_39({}, ...__VLS_functionalComponentArgsRest(__VLS_39));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "history-controls" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.showHistory = !__VLS_ctx.showHistory;
        } },
    ...{ class: "history-btn" },
});
/** @type {[typeof SvgIcon, ]} */ ;
// @ts-ignore
const __VLS_42 = __VLS_asFunctionalComponent(SvgIcon, new SvgIcon({
    name: "history",
}));
const __VLS_43 = __VLS_42({
    name: "history",
}, ...__VLS_functionalComponentArgsRest(__VLS_42));
if (__VLS_ctx.requestHistory.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.clearHistory) },
        ...{ class: "clear-btn" },
    });
}
if (__VLS_ctx.response || __VLS_ctx.error) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "response-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "response-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    /** @type {[typeof SvgIcon, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(SvgIcon, new SvgIcon({
        name: "response",
        ...{ class: "icon" },
    }));
    const __VLS_46 = __VLS_45({
        name: "response",
        ...{ class: "icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    if (__VLS_ctx.responseStatus) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "status-badge" },
            ...{ class: (__VLS_ctx.statusClass) },
        });
        (__VLS_ctx.responseStatus);
    }
    if (__VLS_ctx.responseTime) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "response-time" },
        });
        (__VLS_ctx.responseTime);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "response-tabs" },
    });
    for (const [tab] of __VLS_getVForSourceType((__VLS_ctx.responseTabs))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.response || __VLS_ctx.error))
                        return;
                    __VLS_ctx.activeResponseTab = tab;
                } },
            key: (tab),
            ...{ class: ({ active: __VLS_ctx.activeResponseTab === tab }) },
        });
        (tab);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "response-content" },
    });
    if (__VLS_ctx.activeResponseTab === 'Pretty' && __VLS_ctx.isJsonResponse) {
        /** @type {[typeof JsonViewer, ]} */ ;
        // @ts-ignore
        const __VLS_48 = __VLS_asFunctionalComponent(JsonViewer, new JsonViewer({
            value: (__VLS_ctx.parsedResponse),
            expandDepth: (2),
            ...{ class: "json-viewer" },
        }));
        const __VLS_49 = __VLS_48({
            value: (__VLS_ctx.parsedResponse),
            expandDepth: (2),
            ...{ class: "json-viewer" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_48));
    }
    else if (__VLS_ctx.activeResponseTab === 'Raw') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({
            ...{ class: "raw-response" },
        });
        (__VLS_ctx.response);
    }
    else if (__VLS_ctx.activeResponseTab === 'Headers' && __VLS_ctx.responseHeaders) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.table, __VLS_intrinsicElements.table)({
            ...{ class: "headers-table" },
        });
        for (const [value, key] of __VLS_getVForSourceType((__VLS_ctx.responseHeaders))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({
                key: (key),
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
            (key);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
            (value);
        }
    }
    if (__VLS_ctx.error) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "error-message" },
        });
        /** @type {[typeof SvgIcon, ]} */ ;
        // @ts-ignore
        const __VLS_51 = __VLS_asFunctionalComponent(SvgIcon, new SvgIcon({
            name: "warning",
        }));
        const __VLS_52 = __VLS_51({
            name: "warning",
        }, ...__VLS_functionalComponentArgsRest(__VLS_51));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "error-details" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "error-title" },
        });
        (__VLS_ctx.error.name || 'Error');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "error-text" },
        });
        (__VLS_ctx.error.message);
        if (__VLS_ctx.error.stack) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "error-stack" },
            });
            (__VLS_ctx.error.stack);
        }
    }
}
const __VLS_54 = {}.Transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.Transition, ]} */ ;
// @ts-ignore
const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({
    name: "slide-fade",
}));
const __VLS_56 = __VLS_55({
    name: "slide-fade",
}, ...__VLS_functionalComponentArgsRest(__VLS_55));
__VLS_57.slots.default;
if (__VLS_ctx.showHistory && __VLS_ctx.requestHistory.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "history-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "history-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showHistory && __VLS_ctx.requestHistory.length > 0))
                    return;
                __VLS_ctx.showHistory = false;
            } },
        ...{ class: "close-btn" },
    });
    /** @type {[typeof SvgIcon, ]} */ ;
    // @ts-ignore
    const __VLS_58 = __VLS_asFunctionalComponent(SvgIcon, new SvgIcon({
        name: "close",
    }));
    const __VLS_59 = __VLS_58({
        name: "close",
    }, ...__VLS_functionalComponentArgsRest(__VLS_58));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({
        ...{ class: "history-list" },
    });
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.requestHistory))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.showHistory && __VLS_ctx.requestHistory.length > 0))
                        return;
                    __VLS_ctx.loadFromHistory(item);
                } },
            key: (index),
            ...{ class: ({ active: __VLS_ctx.isHistoryActive(item) }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "history-method" },
            ...{ class: (item.method.toLowerCase()) },
        });
        (item.method);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "history-url" },
        });
        (item.url);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "history-status" },
            ...{ class: (__VLS_ctx.getStatusClass(item.status)) },
        });
        (item.status);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "history-time" },
        });
        (__VLS_ctx.formatTime(item.timestamp));
    }
}
var __VLS_57;
/** @type {__VLS_StyleScopedClasses['test-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-header']} */ ;
/** @type {__VLS_StyleScopedClasses['request-method']} */ ;
/** @type {__VLS_StyleScopedClasses['request-builder']} */ ;
/** @type {__VLS_StyleScopedClasses['url-display']} */ ;
/** @type {__VLS_StyleScopedClasses['url-label']} */ ;
/** @type {__VLS_StyleScopedClasses['url-value']} */ ;
/** @type {__VLS_StyleScopedClasses['copy-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['params-section']} */ ;
/** @type {__VLS_StyleScopedClasses['param-group']} */ ;
/** @type {__VLS_StyleScopedClasses['param-group-title']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['param-item']} */ ;
/** @type {__VLS_StyleScopedClasses['param-group']} */ ;
/** @type {__VLS_StyleScopedClasses['param-group-title']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['param-item']} */ ;
/** @type {__VLS_StyleScopedClasses['param-group']} */ ;
/** @type {__VLS_StyleScopedClasses['param-group-title']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['body-format']} */ ;
/** @type {__VLS_StyleScopedClasses['json-editor-container']} */ ;
/** @type {__VLS_StyleScopedClasses['json-error']} */ ;
/** @type {__VLS_StyleScopedClasses['request-controls']} */ ;
/** @type {__VLS_StyleScopedClasses['send-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['loading']} */ ;
/** @type {__VLS_StyleScopedClasses['history-controls']} */ ;
/** @type {__VLS_StyleScopedClasses['history-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['clear-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['response-section']} */ ;
/** @type {__VLS_StyleScopedClasses['response-header']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['response-time']} */ ;
/** @type {__VLS_StyleScopedClasses['response-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['response-content']} */ ;
/** @type {__VLS_StyleScopedClasses['json-viewer']} */ ;
/** @type {__VLS_StyleScopedClasses['raw-response']} */ ;
/** @type {__VLS_StyleScopedClasses['headers-table']} */ ;
/** @type {__VLS_StyleScopedClasses['error-message']} */ ;
/** @type {__VLS_StyleScopedClasses['error-details']} */ ;
/** @type {__VLS_StyleScopedClasses['error-title']} */ ;
/** @type {__VLS_StyleScopedClasses['error-text']} */ ;
/** @type {__VLS_StyleScopedClasses['error-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['history-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['history-header']} */ ;
/** @type {__VLS_StyleScopedClasses['close-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['history-list']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['history-method']} */ ;
/** @type {__VLS_StyleScopedClasses['history-url']} */ ;
/** @type {__VLS_StyleScopedClasses['history-status']} */ ;
/** @type {__VLS_StyleScopedClasses['history-time']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            SvgIcon: SvgIcon,
            LoadingSpinner: LoadingSpinner,
            ParamInput: ParamInput,
            MonacoEditor: MonacoEditor,
            JsonViewer: JsonViewer,
            paramValues: paramValues,
            requestBody: requestBody,
            loading: loading,
            response: response,
            responseHeaders: responseHeaders,
            responseStatus: responseStatus,
            responseTime: responseTime,
            error: error,
            jsonError: jsonError,
            activeResponseTab: activeResponseTab,
            showHistory: showHistory,
            requestHistory: requestHistory,
            editorOptions: editorOptions,
            pathParams: pathParams,
            queryParams: queryParams,
            hasPathParams: hasPathParams,
            hasQueryParams: hasQueryParams,
            hasBodyParams: hasBodyParams,
            fullRequestUrl: fullRequestUrl,
            isJsonResponse: isJsonResponse,
            parsedResponse: parsedResponse,
            statusClass: statusClass,
            hasJsonError: hasJsonError,
            responseTabs: responseTabs,
            copy: copy,
            updateUrlPreview: updateUrlPreview,
            validateJson: validateJson,
            sendRequest: sendRequest,
            loadFromHistory: loadFromHistory,
            clearHistory: clearHistory,
            getStatusClass: getStatusClass,
            formatTime: formatTime,
            isHistoryActive: isHistoryActive,
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
