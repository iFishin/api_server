import { ref, onMounted } from 'vue';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import api from '@/utils/api';
// 引入子组件
import ParamDetail from './ParamDetail.vue';
import SchemaViewer from './SchemaViewer.vue';
import TestPanel from './TestPanel.vue';
const props = defineProps();
// 响应式状态
const apis = ref([]);
const loading = ref(true);
const error = ref(null);
// 获取指定 API 的请求体 schema
const getRequestSchema = (api) => api.requestBody?.content?.['application/json']?.schema;
// 方法
const fetchAPIDocs = async () => {
    try {
        loading.value = true;
        error.value = null;
        const response = await api.get(`/api/docs`, {
            params: { group: props.apiGroup }
        });
        apis.value = response.data.data;
    }
    catch (err) {
        if (err.response) {
            // 服务器响应了错误状态码
            error.value = `HTTP ${err.response.status}: ${err.response.data?.message || err.message}`;
        }
        else if (err.request) {
            // 请求已发出但没有收到响应
            error.value = 'No response from server';
        }
        else {
            // 其他错误
            error.value = err.message || 'Unknown error';
        }
    }
    finally {
        loading.value = false;
    }
};
const retryLoading = () => {
    error.value = null;
    fetchAPIDocs();
};
const renderMarkdown = (content) => {
    marked.setOptions({
        async: false,
        highlight: function (code, lang) {
            if (lang && hljs.getLanguage(lang)) {
                return hljs.highlight(code, { language: lang }).value;
            }
            return code;
        }
    });
    return marked.parse(content);
};
// 测试面板事件处理
const handleTestStart = () => { };
const handleTestResult = (_result) => { };
// 状态码样式
const statusCodeClass = (code) => {
    const num = Number(code);
    if (num >= 200 && num < 300)
        return 'success';
    if (num >= 400 && num < 500)
        return 'client-error';
    if (num >= 500)
        return 'server-error';
    return '';
};
// 自动加载
onMounted(fetchAPIDocs);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['api-section']} */ ;
/** @type {__VLS_StyleScopedClasses['method-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['method-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['method-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['method-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['method-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['method-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['method-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['method-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['method-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['method-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['status-code']} */ ;
/** @type {__VLS_StyleScopedClasses['status-code']} */ ;
/** @type {__VLS_StyleScopedClasses['status-code']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['api-body']} */ ;
/** @type {__VLS_StyleScopedClasses['api-test-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['api-doc-viewer']} */ ;
/** @type {__VLS_StyleScopedClasses['api-section']} */ ;
/** @type {__VLS_StyleScopedClasses['api-test-panel']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "api-doc-viewer" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "main-title" },
});
(__VLS_ctx.apiGroup);
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "loading-state" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "loader" },
    });
}
else if (__VLS_ctx.error) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "error-state" },
    });
    (__VLS_ctx.error);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.retryLoading) },
    });
}
else {
    for (const [api] of __VLS_getVForSourceType((__VLS_ctx.apis))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (api.operationId),
            ...{ class: "api-section" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "api-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "method-tag" },
            ...{ class: (api.method ? api.method.toLowerCase() : '') },
        });
        (api.method || 'UNKNOWN');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
            ...{ class: "api-title" },
        });
        (api.summary);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "api-tags" },
        });
        for (const [tag] of __VLS_getVForSourceType((api.tags))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                key: (tag),
                ...{ class: "api-tag" },
            });
            (tag);
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "api-body" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "api-docs" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "docs-section" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.code, __VLS_intrinsicElements.code)({
            ...{ class: "endpoint" },
        });
        (api.path);
        if (api.description) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "docs-section" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "markdown-content" },
            });
            __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.renderMarkdown(api.description)) }, null, null);
        }
        if (api.parameters && api.parameters.length) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "docs-section" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "parameters-grid" },
            });
            if (api.parameters.some((p) => p.in === 'path')) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "param-group" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
                for (const [param] of __VLS_getVForSourceType((api.parameters.filter((p) => p.in === 'path')))) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        key: (param.name),
                        ...{ class: "param-item" },
                    });
                    /** @type {[typeof ParamDetail, ]} */ ;
                    // @ts-ignore
                    const __VLS_0 = __VLS_asFunctionalComponent(ParamDetail, new ParamDetail({
                        param: (param),
                    }));
                    const __VLS_1 = __VLS_0({
                        param: (param),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_0));
                }
            }
            if (api.parameters.some((p) => p.in === 'query')) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "param-group" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
                for (const [param] of __VLS_getVForSourceType((api.parameters?.filter((p) => p.in === 'query')))) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        key: (param.name),
                        ...{ class: "param-item" },
                    });
                    /** @type {[typeof ParamDetail, ]} */ ;
                    // @ts-ignore
                    const __VLS_3 = __VLS_asFunctionalComponent(ParamDetail, new ParamDetail({
                        param: (param),
                    }));
                    const __VLS_4 = __VLS_3({
                        param: (param),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_3));
                }
            }
            if (__VLS_ctx.getRequestSchema(api)) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "param-group" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "param-item" },
                });
                /** @type {[typeof SchemaViewer, ]} */ ;
                // @ts-ignore
                const __VLS_6 = __VLS_asFunctionalComponent(SchemaViewer, new SchemaViewer({
                    schema: (__VLS_ctx.getRequestSchema(api)),
                }));
                const __VLS_7 = __VLS_6({
                    schema: (__VLS_ctx.getRequestSchema(api)),
                }, ...__VLS_functionalComponentArgsRest(__VLS_6));
            }
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "docs-section" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        for (const [response, code] of __VLS_getVForSourceType((api.responses))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (code),
                ...{ class: "response-item" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "status-code" },
                ...{ class: (__VLS_ctx.statusCodeClass(code)) },
            });
            (code);
            if (response.content && response.content['application/json'] && response.content['application/json'].schema) {
                /** @type {[typeof SchemaViewer, ]} */ ;
                // @ts-ignore
                const __VLS_9 = __VLS_asFunctionalComponent(SchemaViewer, new SchemaViewer({
                    schema: (response.content['application/json'].schema),
                }));
                const __VLS_10 = __VLS_9({
                    schema: (response.content['application/json'].schema),
                }, ...__VLS_functionalComponentArgsRest(__VLS_9));
            }
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "api-test-panel" },
        });
        /** @type {[typeof TestPanel, ]} */ ;
        // @ts-ignore
        const __VLS_12 = __VLS_asFunctionalComponent(TestPanel, new TestPanel({
            ...{ 'onTestStart': {} },
            ...{ 'onTestResult': {} },
            api: (api),
        }));
        const __VLS_13 = __VLS_12({
            ...{ 'onTestStart': {} },
            ...{ 'onTestResult': {} },
            api: (api),
        }, ...__VLS_functionalComponentArgsRest(__VLS_12));
        let __VLS_15;
        let __VLS_16;
        let __VLS_17;
        const __VLS_18 = {
            onTestStart: (__VLS_ctx.handleTestStart)
        };
        const __VLS_19 = {
            onTestResult: (__VLS_ctx.handleTestResult)
        };
        var __VLS_14;
    }
}
/** @type {__VLS_StyleScopedClasses['api-doc-viewer']} */ ;
/** @type {__VLS_StyleScopedClasses['main-title']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-state']} */ ;
/** @type {__VLS_StyleScopedClasses['loader']} */ ;
/** @type {__VLS_StyleScopedClasses['error-state']} */ ;
/** @type {__VLS_StyleScopedClasses['api-section']} */ ;
/** @type {__VLS_StyleScopedClasses['api-header']} */ ;
/** @type {__VLS_StyleScopedClasses['method-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['api-title']} */ ;
/** @type {__VLS_StyleScopedClasses['api-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['api-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['api-body']} */ ;
/** @type {__VLS_StyleScopedClasses['api-docs']} */ ;
/** @type {__VLS_StyleScopedClasses['docs-section']} */ ;
/** @type {__VLS_StyleScopedClasses['endpoint']} */ ;
/** @type {__VLS_StyleScopedClasses['docs-section']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['docs-section']} */ ;
/** @type {__VLS_StyleScopedClasses['parameters-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['param-group']} */ ;
/** @type {__VLS_StyleScopedClasses['param-item']} */ ;
/** @type {__VLS_StyleScopedClasses['param-group']} */ ;
/** @type {__VLS_StyleScopedClasses['param-item']} */ ;
/** @type {__VLS_StyleScopedClasses['param-group']} */ ;
/** @type {__VLS_StyleScopedClasses['param-item']} */ ;
/** @type {__VLS_StyleScopedClasses['docs-section']} */ ;
/** @type {__VLS_StyleScopedClasses['response-item']} */ ;
/** @type {__VLS_StyleScopedClasses['status-code']} */ ;
/** @type {__VLS_StyleScopedClasses['api-test-panel']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ParamDetail: ParamDetail,
            SchemaViewer: SchemaViewer,
            TestPanel: TestPanel,
            apis: apis,
            loading: loading,
            error: error,
            getRequestSchema: getRequestSchema,
            retryLoading: retryLoading,
            renderMarkdown: renderMarkdown,
            handleTestStart: handleTestStart,
            handleTestResult: handleTestResult,
            statusCodeClass: statusCodeClass,
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
