import { Store, Action, AnyAction } from 'redux';

export const PATCH_TYPE_CREATE_OBJECT = 1;
export const PATCH_TYPE_DELETE_OBJECT = 2;
export const PATCH_TYPE_RETURN_STATE = 3;

let idCount = 0;
const idSet = new Set();
const idMap = new WeakMap();
const createPatches = (state: any) => {
  const patches = [];

  // better way to detect "DELETE_OBJECT"?
  const idSetToRemove = new Set(idSet);
  const markUsed = (baseObj: any) => {
    const pending = [baseObj];
    while (pending.length) {
      const obj = pending.pop();
      const id = idMap.get(obj);
      if (idSetToRemove.has(id)) {
        idSetToRemove.delete(id);
        Object.keys(obj).forEach((name) => {
          if (typeof obj[name] === 'object' && obj[name] !== null) {
            pending.push(obj[name]);
          }
        });
      }
    }
  };

  // is there a better way?
  const walk = (rootObj: any) => {
    const rootDest: any = {};
    const pending = [{ obj: rootObj, dest: rootDest }];
    while (pending.length) {
      const { obj, dest }: any = pending.pop();
      if (idMap.has(obj)) {
        markUsed(obj);
        dest.id = idMap.get(obj);
      } else {
        const id = ++idCount;
        dest.id = id;
        idMap.set(obj, id);
        idSet.add(id);
        const props: any = {};
        patches.unshift({
          type: PATCH_TYPE_CREATE_OBJECT,
          isArray: Array.isArray(obj),
          id,
          props,
        });
        Object.keys(obj).forEach((name) => {
          const value = obj[name];
          if (typeof value === 'object' && value !== null) {
            const prop = {};
            props[name] = prop;
            pending.push({ obj: value, dest: prop });
          } else {
            props[name] = value;
          }
        });
      }
    }
    return rootDest.id;
  };

  patches.push({
    type: PATCH_TYPE_RETURN_STATE,
    id: walk(state),
  });

  idSetToRemove.forEach((id) => {
    idSet.delete(id);
    patches.push({
      type: PATCH_TYPE_DELETE_OBJECT,
      id,
    });
  });

  return patches;
};

export const exposeStore = <S, A extends Action = AnyAction>(
  store: Store<S, A>,
) => {
  self.onmessage = (e) => {
    const action = e.data;
    if (typeof action.type === 'string') {
      store.dispatch(action);
    }
  };
  const listener = () => {
    const patches = createPatches(store.getState());
    self.postMessage(patches);
  };
  store.subscribe(listener);
  listener(); // run once
};
