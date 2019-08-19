"use strict";

require("core-js/modules/es.symbol");

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.symbol.iterator");

require("core-js/modules/es.array.for-each");

require("core-js/modules/es.array.is-array");

require("core-js/modules/es.array.iterator");

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
exports.exposeStore = exports.PROP_TYPE_OBJECT = exports.PATCH_TYPE_RETURN_STATE = exports.PATCH_TYPE_DELETE_OBJECT = exports.PATCH_TYPE_CREATE_OBJECT = void 0;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/* eslint no-plusplus: 0 */
var PATCH_TYPE_CREATE_OBJECT = 1;
exports.PATCH_TYPE_CREATE_OBJECT = PATCH_TYPE_CREATE_OBJECT;
var PATCH_TYPE_DELETE_OBJECT = 2;
exports.PATCH_TYPE_DELETE_OBJECT = PATCH_TYPE_DELETE_OBJECT;
var PATCH_TYPE_RETURN_STATE = 3;
exports.PATCH_TYPE_RETURN_STATE = PATCH_TYPE_RETURN_STATE;
var PROP_TYPE_OBJECT = 4;
exports.PROP_TYPE_OBJECT = PROP_TYPE_OBJECT;
var idCount = 0;
var idSet = new Set();
var idMap = new WeakMap();

var createPatches = function createPatches(state) {
  var patches = []; // better way to detect "DELETE_OBJECT"?

  var idSetToRemove = new Set(idSet);

  var markUsed = function markUsed(baseObj) {
    var pending = [baseObj];

    var _loop = function _loop() {
      var obj = pending.pop();
      var id = idMap.get(obj);

      if (idSetToRemove.has(id)) {
        idSetToRemove["delete"](id);
        Object.keys(obj).forEach(function (name) {
          if (_typeof(obj[name]) === 'object' && obj[name] !== null) {
            pending.push(obj[name]);
          }
        });
      }
    };

    while (pending.length) {
      _loop();
    }
  }; // so ugly, needs refinement


  var walk = function walk(rootObj) {
    var rootDest = {};
    var pending = [{
      obj: rootObj,
      dest: rootDest
    }];

    var _loop2 = function _loop2() {
      var _pending$pop = pending.pop(),
          obj = _pending$pop.obj,
          dest = _pending$pop.dest;

      if (idMap.has(obj)) {
        markUsed(obj);
        dest.id = idMap.get(obj);
      } else {
        var id = ++idCount;
        dest.id = id;
        idMap.set(obj, id);
        idSet.add(id);
        var keys = Object.keys(obj);
        var props = new Array(keys.length);
        patches.unshift({
          type: PATCH_TYPE_CREATE_OBJECT,
          isArray: Array.isArray(obj),
          id: id,
          props: props
        });
        keys.forEach(function (name, i) {
          if (_typeof(obj[name]) === 'object' && obj[name] !== null) {
            var prop = {
              type: PROP_TYPE_OBJECT,
              name: name
            };
            props[i] = prop;
            pending.push({
              obj: obj[name],
              dest: prop
            });
          } else {
            props[i] = {
              name: name,
              value: obj[name]
            };
          }
        });
      }
    };

    while (pending.length) {
      _loop2();
    }

    return rootDest.id;
  };

  patches.push({
    type: PATCH_TYPE_RETURN_STATE,
    id: walk(state)
  });
  idSetToRemove.forEach(function (id) {
    idSet["delete"](id);
    patches.push({
      type: PATCH_TYPE_DELETE_OBJECT,
      id: id
    });
  });
  return patches;
};

var exposeStore = function exposeStore(store) {
  self.onmessage = function (e) {
    var action = e.data;

    if (typeof action.type === 'string') {
      store.dispatch(action);
    }
  };

  var listener = function listener() {
    var patches = createPatches(store.getState());
    self.postMessage(patches);
  };

  store.subscribe(listener);
  listener(); // run once
};

exports.exposeStore = exposeStore;