# redux-in-worker

[![Build Status](https://travis-ci.com/dai-shi/redux-in-worker.svg?branch=master)](https://travis-ci.com/dai-shi/redux-in-worker)
[![npm version](https://badge.fury.io/js/redux-in-worker.svg)](https://badge.fury.io/js/redux-in-worker)
[![bundle size](https://badgen.net/bundlephobia/minzip/redux-in-worker)](https://bundlephobia.com/result?p=redux-in-worker)

Entire Redux in Web Worker

## Introduction

Inspired by [React + Redux + Comlink = Off-main-thread](https://dassur.ma/things/react-redux-comlink/).

This is still an experimental project.

Some key points are:
- It only sends "diffs" from the worker thread to the main thread.
- All Objects in a state tree keep the ref equality.
- It can run middleware in the worker thread.
- No async functions are involved.
- No proxies are involved (at the moment).

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
const worker = new Worker('./store.worker', { type: 'module' });
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
PORT=8080 npm run examples:minimal
```

and open <http://localhost:8080> in your web browser.
