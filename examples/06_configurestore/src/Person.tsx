import React from 'react';

import { useDispatch, useSelector } from 'react-redux';

import {
  State,
  setFirstName,
  setLastName,
  setAge,
} from './store.worker';

const Person = () => {
  const person = useSelector((state: State) => state.person);
  const dispatch = useDispatch();
  return (
    <div>
      {Math.random()}
      <div>
        First Name:
        <input
          value={person.firstName}
          onChange={(event) => {
            const firstName = event.target.value;
            dispatch(setFirstName(firstName));
          }}
        />
      </div>
      <div>
        Last Name:
        <input
          value={person.lastName}
          onChange={(event) => {
            const lastName = event.target.value;
            dispatch(setLastName(lastName));
          }}
        />
      </div>
      <div>
        Age:
        <input
          value={person.age}
          onChange={(event) => {
            const age = Number(event.target.value) || 0;
            dispatch(setAge(age));
          }}
        />
      </div>
    </div>
  );
};

export default Person;
