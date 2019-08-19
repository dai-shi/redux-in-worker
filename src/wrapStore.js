/* eslint no-param-reassign: 0, no-console: 0 */

import { createStore, compose } from 'redux';

import {
  PATCH_TYPE_CREATE_OBJECT,
  PATCH_TYPE_DELETE_OBJECT,
  PATCH_TYPE_RETURN_STATE,
  PROP_TYPE_OBJECT,
} from './exposeStore';

const REPLACE_STATE = Symbol('REPLACE_STATE');

const applyPatches = (objMap, oldState, patches) => {
  let state = oldState;
  patches.forEach((patch) => {
    switch (patch.type) {
      case PATCH_TYPE_CREATE_OBJECT: {
        const obj = patch.isArray ? [] : {};
        patch.props.forEach((prop) => {
          if (prop.type === PROP_TYPE_OBJECT) {
            obj[prop.name] = objMap.get(prop.id);
          } else {
            obj[prop.name] = prop.value;
          }
        });
        objMap.set(patch.id, obj);
        break;
      }
      case PATCH_TYPE_DELETE_OBJECT:
        objMap.delete(patch.id);
        break;
      case PATCH_TYPE_RETURN_STATE:
        state = objMap.get(patch.id);
        break;
      default:
        throw new Error(`wrapStore unknown patch type: ${patch.type}`);
    }
  });
  return state;
};

const applyWorker = worker => createStoreOrig => (...args) => {
  const store = createStoreOrig(...args);
  const dispatch = (action) => {
    if (typeof action.type === 'string') {
      worker.postMessage(action);
    } else {
      store.dispatch(action);
    }
  };
  const objMap = new Map();
  worker.onmessage = (e) => {
    const state = applyPatches(objMap, store.getState(), e.data);
    store.dispatch({ type: REPLACE_STATE, state });
  };
  worker.onerror = () => {
    console.error('wrapStore worker error');
  };
  worker.onmessageerror = () => {
    console.error('wrapStore worker message error');
  };
  return {
    ...store,
    dispatch,
  };
};

export const wrapStore = (worker, initialState, enhancer) => {
  const reducer = (state, action) => {
    if (action.type === REPLACE_STATE) return action.state;
    return state;
  };
  const store = createStore(
    reducer,
    initialState,
    compose(applyWorker(worker), enhancer || (x => x)),
  );
  return store;
};
