"use strict";

require("core-js/modules/es.symbol");

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.symbol.iterator");

require("core-js/modules/es.array.for-each");

require("core-js/modules/es.array.is-array");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.map");

require("core-js/modules/es.object.define-property");

require("core-js/modules/es.object.keys");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.set");

require("core-js/modules/es.string.iterator");

require("core-js/modules/es.weak-map");

require("core-js/modules/web.dom-collections.for-each");

require("core-js/modules/web.dom-collections.iterator");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.exposeStore = void 0;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/* eslint no-plusplus: 0 */
var idCount = 0;
var idSet = new Set();
var idMap = new WeakMap();

var createPatches = function createPatches(state) {
  var patches = []; // better way to detect "DELETE_OBJECT"?

  var idSetToRemove = new Set(idSet);

  var touchId = function touchId(obj) {
    idSetToRemove["delete"](idMap.get(obj));
    Object.keys(obj).forEach(function (name) {
      touchId(obj[name]);
    });
  };

  var walk = function walk(obj) {
    if (idMap.has(obj)) {
      touchId(obj);
      return idMap.get(obj);
    }

    var props = Object.keys(obj).map(function (name) {
      if (_typeof(obj[name]) === 'object') {
        var _id = walk(obj[name]);

        return {
          type: 'OBJECT',
          name: name,
          id: _id
        };
      }

      return {
        name: name,
        value: obj[name]
      };
    });
    var id = ++idCount;
    idMap.set(obj, id);
    idSet.add(id);
    patches.push({
      type: 'CREATE_OBJECT',
      isArray: Array.isArray(obj),
      id: id,
      props: props
    });
    return id;
  };

  patches.push({
    type: 'RETURN_STATE',
    id: walk(state)
  });
  idSetToRemove.forEach(function (id) {
    idSet["delete"](id);
    patches.push({
      type: 'DELETE_OBJECT',
      id: id
    });
  });
  return patches;
};

var exposeStore = function exposeStore(store) {
  self.onmessage = function (e) {
    store.dispatch(e.data);
  };

  var listener = function listener() {
    var patches = createPatches(store.getState());
    self.postMessage(patches);
  };

  store.subscribe(listener);
  listener(); // run once
};

exports.exposeStore = exposeStore;