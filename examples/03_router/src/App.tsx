import React from 'react';
import {
  compose,
  Store,
  Reducer,
  StoreCreator,
  StoreEnhancer,
  AnyAction,
  DeepPartial,
} from 'redux';
import { Provider } from 'react-redux';
import {
  ConnectedRouter,
  RouterState,
  LocationChangeAction,
  connectRouter,
} from 'connected-react-router';
import { createBrowserHistory } from 'history';

import { wrapStore } from 'redux-in-worker';

import routes from './routes';
import { initialState } from './store.worker';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/ban-types
    __REDUX_DEVTOOLS_EXTENSION__?: Function;
  }
}

const history = createBrowserHistory();

let innerStore: Store;
const routerEnhancer = (createStore: StoreCreator) => {
  const routerReducer = connectRouter(history);
  return (origReducer: Reducer, preloadedState?: DeepPartial<unknown>,
    enhancer?: StoreEnhancer) => {
    const reducer: Reducer = (state: { router: RouterState }, action: AnyAction) => {
      const newState = origReducer(state, action);
      return {
        ...newState,
        router: routerReducer(state.router, action as LocationChangeAction),
      };
    };
    innerStore = createStore(reducer, preloadedState, enhancer);
    return innerStore;
  };
};

const outerStore = wrapStore(
  new Worker('./store.worker', { type: 'module' }),
  initialState,
  compose(
    routerEnhancer,
    window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : (x: unknown) => x,
  ),
);
// FIXME no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dispatch: any = (action: AnyAction) => {
  outerStore.dispatch(action);
  innerStore.dispatch(action);
  return action;
};
const store = {
  ...outerStore,
  dispatch,
};

const App = () => (
  <React.StrictMode>
    <Provider store={store}>
      <ConnectedRouter history={history}>
        {routes}
      </ConnectedRouter>
    </Provider>
  </React.StrictMode>
);

export default App;
