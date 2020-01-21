import { createStore, applyMiddleware } from 'redux';
import { apiMiddleware } from 'redux-api-middleware';

import { exposeStore } from 'redux-in-worker';

export const initialState = {
  count: 0,
  person: {
    name: '',
    loading: false,
  },
};

export type State = typeof initialState;

export type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'setName'; name: string }
  | { type: 'REQUEST' }
  | { type: 'SUCCESS'; payload: { name: string } }
  | { type: 'FAILURE' };

const reducer = (state = initialState, action: Action) => {
  console.log({ state, action });
  switch (action.type) {
    case 'increment': return {
      ...state,
      count: state.count + 1,
    };
    case 'decrement': return {
      ...state,
      count: state.count - 1,
    };
    case 'setName': return {
      ...state,
      person: {
        ...state.person,
        name: action.name,
      },
    };
    case 'REQUEST': return {
      ...state,
      person: {
        ...state.person,
        loading: true,
      },
    };
    case 'SUCCESS': return {
      ...state,
      person: {
        ...state.person,
        name: action.payload.name,
        loading: false,
      },
    };
    case 'FAILURE': return {
      ...state,
      person: {
        ...state.person,
        name: 'ERROR',
        loading: false,
      },
    };
    default: return state;
  }
};

const store = createStore(reducer, applyMiddleware(apiMiddleware));

exposeStore(store);
