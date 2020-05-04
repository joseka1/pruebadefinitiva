"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _bluebird = _interopRequireDefault(require("bluebird"));

var _pgPromise = _interopRequireDefault(require("pg-promise"));

var _config = require("../config.json");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var camelizeColumns = function camelizeColumns(data) {
  var template = data[0];

  for (var prop in template) {
    var camel = _pgPromise.default.utils.camelize(prop);

    if (!(camel in template)) {
      for (var i = 0; i < data.length; i++) {
        var d = data[i];
        d[camel] = d[prop];
        delete d[prop];
      }
    }
  }
};

var postgres = (0, _pgPromise.default)({
  promiseLib: _bluebird.default,
  receive: function receive(data, result, e) {
    camelizeColumns(data);
  }
});
var connection = postgres(_config.dbUri);
var _default = connection;
exports.default = _default;