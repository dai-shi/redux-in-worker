import * as React from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { State } from './store.worker';

const Counter = () => {
  const count = useSelector((state: State) => state.count);
  const dispatch = useDispatch();
  return (
    <div>
      {Math.random()}
      <div>
        <span>Count: {count}</span>
        <button type="button" onClick={() => dispatch({ type: 'increment' })}>+1</button>
        <button type="button" onClick={() => dispatch({ type: 'decrement' })}>-1</button>
      </div>
    </div>
  );
};

export default Counter;
