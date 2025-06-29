import { createStore } from 'vuex';
// export const apiData = apiConfig['HTTP'];
export default createStore({
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
        setCurrentPageTitle(state, title) {
            state.currentPageTitle = title.toUpperCase();
        },
        setCategories(state, categories) {
            state.categories = categories;
        },
        setToolCategories(state, toolCategories) {
            state.toolCategories = toolCategories;
        },
        setHttpCategories(state, httpCategories) {
            state.httpCategories = httpCategories;
        },
        setMqttCategories(state, mqttCategories) {
            state.mqttCategories = mqttCategories;
        },
        setTcpUdpCategories(state, tcpUdpCategories) {
            state.tcpUdpCategories = tcpUdpCategories;
        },
        setUserCategories(state, userCategories) {
            state.userCategories = userCategories;
        },
        setWebdavCategories(state, webdavCategories) {
            state.webdavCategories = webdavCategories;
        }
    },
    actions: {
        updatePageTitle({ commit }, title) {
            commit('setCurrentPageTitle', title);
        },
        initializeCategories({ commit }, { route, categories }) {
            const routeMap = {
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
        currentPageTitle: (state) => state.currentPageTitle,
    }
});
