"use strict";

require("core-js/modules/es.symbol");

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.symbol.iterator");

require("core-js/modules/es.array.filter");

require("core-js/modules/es.array.for-each");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.map");

require("core-js/modules/es.object.define-properties");

require("core-js/modules/es.object.define-property");

require("core-js/modules/es.object.get-own-property-descriptor");

require("core-js/modules/es.object.get-own-property-descriptors");

require("core-js/modules/es.object.keys");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.string.iterator");

require("core-js/modules/web.dom-collections.for-each");

require("core-js/modules/web.dom-collections.iterator");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.wrapStore = void 0;

var _redux = require("redux");

var _exposeStore = require("./exposeStore");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var REPLACE_STATE = Symbol('REPLACE_STATE');

var applyPatches = function applyPatches(objMap, oldState, patches) {
  var state = oldState;
  patches.forEach(function (patch) {
    switch (patch.type) {
      case _exposeStore.PATCH_TYPE_CREATE_OBJECT:
        {
          var obj = patch.isArray ? [] : {};
          Object.keys(patch.props).forEach(function (name) {
            var value = patch.props[name];

            if (_typeof(value) === 'object' && value !== null) {
              obj[name] = objMap.get(value.id);
            } else {
              obj[name] = value;
            }
          });
          objMap.set(patch.id, obj);
          break;
        }

      case _exposeStore.PATCH_TYPE_DELETE_OBJECT:
        objMap["delete"](patch.id);
        break;

      case _exposeStore.PATCH_TYPE_RETURN_STATE:
        state = objMap.get(patch.id);
        break;

      default:
        throw new Error("wrapStore unknown patch type: ".concat(patch.type));
    }
  });
  return state;
};

var applyWorker = function applyWorker(worker) {
  return function (createStoreOrig) {
    return function () {
      var store = createStoreOrig.apply(void 0, arguments);

      var dispatch = function dispatch(action) {
        if (typeof action.type === 'string') {
          worker.postMessage(action);
        } else {
          store.dispatch(action);
        }
      };

      var objMap = new Map();

      worker.onmessage = function (e) {
        var state = applyPatches(objMap, store.getState(), e.data);
        store.dispatch({
          type: REPLACE_STATE,
          state: state
        });
      };

      worker.onerror = function () {
        console.error('wrapStore worker error');
      };

      worker.onmessageerror = function () {
        console.error('wrapStore worker message error');
      };

      return _objectSpread({}, store, {
        dispatch: dispatch
      });
    };
  };
};

var wrapStore = function wrapStore(worker, initialState, enhancer) {
  var reducer = function reducer(state, action) {
    if (action.type === REPLACE_STATE) return action.state;
    return state;
  };

  var store = (0, _redux.createStore)(reducer, initialState, (0, _redux.compose)(applyWorker(worker), enhancer || function (x) {
    return x;
  }));
  return store;
};

exports.wrapStore = wrapStore;