import { createSlice, configureStore, PayloadAction } from '@reduxjs/toolkit';
import { exposeStore } from 'redux-in-worker';

export const initialState = {
  counter: {
    value: 0,
  },
  person: {
    age: 0,
    firstName: '',
    lastName: '',
  },
};

export type State = typeof initialState;

export type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'setFirstName'; firstName: string }
  | { type: 'setLastName'; lastName: string }
  | { type: 'setAge'; age: number };

const counterSlice = createSlice({
  name: 'counter',
  initialState: initialState.counter,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
  },
});

export const { increment, decrement } = counterSlice.actions;

const personSlice = createSlice({
  name: 'person',
  initialState: initialState.person,
  reducers: {
    setFirstName: (state, action: PayloadAction<string>) => {
      state.firstName = action.payload;
    },
    setLastName: (state, action: PayloadAction<string>) => {
      state.lastName = action.payload;
    },
    setAge: (state, action: PayloadAction<number>) => {
      state.age = action.payload;
    },
  },
});

export const { setFirstName, setLastName, setAge } = personSlice.actions;

const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
    person: personSlice.reducer,
  },
});

exposeStore(store);
