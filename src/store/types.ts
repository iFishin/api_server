// store/types.ts - Vuex 类型定义

export interface State {
    currentPageTitle: string;
    categories: any[];
    toolCategories: any[];
    httpCategories: any[];
    mqttCategories: any[];
    tcpUdpCategories: any[];
    userCategories: any[];
    webdavCategories: any[];
}

// 简化的类型导出，避免复杂的Vuex类型问题
export type AppState = State
