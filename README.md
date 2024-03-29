# redux-in-worker

[![CI](https://img.shields.io/github/workflow/status/dai-shi/redux-in-worker/CI)](https://github.com/dai-shi/redux-in-worker/actions?query=workflow%3ACI)
[![npm](https://img.shields.io/npm/v/redux-in-worker)](https://www.npmjs.com/package/redux-in-worker)
[![size](https://img.shields.io/bundlephobia/minzip/redux-in-worker)](https://bundlephobia.com/result?p=redux-in-worker)
[![discord](https://img.shields.io/discord/627656437971288081)](https://discord.gg/MrQdmzd)

Entire Redux in Web Worker

## Introduction

Inspired by [React + Redux + Comlink = Off-main-thread](https://dassur.ma/things/react-redux-comlink/).

This is still an experimental project.
Please give us a feedback to make it stable.

Some key points are:
- It only sends "diffs" from the worker thread to the main thread.
- All Objects in a state tree keep the ref equality.
- It can run middleware in the worker thread. (only non-DOM middleware [#2](https://github.com/dai-shi/redux-in-worker/issues/2))
- No async functions are involved.
- No proxies are involved.

## Install

```bash
npm install redux-in-worker
```

## Usage

store.worker.js:
```javascript
import { createStore } from 'redux';
import { exposeStore } from 'redux-in-worker';

const initialState = { count: 0 };
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
```

app.js:
```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { wrapStore } from 'redux-in-worker';

const initialState = { count: 0 };
const worker = new Worker(new URL('./store.worker', import.meta.url));
const store = wrapStore(worker, initialState);

const Counter = () => {
  const dispatch = useDispatch();
  const count = useSelector(state => state.count);
  return (
    <div>
      count: {count}
      <button type="button" onClick={() => dispatch({ type: 'increment' })}>+1</button>
      <button type="button" onClick={() => dispatch({ type: 'decrement' })}>-1</button>
    </div>
  );
};

const App = () => (
  <Provider store={store}>
    <Counter />
    <Counter />
  </Provider>
);

ReactDOM.render(<App />, document.getElementById('app'));
```

## Examples

The [examples](examples) folder contains working examples.
You can run one of them with

```bash
PORT=8080 npm run examples:01_minimal
```

and open <http://localhost:8080> in your web browser.

## Blogs

- [Off-main-thread React Redux with Performance](https://blog.axlight.com/posts/off-main-thread-react-redux-with-performance/)
- [Redux in Worker: Off-main-thread Redux Reducers and Middleware](https://blog.axlight.com/posts/redux-in-worker-off-main-thread-redux-reducers-and-middleware/)
