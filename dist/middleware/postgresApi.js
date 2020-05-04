"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _postgresConnection = _interopRequireDefault(require("./postgresConnection"));

var _routes = require("../routes/routes.json");

var _user = _interopRequireDefault(require("../models/user"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var functionQueries = {};

functionQueries.getAuthenticatedUserData = function (req, res) {
  var user = {
    id: req.user.id,
    userId: req.user['user_id'],
    campus: req.user['campus_id'],
    name: req.user.name,
    type: req.user['user_type_id']
  };
  var data = {
    type: user.type,
    pathname: req.body.pathname || ''
  };

  _postgresConnection.default.tx(function (t) {
    var queries = [];
    var query = 'SELECT COUNT(*)\
                FROM user_permission INNER JOIN system_page ON user_permission.system_page_id = system_page.id\
                WHERE user_permission.user_type_id = ${type} AND system_page.link = ${pathname}';
    queries.push(t.one(query, data));
    query = 'SELECT menu_group.text, CASE WHEN menu_group.menu_order IS NULL THEN 0 ELSE menu_group.menu_order END AS menu_order,\
              json_agg(json_build_object(\'text\', system_page.text, \'link\', system_page.link, \'icon\', system_page.icon) ORDER BY user_permission.menu_order) AS link\
            FROM user_permission\
              INNER JOIN system_page ON user_permission.system_page_id = system_page.id\
              LEFT JOIN menu_group ON user_permission.menu_group_id = menu_group.id\
            WHERE user_type_id = ${type} AND in_menu\
            GROUP BY menu_group.menu_order, menu_group.text\
            ORDER BY menu_order';
    queries.push(t.any(query, data));
    return t.batch(queries);
  }).then(function (result) {
    var menu = [];
    result[1].map(function (row) {
      if (!row.text) row.link.map(function (menuItem) {
        return menu.push(menuItem);
      });else menu.push(row);
    });
    var permission = [_routes.client.login, _routes.client.home, '*'].indexOf(data.pathname) != -1 || result[0].count > 0;
    res.status(permission ? 200 : 403).json({
      logged: true,
      hasPermission: permission,
      user: user,
      menu: menu
    });
  }).catch(function (err) {
    console.log(err);
    res.status(500).json({
      error: err,
      message: 'Error al obtener los datos del usuario.'
    });
  });
};
/**
 * 
 */


functionQueries.getUserById = function (req, res) {
  var query = 'SELECT user_id as rut, user_type_id as user_type, name, email, phone FROM public.user WHERE user_id = $1';

  _postgresConnection.default.oneOrNone(query, req.params.id).then(function (data) {
    res.status(200).json({
      data: data
    });
  }).catch(function (err) {
    res.status(400).json({
      error: err,
      message: 'Error al obtener los datos del usuario.'
    });
  });
};
/**
 * 
 */


functionQueries.getUserList = function (req, res) {
  var query = 'SELECT user_id AS rut, user_type_id AS user_type, name, email, phone FROM "user"';

  _postgresConnection.default.any(query).then(function (data) {
    res.status(200).json({
      data: data
    });
  }).catch(function (err) {
    res.status(500).json({
      error: err,
      message: 'Error al obtener la lista de usuarios.'
    });
  });
};
/**
 * 
 */


functionQueries.getUserTypeList = function (req, res) {
  _postgresConnection.default.any('SELECT * FROM user_type').then(function (data) {
    res.status(200).json({
      data: data
    });
  }).catch(function (err) {
    res.status(500).json({
      error: err,
      message: 'Error al obtener la lista de tipos de usuario.'
    });
  });
};
/**
 * 
 */


functionQueries.insertUser = function (req, res) {
  _user.default.register({
    user_id: req.body.rut,
    user_type_id: req.body.userType,
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone
  }, req.body.password, function (err) {
    if (err) {
      var error = 'No se pudo procesar el formulario.';

      if (err.message.indexOf('User already exists') !== -1) {
        error = 'El usuario ingresado ya existe.';
      }

      return res.status(400).json({
        success: false,
        message: error,
        error: err.message
      });
    } else {
      return res.status(200).json({
        success: true,
        message: 'Usuario ingresado con correctamente.'
      });
    }
  });
};
/**
 * 
 */


functionQueries.updateUser = function (req, res) {
  _postgresConnection.default.tx(function (t) {
    var queryData = {
      user_id: req.params.id,
      name: req.body.name,
      user_type_id: req.body.userType,
      email: req.body.email,
      phone: req.body.phone
    };
    var query = 'UPDATE "user"\
                SET user_type_id = ${user_type_id}, name = ${name}, email = ${email}, phone = ${phone}\
                WHERE user_id = ${user_id}';
    return t.none(query, queryData);
  }).then(function (data) {
    res.status(200).json({
      data: data
    });
  }).catch(function (err) {
    res.status(400).json({
      error: err,
      message: 'Error al actualizar los datos del usuario.'
    });
  });
};

var _default = functionQueries;
exports.default = _default;