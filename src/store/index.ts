import { createStore } from 'vuex';

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
}

// export const apiData = apiConfig['HTTP'];

export default createStore<State>({
    state: {
        currentPageTitle: 'Home',
    },
    mutations: {
        setCurrentPageTitle(state: State, title: string) {
            state.currentPageTitle = title.toUpperCase();
        }
    },
    actions: {
        updatePageTitle({ commit }: { commit: Function }, title: string) {
            commit('setCurrentPageTitle', title);
        }
    },
    getters: {
        currentPageTitle: (state: State) => state.currentPageTitle,
    }
});