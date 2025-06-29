// store/types.ts - Vuex 类型定义
import { Store } from 'vuex';
import { getCurrentInstance } from 'vue';

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

// 声明全局属性类型
declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $store: Store<State>;
    }
}

// 为 getCurrentInstance 提供类型支持
export function useTypedStore(): Store<State> | undefined {
    const instance = getCurrentInstance();
    return instance?.appContext.app.config.globalProperties.$store;
}
