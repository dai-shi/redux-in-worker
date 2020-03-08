import React from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { State } from './store.worker';

const Person = () => {
  const person = useSelector((state: State) => state.person);
  const dispatch = useDispatch();
  const fetchRandomName = () => {
    const id = Math.floor(10 * Math.random()) + 1;
    const action = {
      type: 'FETCH_USER',
      id,
    };
    dispatch(action);
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
