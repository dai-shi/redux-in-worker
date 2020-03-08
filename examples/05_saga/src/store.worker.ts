import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import {
  call,
  put,
  delay,
  takeLatest,
  takeEvery,
  all,
} from 'redux-saga/effects';

import { exposeStore } from 'redux-in-worker';

const sagaMiddleware = createSagaMiddleware();

export const initialState = {
  count: 0,
  person: {
    name: '',
    loading: false,
  },
};

export type State = typeof initialState;

type ReducerAction =
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'SET_NAME'; name: string }
  | { type: 'START_FETCH_USER' }
  | { type: 'SUCCESS_FETCH_USER'; name: string }
  | { type: 'ERROR_FETCH_USER' };

type AsyncActionFetch = { type: 'FETCH_USER'; id: number }
type AsyncActionDecrement = { type: 'DELAYED_DECREMENT' };
type AsyncAction = AsyncActionFetch | AsyncActionDecrement;

export type Action = ReducerAction | AsyncAction;

function* userFetcher(action: AsyncActionFetch) {
  try {
    yield put<ReducerAction>({ type: 'START_FETCH_USER' });
    const response = yield call(() => fetch(`https://jsonplaceholder.typicode.com/users/${action.id}`));
    const data = yield call(() => response.json());
    yield delay(500);
    const { name } = data;
    if (typeof name !== 'string') throw new Error();
    yield put<ReducerAction>({ type: 'SUCCESS_FETCH_USER', name });
  } catch (e) {
    yield put<ReducerAction>({ type: 'ERROR_FETCH_USER' });
  }
}

function* delayedDecrementer() {
  yield delay(500);
  yield put<ReducerAction>({ type: 'DECREMENT' });
}

function* userFetchingSaga() {
  yield takeLatest<AsyncActionFetch>('FETCH_USER', userFetcher);
}

function* delayedDecrementingSaga() {
  yield takeEvery<AsyncActionDecrement>('DELAYED_DECREMENT', delayedDecrementer);
}

function* rootSaga() {
  yield all([
    userFetchingSaga(),
    delayedDecrementingSaga(),
  ]);
}

const reducer = (state = initialState, action: ReducerAction) => {
  console.log({ state, action });
  switch (action.type) {
    case 'INCREMENT': return {
      ...state,
      count: state.count + 1,
    };
    case 'DECREMENT': return {
      ...state,
      count: state.count - 1,
    };
    case 'SET_NAME': return {
      ...state,
      person: {
        ...state.person,
        name: action.name,
      },
    };
    case 'START_FETCH_USER': return {
      ...state,
      person: {
        ...state.person,
        loading: true,
      },
    };
    case 'SUCCESS_FETCH_USER': return {
      ...state,
      person: {
        ...state.person,
        name: action.name,
        loading: false,
      },
    };
    case 'ERROR_FETCH_USER': return {
      ...state,
      person: {
        ...state.person,
        name: 'ERROR',
        loading: false,
      },
    };
    default: return state;
  }
};

const store = createStore(reducer, applyMiddleware(sagaMiddleware));
sagaMiddleware.run(rootSaga);

exposeStore(store);
