declare module 'vuex' {
  export * from 'vuex/types/index';
  export * from 'vuex/types/helpers';
  export * from 'vuex/types/logger';
  
  import { StoreOptions, Store } from 'vuex/types/index';
  
  export function createStore<S>(options: StoreOptions<S>): Store<S>;
  export function useStore<S = any>(): Store<S>;
} 