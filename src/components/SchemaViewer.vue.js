const __VLS_props = defineProps();
function typeIcon(type) {
    switch (type) {
        case 'object': return '🗂️';
        case 'array': return '📚';
        case 'string': return '🔤';
        case 'integer':
        case 'number': return '🔢';
        case 'boolean': return '✔️';
        default: return '❓';
    }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "schema-viewer" },
});
if (__VLS_ctx.schema) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "schema-entry" },
        ...{ class: (__VLS_ctx.schema.type) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "schema-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "type-icon" },
    });
    (__VLS_ctx.typeIcon(__VLS_ctx.schema.type));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "type" },
    });
    (__VLS_ctx.schema.type);
    if (__VLS_ctx.schema.format) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "format" },
        });
        (__VLS_ctx.schema.format);
    }
    if (__VLS_ctx.schema.example !== undefined) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "example" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.code, __VLS_intrinsicElements.code)({});
        (__VLS_ctx.schema.example);
    }
    if (__VLS_ctx.schema.type === 'object' && __VLS_ctx.schema.properties) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "schema-properties" },
        });
        for (const [prop, key] of __VLS_getVForSourceType((__VLS_ctx.schema.properties))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (key),
                ...{ class: "schema-property" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "property-key" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "property-name" },
            });
            (key);
            const __VLS_0 = {}.SchemaViewer;
            /** @type {[typeof __VLS_components.SchemaViewer, ]} */ ;
            // @ts-ignore
            const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
                schema: (prop),
            }));
            const __VLS_2 = __VLS_1({
                schema: (prop),
            }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        }
    }
    else if (__VLS_ctx.schema.type === 'array' && __VLS_ctx.schema.items) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "schema-items" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "array-label" },
        });
        const __VLS_4 = {}.SchemaViewer;
        /** @type {[typeof __VLS_components.SchemaViewer, ]} */ ;
        // @ts-ignore
        const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
            schema: (__VLS_ctx.schema.items),
        }));
        const __VLS_6 = __VLS_5({
            schema: (__VLS_ctx.schema.items),
        }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "empty" },
    });
}
/** @type {__VLS_StyleScopedClasses['schema-viewer']} */ ;
/** @type {__VLS_StyleScopedClasses['schema-entry']} */ ;
/** @type {__VLS_StyleScopedClasses['schema-header']} */ ;
/** @type {__VLS_StyleScopedClasses['type-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['type']} */ ;
/** @type {__VLS_StyleScopedClasses['format']} */ ;
/** @type {__VLS_StyleScopedClasses['example']} */ ;
/** @type {__VLS_StyleScopedClasses['schema-properties']} */ ;
/** @type {__VLS_StyleScopedClasses['schema-property']} */ ;
/** @type {__VLS_StyleScopedClasses['property-key']} */ ;
/** @type {__VLS_StyleScopedClasses['property-name']} */ ;
/** @type {__VLS_StyleScopedClasses['schema-items']} */ ;
/** @type {__VLS_StyleScopedClasses['array-label']} */ ;
/** @type {__VLS_StyleScopedClasses['empty']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            typeIcon: typeIcon,
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
