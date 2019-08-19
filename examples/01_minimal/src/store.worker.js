import { createStore } from 'redux';

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

const store = createStore(reducer);

exposeStore(store);
