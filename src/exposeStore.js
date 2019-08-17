/* eslint no-plusplus: 0 */

let idCount = 0;
const idSet = new Set();
const idMap = new WeakMap();
const createPatches = (state) => {
  const patches = [];

  // better way to detect "DELETE_OBJECT"?
  const idSetToRemove = new Set(idSet);
  const touchId = (obj) => {
    idSetToRemove.delete(idMap.get(obj));
    Object.keys(obj).forEach((name) => {
      touchId(obj[name]);
    });
  };

  const walk = (obj) => {
    if (idMap.has(obj)) {
      touchId(obj);
      return idMap.get(obj);
    }
    const props = Object.keys(obj).map((name) => {
      if (typeof obj[name] === 'object') {
        const id = walk(obj[name]);
        return { type: 'OBJECT', name, id };
      }
      return { name, value: obj[name] };
    });
    const id = ++idCount;
    idMap.set(obj, id);
    idSet.add(id);
    patches.push({
      type: 'CREATE_OBJECT',
      isArray: Array.isArray(obj),
      id,
      props,
    });
    return id;
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
    store.dispatch(e.data);
  };
  const listener = () => {
    const patches = createPatches(store.getState());
    self.postMessage(patches);
  };
  store.subscribe(listener);
  listener(); // run once
};
