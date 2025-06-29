// 为 getCurrentInstance 提供类型支持
export function useTypedStore() {
    const { getCurrentInstance } = require('vue');
    const instance = getCurrentInstance();
    return instance?.appContext.app.config.globalProperties.$store;
}
