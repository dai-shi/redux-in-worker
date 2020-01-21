import React from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { createAction } from 'redux-api-middleware';

import { useDispatch, useSelector } from 'react-redux';

import { State } from './store.worker';

const Person = () => {
  const person = useSelector((state: State) => state.person);
  const dispatch = useDispatch();
  const fetchRandomName = () => {
    const id = Math.floor(10 * Math.random()) + 1;
    const action = createAction({
      endpoint: `https://jsonplaceholder.typicode.com/users/${id}`,
      method: 'GET',
      types: ['REQUEST', 'SUCCESS', 'FAILURE'],
    });
    dispatch({ type: 'RSAA', ...action });
  };

  return (
    <div>
      {Math.random()}
      <div>
        Name:
        <input
          value={person.name}
          onChange={(event) => {
            const name = event.target.value;
            dispatch({ name, type: 'setName' });
          }}
        />
        <button type="button" onClick={fetchRandomName}>Fetch Random Name</button>
        {person.loading && 'Loading...'}
      </div>
    </div>
  );
};

export default Person;
