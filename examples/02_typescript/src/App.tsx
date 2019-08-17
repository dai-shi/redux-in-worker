import * as React from 'react';
import { Provider } from 'react-redux';

import { wrapStore } from 'redux-in-worker';

import Counter from './Counter';
import Person from './Person';
import { initialState } from './store.worker';

const worker = new Worker('./store.worker', { type: 'module' });
const store = wrapStore(worker, initialState);

const App = () => (
  <React.StrictMode>
    <Provider store={store}>
      <Counter />
      <Person />
    </Provider>
  </React.StrictMode>
);

export default App;
