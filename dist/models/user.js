"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _sequelize = _interopRequireDefault(require("sequelize"));

var _passportLocalSequelize = _interopRequireDefault(require("passport-local-sequelize"));

var _config = require("../config.json");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Setup sequelize db connection
var db = new _sequelize.default(_config.dbUri, {
  logging: false,
  operatorsAliases: false,
  dialectOptions: {
    ssl: true
  }
}); // Define the User model.

var User = db.define('user', {
  user_id: _sequelize.default.STRING,
  user_type_id: _sequelize.default.STRING,
  name: _sequelize.default.STRING,
  email: _sequelize.default.STRING,
  phone: _sequelize.default.INTEGER,
  password_hash: _sequelize.default.STRING,
  password_salt: _sequelize.default.STRING
}, {
  freezeTableName: true,
  timestamps: false
}); // Atach passport to user model.

_passportLocalSequelize.default.attachToUser(User, {
  usernameField: 'user_id',
  hashField: 'password_hash',
  saltField: 'password_salt'
});

User.update = function (id, password, cb) {
  User.findByUsername(id, function (err, user) {
    if (err) return cb(err);
    if (!user) return cb(new Error('El usuario no existe.'));
    user.setPassword(password, function (err, user) {
      if (err) return cb(err);
      user.setActivationKey(function (err, user) {
        if (err) return cb(err);
        user['user_id'] = id;
        user.save().then(function () {
          return cb(null, user);
        }).catch(function (err) {
          return cb(err);
        });
      });
    });
  });
};

var _default = User;
exports.default = _default;