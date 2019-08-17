"use strict";

require("core-js/modules/es.object.define-property");

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "wrapStore", {
  enumerable: true,
  get: function get() {
    return _wrapStore.wrapStore;
  }
});
Object.defineProperty(exports, "exposeStore", {
  enumerable: true,
  get: function get() {
    return _exposeStore.exposeStore;
  }
});

var _wrapStore = require("./wrapStore");

var _exposeStore = require("./exposeStore");