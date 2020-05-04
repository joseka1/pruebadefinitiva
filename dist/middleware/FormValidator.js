"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.validateUserForm = void 0;

var _isEmpty = _interopRequireDefault(require("is-empty"));

var _validator = require("validator");

var _rutjs = _interopRequireDefault(require("rutjs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var validationFunctions = {};

var validateUserForm = validationFunctions.userForm = function (payload, method) {
  var errors = {};
  var isValid = true;
  var message = '';

  if (payload) {
    if (method == 'POST') {
      var rut = new _rutjs.default(payload.rut);

      if ((0, _isEmpty.default)(payload.rut) || !rut.isValid) {
        isValid = false;
        errors.rut = 'Debe ingresar un rut válido';
      }

      if ((0, _isEmpty.default)(payload.password)) {
        isValid = false;
        errors.password = 'Debe ingresar una contraseña';
      }

      if ((0, _isEmpty.default)(payload.confirmPassword)) {
        isValid = false;
        errors.confirmPassword = 'Debe ingresar la confirmación de la contraseña';
      } else if (!(0, _isEmpty.default)(payload.password) && payload.password != payload.confirmPassword) {
        isValid = false;
        errors.password = 'Contraseñas no coinciden';
        errors.confirmPassword = 'Contraseñas no coinciden';
      }
    }

    if ((0, _isEmpty.default)(payload.name)) {
      isValid = false;
      errors.name = 'Debe ingresar un nombre de usuario';
    }

    if ((0, _isEmpty.default)(payload.email) || !(0, _validator.isEmail)(payload.email)) {
      isValid = false;
      errors.email = 'Debe ingresar un email válido';
    }

    if ((0, _isEmpty.default)(payload.phone) || !(0, _validator.isInt)(payload.phone)) {
      isValid = false;
      errors.phone = 'Debe ingresar un telefono válido';
    }

    if ((0, _isEmpty.default)(payload.userType)) {
      isValid = false;
      errors.userType = 'Debe seleccionar un tipo de usuario';
    }

    if (!isValid) message = 'Verifique los errores del formulario.';
  } else {
    isValid = false;
    message = 'Error al recibir los datos del formulario.';
  }

  return {
    isValid: isValid,
    message: message,
    errors: errors
  };
};

exports.validateUserForm = validateUserForm;
var _default = validationFunctions;
exports.default = _default;