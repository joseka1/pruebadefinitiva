"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _isEmpty = _interopRequireDefault(require("is-empty"));

var _postgresApi = _interopRequireDefault(require("../middleware/postgresApi"));

var _FormValidator = _interopRequireDefault(require("../middleware/FormValidator"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = new _express.default.Router();
/**
 * Handle request with form validation.
 *
 * @param {function} preValidation - form data validation function.
 * @param {function} callback - to do after a validation success.
 * @return {function} request handler.
 */

var requestFormValidation = function requestFormValidation(preValidation, callback) {
  return function (req, res, next) {
    if (req.body && req.body.data) req.body = JSON.parse(req.body.data);
    var formValidation = preValidation(req.body, req.method);
    if (formValidation.isValid) return callback(req, res, next);
    res.status(400).json(formValidation);
  };
};
/**
 * Handle request with file upload.
 *
 * @param {function} preValidation - form data validation function.
 * @param {function} callback - to do after the upload process.
 * @return {function} request handler.
 */


var requestUpload = function requestUpload(preValidation, callback, _ref) {
  var filterName = _ref.filterName,
      fileSize = _ref.fileSize,
      fieldList = _ref.fieldList;
  return function (req, res, next) {
    if ((0, _isEmpty.default)(fieldList)) {
      return res.status(500).json({
        success: false,
        message: 'Error al procesar los archivos.'
      });
    }

    upload(filterName, fileSize).fields(fieldList)(req, res, function (err) {
      if (req.body && req.body.data) req.body = JSON.parse(req.body.data);
      var formValidation = preValidation(req.body, err);
      if (formValidation.isValid) return callback(req, res, next);
      var pathList = [];
      fieldList.map(function (field) {
        if (req.files[field.name]) req.files[field.name].map(function (row) {
          return pathList.push(row.path);
        });
      });
      deleteFileList(pathList);
      res.status(400).json(formValidation);
    });
  };
}; // Return logged user information request


router.get('/userInfo', function (req, res) {
  res.status(200).json({
    id: req.user.id,
    name: req.user.name,
    userId: req.user['user_id'],
    type: req.user['user_type_id']
  });
});
router.post('/authenticatedUser', _postgresApi.default.getAuthenticatedUserData); // DELETE request
// GET request

router.get('/user', _postgresApi.default.getUserList);
router.get('/user/:id', _postgresApi.default.getUserById);
router.get('/userType', _postgresApi.default.getUserTypeList); // POST request

router.post('/user', requestFormValidation(_FormValidator.default.userForm, _postgresApi.default.insertUser)); // PUT request

router.put('/user/:id', requestFormValidation(_FormValidator.default.userForm, _postgresApi.default.updateUser)); // Handle invalid URI request.

router.all('*', function (req, res) {
  res.status(404).json({
    message: 'La ruta de la solicitud HTTP no es reconocida por el servidor.'
  });
});
var _default = router;
exports.default = _default;