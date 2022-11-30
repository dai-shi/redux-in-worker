import React from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { State, increment, decrement } from './store.worker';

const Counter = () => {
  const count = useSelector((state: State) => state.counter.value);
  const dispatch = useDispatch();
  return (
    <div>
      {Math.random()}
      <div>
        <span>Count: {count}</span>
        <button type="button" onClick={() => dispatch(increment())}>+1</button>
        <button type="button" onClick={() => dispatch(decrement())}>-1</button>
      </div>
    </div>
  );
};

export default Counter;
