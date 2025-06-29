import { createStore } from 'vuex';

// 移除有问题的 useStore 导入

interface Parameter {
    name: string
    type: string
    description: string
}

interface Api {
    id: number
    name: string
    description: string
}

interface Tcp_Udp_Api {
    id: number
    name: string
    protocol: string
    port: number
    description: string
}

interface ApiConfig {
    "HTTP": Api[],
    "TCP_UDP": Api[]
}

interface State {
    currentPageTitle: string;
    categories: any[];
    toolCategories: any[];
    httpCategories: any[];
    mqttCategories: any[];
    tcpUdpCategories: any[];
    userCategories: any[];
    webdavCategories: any[];
}

// export const apiData = apiConfig['HTTP'];

export default createStore<State>({
    state: {
        currentPageTitle: 'Home',
        categories: [],
        toolCategories: [],
        httpCategories: [],
        mqttCategories: [],
        tcpUdpCategories: [],
        userCategories: [],
        webdavCategories: [],
    },
    mutations: {
        setCurrentPageTitle(state: State, title: string) {
            state.currentPageTitle = title.toUpperCase();
        },
        setCategories(state: State, categories: any[]) {
            state.categories = categories;
        },
        setToolCategories(state: State, toolCategories: any[]) {
            state.toolCategories = toolCategories;
        },
        setHttpCategories(state: State, httpCategories: any[]) {
            state.httpCategories = httpCategories;
        },
        setMqttCategories(state: State, mqttCategories: any[]) {
            state.mqttCategories = mqttCategories;
        },
        setTcpUdpCategories(state: State, tcpUdpCategories: any[]) {
            state.tcpUdpCategories = tcpUdpCategories;
        },
        setUserCategories(state: State, userCategories: any[]) {
            state.userCategories = userCategories;
        },
        setWebdavCategories(state: State, webdavCategories: any[]) {
            state.webdavCategories = webdavCategories;
        }
    },
    actions: {
        updatePageTitle({ commit }: { commit: Function }, title: string) {
            commit('setCurrentPageTitle', title);
        },
        initializeCategories({ commit }: { commit: Function }, { route, categories }: { route: string, categories: any[] }) {
            const routeMap: { [key: string]: string } = {
                'toolkit': 'setToolCategories',
                'http': 'setHttpCategories',
                'mqtt': 'setMqttCategories',
                'tcp_udp': 'setTcpUdpCategories',
                'users': 'setUserCategories',
                'webdav': 'setWebdavCategories'
            };
            
            const mutation = routeMap[route];
            if (mutation) {
                commit(mutation, categories);
            }
        }
    },
    getters: {
        currentPageTitle: (state: State) => state.currentPageTitle,
    }
});