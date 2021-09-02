import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';

import { wrapStore } from 'redux-in-worker';

import { initialState } from './store.worker';

const store = wrapStore(
  new Worker(new URL('./store.worker', import.meta.url)),
  initialState,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
);

const Counter = () => {
  const dispatch = useDispatch();
  const count = useSelector((state) => state.count);
  return (
    <div>
      count: {count}
      <button type="button" onClick={() => dispatch({ type: 'increment' })}>+1</button>
      <button type="button" onClick={() => dispatch({ type: 'decrement' })}>-1</button>
    </div>
  );
};

const App = () => (
  <StrictMode>
    <Provider store={store}>
      <Counter />
      <Counter />
    </Provider>
  </StrictMode>
);

ReactDOM.render(<App />, document.getElementById('app'));
