import { createStore } from 'redux';
import Cache from '@wora/cache-persist';
import IDBStorage from '@wora/cache-persist/lib/idbstorage';

import { exposeStore } from 'redux-in-worker';

export const initialState = { count: 0 };
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + 1 };
    case 'decrement':
      return { ...state, count: state.count - 1 };
    default:
      return state;
  }
};

const idbStorages = IDBStorage.create({
  name: 'redux',
  storeNames: ['persist'],
});

const persistOptions = {
  storage: idbStorages[0],
  serialize: false,
};

const cache = new Cache(persistOptions);

const isEmpty = obj => !Object.keys(obj).length;

cache.restore().then(() => {
  const preloadedState = isEmpty(cache.getState()) ? initialState : cache.getState();
  const store = createStore(reducer, preloadedState);
  const listener = () => {
    const state = store.getState();
    Object.keys(state).forEach((key) => {
      cache.set(key, state[key]);
    });
  };
  store.subscribe(listener);
  exposeStore(store);
});
