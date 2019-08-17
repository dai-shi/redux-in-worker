"use strict";

require("core-js/modules/es.symbol");

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.array.for-each");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.function.name");

require("core-js/modules/es.map");

require("core-js/modules/es.object.define-property");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.string.iterator");

require("core-js/modules/web.dom-collections.for-each");

require("core-js/modules/web.dom-collections.iterator");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.wrapStore = void 0;

var _redux = require("redux");

/* eslint no-param-reassign: 0, no-console: 0 */
var objMap = new Map();

var applyPatches = function applyPatches(oldState, patches) {
  var state = oldState;
  patches.forEach(function (patch) {
    switch (patch.type) {
      case 'CREATE_OBJECT':
        {
          var obj = patch.isArray ? [] : {};
          patch.props.forEach(function (prop) {
            if (prop.type === 'OBJECT') {
              obj[prop.name] = objMap.get(prop.id);
            } else {
              obj[prop.name] = prop.value;
            }
          });
          objMap.set(patch.id, obj);
          break;
        }

      case 'DELETE_OBJECT':
        objMap["delete"](patch.id);
        break;

      case 'RETURN_STATE':
        state = objMap.get(patch.id);
        break;

      default:
        throw new Error("wrapStore unknown patch type: ".concat(patch.type));
    }
  });
  return state;
};

var REPLACE_STATE = Symbol('REPLACE_STATE');

var reducer = function reducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments.length > 1 ? arguments[1] : undefined;

  if (action.type === REPLACE_STATE) {
    return action.state;
  }

  return state;
};

var wrapStore = function wrapStore(worker, initialState) {
  var middleware = function middleware() {
    return function (next) {
      return function (action) {
        if (action.type !== REPLACE_STATE) {
          worker.postMessage(action);
        }

        next(action);
      };
    };
  };

  var store = (0, _redux.createStore)(reducer, initialState, (0, _redux.applyMiddleware)(middleware));

  worker.onmessage = function (e) {
    var state = applyPatches(store.getState, e.data);
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

  return store;
};

exports.wrapStore = wrapStore;