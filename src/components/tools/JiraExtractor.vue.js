import { ref, computed } from 'vue';
// 响应式数据
const inputText = ref('');
const selectedPattern = ref('default');
const customRegex = ref('[A-Z]+-\\d+');
const removeDuplicates = ref(true);
const sortResults = ref(true);
const extractedTickets = ref([]);
const hasSearched = ref(false);
const copyMessage = ref('');
const showCopyMessage = ref(false);
// 默认 JIRA 票号正则表达式
const defaultJiraRegex = /[A-Z][A-Z0-9]*-\d+/g;
// 计算属性
const currentRegex = computed(() => {
    if (selectedPattern.value === 'custom' && customRegex.value) {
        try {
            return new RegExp(customRegex.value, 'g');
        }
        catch (e) {
            return defaultJiraRegex;
        }
    }
    return defaultJiraRegex;
});
const displayedTickets = computed(() => {
    let tickets = [...extractedTickets.value];
    if (removeDuplicates.value) {
        tickets = [...new Set(tickets)];
    }
    if (sortResults.value) {
        tickets.sort((a, b) => {
            const [projectA, numA] = a.split('-');
            const [projectB, numB] = b.split('-');
            if (projectA !== projectB) {
                return projectA.localeCompare(projectB);
            }
            return parseInt(numA) - parseInt(numB);
        });
    }
    return tickets;
});
const uniqueProjects = computed(() => {
    const projects = new Set(displayedTickets.value.map(ticket => ticket.split('-')[0]));
    return Array.from(projects);
});
const duplicateCount = computed(() => {
    return extractedTickets.value.length - new Set(extractedTickets.value).size;
});
const jqlExpression = computed(() => {
    if (displayedTickets.value.length === 0)
        return '';
    const ticketList = displayedTickets.value.map(ticket => `"${ticket}"`).join(', ');
    return `key in (${ticketList})`;
});
const orExpression = computed(() => {
    if (displayedTickets.value.length === 0)
        return '';
    return displayedTickets.value.map(ticket => `key = "${ticket}"`).join(' OR ');
});
const projectGroups = computed(() => {
    const groups = {};
    displayedTickets.value.forEach(ticket => {
        const project = ticket.split('-')[0];
        if (!groups[project]) {
            groups[project] = [];
        }
        groups[project].push(`"${ticket}"`);
    });
    return Object.entries(groups).map(([project, tickets]) => ({
        project,
        tickets
    }));
});
// 方法
const extractJiraTickets = () => {
    hasSearched.value = true;
    const matches = inputText.value.match(currentRegex.value);
    extractedTickets.value = matches || [];
};
const clearAll = () => {
    inputText.value = '';
    extractedTickets.value = [];
    hasSearched.value = false;
};
const copyToClipboard = async (text) => {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            // 现代浏览器的 Clipboard API
            await navigator.clipboard.writeText(text);
            showCopySuccess('已复制到剪贴板！');
        }
        else {
            // 兼容旧浏览器的 fallback 方法
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                showCopySuccess('已复制到剪贴板！');
            }
            catch (err) {
                console.error('复制失败:', err);
                showCopySuccess('复制失败，请手动复制', 'error');
            }
            finally {
                document.body.removeChild(textArea);
            }
        }
    }
    catch (err) {
        console.error('复制失败:', err);
        showCopySuccess('复制失败，请手动复制', 'error');
    }
};
const showCopySuccess = (message, type = 'success') => {
    copyMessage.value = message;
    showCopyMessage.value = true;
    // 3秒后自动隐藏提示
    setTimeout(() => {
        showCopyMessage.value = false;
    }, 3000);
};
const copyTicketsList = async () => {
    const ticketsList = displayedTickets.value.join('\n');
    await copyToClipboard(ticketsList);
};
const copySearchExpression = async () => {
    await copyToClipboard(jqlExpression.value);
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['notification-content']} */ ;
/** @type {__VLS_StyleScopedClasses['output-section']} */ ;
/** @type {__VLS_StyleScopedClasses['output-section']} */ ;
/** @type {__VLS_StyleScopedClasses['output-section']} */ ;
/** @type {__VLS_StyleScopedClasses['output-section']} */ ;
/** @type {__VLS_StyleScopedClasses['output-section']} */ ;
/** @type {__VLS_StyleScopedClasses['input-section']} */ ;
/** @type {__VLS_StyleScopedClasses['output-section']} */ ;
/** @type {__VLS_StyleScopedClasses['input-section']} */ ;
/** @type {__VLS_StyleScopedClasses['input-section']} */ ;
/** @type {__VLS_StyleScopedClasses['output-section']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['config-section']} */ ;
/** @type {__VLS_StyleScopedClasses['config-group']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-item']} */ ;
/** @type {__VLS_StyleScopedClasses['input-section']} */ ;
/** @type {__VLS_StyleScopedClasses['input-section']} */ ;
/** @type {__VLS_StyleScopedClasses['action-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['action-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['extract-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['clear-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['extract-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['extract-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['extract-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['clear-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['clear-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tickets-section']} */ ;
/** @type {__VLS_StyleScopedClasses['search-expressions']} */ ;
/** @type {__VLS_StyleScopedClasses['copy-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ticket-item']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-copy-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-copy-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['expression-content']} */ ;
/** @type {__VLS_StyleScopedClasses['project-expression']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['extractor-container']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-cards']} */ ;
/** @type {__VLS_StyleScopedClasses['tickets-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['action-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['extract-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['clear-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['jira-extractor']} */ ;
/** @type {__VLS_StyleScopedClasses['input-section']} */ ;
/** @type {__VLS_StyleScopedClasses['output-section']} */ ;
/** @type {__VLS_StyleScopedClasses['output-section']} */ ;
/** @type {__VLS_StyleScopedClasses['extract-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['clear-btn']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "jira-extractor" },
});
if (__VLS_ctx.showCopyMessage) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "copy-notification" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "notification-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fas fa-check-circle" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.copyMessage);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "extractor-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "fas fa-tags" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "description" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    for: "input-text",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.textarea, __VLS_intrinsicElements.textarea)({
    id: "input-text",
    value: (__VLS_ctx.inputText),
    placeholder: "\u7c98\u8d34\u5305\u542b\u0020\u004a\u0049\u0052\u0041\u0020\u7968\u53f7\u7684\u6587\u672c\uff0c\u4f8b\u5982\uff1a\u000a\u4fee\u590d\u4e86\u0020\u0041\u0042\u0043\u002d\u0031\u0032\u0033\u0020\u548c\u0020\u0044\u0045\u0046\u002d\u0034\u0035\u0036\u0020\u7684\u95ee\u9898\u000a\u5b8c\u6210\u0020\u0058\u0059\u005a\u002d\u0037\u0038\u0039\u0020\u529f\u80fd\u5f00\u53d1\u000a\u5904\u7406\u0020\u0050\u0052\u004f\u004a\u002d\u0031\u0030\u0030\u0031\u002c\u0020\u0050\u0052\u004f\u004a\u002d\u0031\u0030\u0030\u0032\u0020\u7b49\u0074\u0069\u0063\u006b\u0065\u0074\u0073",
    ...{ class: "input-textarea" },
    rows: "8",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-stats" },
});
(__VLS_ctx.inputText.length);
(__VLS_ctx.inputText.split('\n').length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "config-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "config-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    for: "jira-pattern",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    id: "jira-pattern",
    value: (__VLS_ctx.selectedPattern),
    ...{ class: "pattern-select" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "default",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "custom",
});
if (__VLS_ctx.selectedPattern === 'custom') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "config-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        for: "custom-regex",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        id: "custom-regex",
        value: (__VLS_ctx.customRegex),
        type: "text",
        placeholder: "\u4f8b\u5982\u003a\u0020\u005b\u0041\u002d\u005a\u005d\u002b\u002d\u005c\u0064\u002b",
        ...{ class: "regex-input" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({
        ...{ class: "help-text" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "config-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "checkbox-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    type: "checkbox",
});
(__VLS_ctx.removeDuplicates);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "checkmark" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "config-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "checkbox-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    type: "checkbox",
});
(__VLS_ctx.sortResults);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "checkmark" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "action-buttons" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.extractJiraTickets) },
    ...{ class: "extract-btn" },
    disabled: (!__VLS_ctx.inputText.trim()),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "fas fa-search" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.clearAll) },
    ...{ class: "clear-btn" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "fas fa-trash" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "output-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
if (__VLS_ctx.extractedTickets.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stats-cards" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-number" },
    });
    (__VLS_ctx.extractedTickets.length);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-number" },
    });
    (__VLS_ctx.uniqueProjects.length);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-number" },
    });
    (__VLS_ctx.duplicateCount);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-label" },
    });
}
if (__VLS_ctx.displayedTickets.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tickets-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "section-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.copyTicketsList) },
        ...{ class: "copy-btn" },
        title: "复制所有票号",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fas fa-copy" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tickets-grid" },
    });
    for (const [ticket] of __VLS_getVForSourceType((__VLS_ctx.displayedTickets))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.displayedTickets.length > 0))
                        return;
                    __VLS_ctx.copyToClipboard(ticket);
                } },
            key: (ticket),
            ...{ class: "ticket-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "ticket-code" },
        });
        (ticket);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
            ...{ class: "fas fa-copy copy-icon" },
        });
    }
}
if (__VLS_ctx.extractedTickets.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "search-expressions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "section-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.copySearchExpression) },
        ...{ class: "copy-btn" },
        title: "复制JQL查询表达式",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fas fa-copy" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "expression-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "expression-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "expression-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "expression-tag" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.extractedTickets.length > 0))
                    return;
                __VLS_ctx.copyToClipboard(__VLS_ctx.jqlExpression);
            } },
        ...{ class: "mini-copy-btn" },
        title: "复制JQL查询",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fas fa-copy" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "expression-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.code, __VLS_intrinsicElements.code)({});
    (__VLS_ctx.jqlExpression);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "expression-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "expression-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "expression-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.extractedTickets.length > 0))
                    return;
                __VLS_ctx.copyToClipboard(__VLS_ctx.orExpression);
            } },
        ...{ class: "mini-copy-btn" },
        title: "复制OR查询",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fas fa-copy" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "expression-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.code, __VLS_intrinsicElements.code)({});
    (__VLS_ctx.orExpression);
    if (__VLS_ctx.projectGroups.length > 1) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "expression-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "expression-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "expression-label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "project-groups" },
        });
        for (const [group] of __VLS_getVForSourceType((__VLS_ctx.projectGroups))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (group.project),
                ...{ class: "project-group" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "project-header" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "project-name" },
            });
            (group.project);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.extractedTickets.length > 0))
                            return;
                        if (!(__VLS_ctx.projectGroups.length > 1))
                            return;
                        __VLS_ctx.copyToClipboard(`project = ${group.project} AND key in (${group.tickets.join(', ')})`);
                    } },
                ...{ class: "mini-copy-btn" },
                title: (`复制${group.project}项目查询`),
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
                ...{ class: "fas fa-copy" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "project-expression" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.code, __VLS_intrinsicElements.code)({});
            (group.project);
            (group.tickets.join(', '));
        }
    }
}
if (__VLS_ctx.extractedTickets.length === 0 && __VLS_ctx.hasSearched) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-state" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fas fa-search" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
}
/** @type {__VLS_StyleScopedClasses['jira-extractor']} */ ;
/** @type {__VLS_StyleScopedClasses['copy-notification']} */ ;
/** @type {__VLS_StyleScopedClasses['notification-content']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-check-circle']} */ ;
/** @type {__VLS_StyleScopedClasses['extractor-container']} */ ;
/** @type {__VLS_StyleScopedClasses['input-section']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['description']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['input-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['input-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['config-section']} */ ;
/** @type {__VLS_StyleScopedClasses['config-group']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-select']} */ ;
/** @type {__VLS_StyleScopedClasses['config-group']} */ ;
/** @type {__VLS_StyleScopedClasses['regex-input']} */ ;
/** @type {__VLS_StyleScopedClasses['help-text']} */ ;
/** @type {__VLS_StyleScopedClasses['config-group']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-item']} */ ;
/** @type {__VLS_StyleScopedClasses['checkmark']} */ ;
/** @type {__VLS_StyleScopedClasses['config-group']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-item']} */ ;
/** @type {__VLS_StyleScopedClasses['checkmark']} */ ;
/** @type {__VLS_StyleScopedClasses['action-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['extract-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-search']} */ ;
/** @type {__VLS_StyleScopedClasses['clear-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-trash']} */ ;
/** @type {__VLS_StyleScopedClasses['output-section']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-cards']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-number']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-number']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-number']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['tickets-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['copy-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['tickets-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['ticket-item']} */ ;
/** @type {__VLS_StyleScopedClasses['ticket-code']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['copy-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['search-expressions']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['copy-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['expression-item']} */ ;
/** @type {__VLS_StyleScopedClasses['expression-header']} */ ;
/** @type {__VLS_StyleScopedClasses['expression-label']} */ ;
/** @type {__VLS_StyleScopedClasses['expression-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-copy-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['expression-content']} */ ;
/** @type {__VLS_StyleScopedClasses['expression-item']} */ ;
/** @type {__VLS_StyleScopedClasses['expression-header']} */ ;
/** @type {__VLS_StyleScopedClasses['expression-label']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-copy-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['expression-content']} */ ;
/** @type {__VLS_StyleScopedClasses['expression-item']} */ ;
/** @type {__VLS_StyleScopedClasses['expression-header']} */ ;
/** @type {__VLS_StyleScopedClasses['expression-label']} */ ;
/** @type {__VLS_StyleScopedClasses['project-groups']} */ ;
/** @type {__VLS_StyleScopedClasses['project-group']} */ ;
/** @type {__VLS_StyleScopedClasses['project-header']} */ ;
/** @type {__VLS_StyleScopedClasses['project-name']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-copy-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['project-expression']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-search']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            inputText: inputText,
            selectedPattern: selectedPattern,
            customRegex: customRegex,
            removeDuplicates: removeDuplicates,
            sortResults: sortResults,
            extractedTickets: extractedTickets,
            hasSearched: hasSearched,
            copyMessage: copyMessage,
            showCopyMessage: showCopyMessage,
            displayedTickets: displayedTickets,
            uniqueProjects: uniqueProjects,
            duplicateCount: duplicateCount,
            jqlExpression: jqlExpression,
            orExpression: orExpression,
            projectGroups: projectGroups,
            extractJiraTickets: extractJiraTickets,
            clearAll: clearAll,
            copyToClipboard: copyToClipboard,
            copyTicketsList: copyTicketsList,
            copySearchExpression: copySearchExpression,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
