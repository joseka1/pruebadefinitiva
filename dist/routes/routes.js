"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _routes = require("./routes.json");

var _withAuthCheck = _interopRequireDefault(require("../container/withAuthCheck"));

var _Root = _interopRequireDefault(require("../component/Root"));

var _Base = _interopRequireDefault(require("../component/Base"));

var _LoginPage = _interopRequireDefault(require("../container/LoginPage"));

var _HomePage = _interopRequireDefault(require("../component/HomePage"));

var _NotFoundPage = _interopRequireDefault(require("../component/NotFoundPage"));

var _UserPage = _interopRequireDefault(require("../container/UserPage"));

var _UserListPage = _interopRequireDefault(require("../container/UserListPage"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var routes = [{
  component: _Root.default,
  routes: [{
    path: _routes.client.login,
    component: _LoginPage.default
  }, {
    component: _Base.default,
    routes: [{
      path: _routes.client.home,
      exact: true,
      component: _HomePage.default
    }, {
      path: _routes.client.userList,
      exact: true,
      component: _UserListPage.default
    }, {
      path: _routes.client.user,
      exact: true,
      component: _UserPage.default
    }, {
      path: "".concat(_routes.client.user, "/:id"),
      exact: true,
      component: _UserPage.default
    }, {
      path: '*',
      component: _NotFoundPage.default
    }]
  }]
}];

var addAuthCheck = function addAuthCheck(routes) {
  routes.map(function (route) {
    if (route.routes !== undefined) addAuthCheck(route.routes);else route.component = (0, _withAuthCheck.default)(route.component);
  });
  return routes;
};

var _default = addAuthCheck(routes);

exports.default = _default;