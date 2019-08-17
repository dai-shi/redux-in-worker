import { Store, Action, AnyAction } from 'redux';

export type WrapStore = <S, A extends Action = AnyAction>(
  worker: Worker,
  initialState?: S,
) => Store<S, A>;

export type ExposeStore = <S, A extends Action = AnyAction>(
  store: Store<S, A>,
) => void;

export const wrapStore: WrapStore;
export const exposeStore: ExposeStore;
