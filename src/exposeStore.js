/* eslint no-plusplus: 0 */

let idCount = 0;
const idSet = new Set();
const idMap = new WeakMap();
const createPatches = (state) => {
  const patches = [];

  // better way to detect "DELETE_OBJECT"?
  const idSetToRemove = new Set(idSet);
  const markUsed = (baseObj) => {
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

  // so ugly, needs refinement
  const walk = (rootObj) => {
    const rootDest = {};
    const pending = [{ obj: rootObj, dest: rootDest }];
    while (pending.length) {
      const { obj, dest } = pending.pop();
      if (idMap.has(obj)) {
        markUsed(obj);
        dest.id = idMap.get(obj);
      } else {
        const id = ++idCount;
        dest.id = id;
        idMap.set(obj, id);
        idSet.add(id);
        const keys = Object.keys(obj);
        const props = new Array(keys.length);
        patches.unshift({
          type: 'CREATE_OBJECT',
          isArray: Array.isArray(obj),
          id,
          props,
        });
        keys.forEach((name, i) => {
          if (typeof obj[name] === 'object' && obj[name] !== null) {
            const prop = { type: 'OBJECT', name };
            props[i] = prop;
            pending.push({ obj: obj[name], dest: prop });
          } else {
            props[i] = { name, value: obj[name] };
          }
        });
      }
    }
    return rootDest.id;
  };

  patches.push({
    type: 'RETURN_STATE',
    id: walk(state),
  });

  idSetToRemove.forEach((id) => {
    idSet.delete(id);
    patches.push({
      type: 'DELETE_OBJECT',
      id,
    });
  });

  return patches;
};

export const exposeStore = (store) => {
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
