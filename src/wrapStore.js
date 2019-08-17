/* eslint no-param-reassign: 0, no-console: 0 */

import { createStore, applyMiddleware } from 'redux';

const objMap = new Map();
const applyPatches = (oldState, patches) => {
  let state = oldState;
  patches.forEach((patch) => {
    switch (patch.type) {
      case 'CREATE_OBJECT': {
        const obj = patch.isArray ? [] : {};
        patch.props.forEach((prop) => {
          if (prop.type === 'OBJECT') {
            obj[prop.name] = objMap.get(prop.id);
          } else {
            obj[prop.name] = prop.value;
          }
        });
        objMap.set(patch.id, obj);
        break;
      }
      case 'DELETE_OBJECT':
        objMap.delete(patch.id);
        break;
      case 'RETURN_STATE':
        state = objMap.get(patch.id);
        break;
      default:
        throw new Error(`wrapStore unknown patch type: ${patch.type}`);
    }
  });
  return state;
};

const REPLACE_STATE = Symbol('REPLACE_STATE');
const reducer = (state = {}, action) => {
  if (action.type === REPLACE_STATE) {
    return action.state;
  }
  return state;
};

export const wrapStore = (worker, initialState) => {
  const middleware = () => next => (action) => {
    if (action.type !== REPLACE_STATE) {
      worker.postMessage(action);
    }
    next(action);
  };
  const store = createStore(reducer, initialState, applyMiddleware(middleware));
  worker.onmessage = (e) => {
    const state = applyPatches(store.getState, e.data);
    store.dispatch({ type: REPLACE_STATE, state });
  };
  worker.onerror = () => {
    console.error('wrapStore worker error');
  };
  worker.onmessageerror = () => {
    console.error('wrapStore worker message error');
  };
  return store;
};
