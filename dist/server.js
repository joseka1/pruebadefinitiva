"use strict";

var _path = _interopRequireDefault(require("path"));

var _express = _interopRequireDefault(require("express"));

var _expressSession = _interopRequireDefault(require("express-session"));

var _cookieParser = _interopRequireDefault(require("cookie-parser"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _methodOverride = _interopRequireDefault(require("method-override"));

var _pg = _interopRequireDefault(require("pg"));

var _connectPgSimple = _interopRequireDefault(require("connect-pg-simple"));

var _passport = _interopRequireDefault(require("passport"));

var _user = _interopRequireDefault(require("./models/user"));

var _config = _interopRequireDefault(require("./config.json"));

var _routes = require("./routes/routes.json");

var _auth = _interopRequireDefault(require("./routes/auth"));

var _api = _interopRequireDefault(require("./routes/api"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express.default)(); // Set view engine and views path directory

app.set('view engine', 'ejs');
app.set('views', _path.default.join(__dirname, 'views')); // Tell the app to look for static files in these directories

app.use(_express.default.static(_path.default.join(__dirname, 'static')));
app.use((0, _methodOverride.default)()); // Tell the app to parse HTTP body messages

app.use(_bodyParser.default.urlencoded({
  /*limit: '2mb',*/
  extended: false
})); // Initialize session options

var pgSession = (0, _connectPgSimple.default)(_expressSession.default);
app.use((0, _cookieParser.default)());
app.use((0, _expressSession.default)({
  store: new pgSession({
    pg: _pg.default,
    conString: _config.default.dbUri,
    tableName: 'session',
    schemaName: 'public'
  }),
  secret: _config.default.secret,
  resave: false,
  saveUninitialized: false,
  expires: new Date(Date.now() + 3600000),
  // 1 Hour
  cookie: {
    httpOnly: true,
    secure: false // With secure: true can't access the session stored

  }
})); // Pass the passport middleware

app.use(_passport.default.initialize());
app.use(_passport.default.session()); // Load passport strategies

_passport.default.use(_user.default.createStrategy());

_passport.default.serializeUser(_user.default.serializeUser());

_passport.default.deserializeUser(_user.default.deserializeUser());
/**
 * Check if user is logged
 */


var isAuthenticated = function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({
    error: 'Unauthorized access',
    message: 'User must be logged to access the specified URI'
  });
}; // Routes


app.use("".concat(_routes.basename, "/auth"), _auth.default);
app.use("".concat(_routes.basename, "/api"), isAuthenticated, _api.default);
app.get("".concat(_routes.basename, "*"), function (req, res) {
  if (!req.isAuthenticated() && req.path != "".concat(_routes.basename).concat(_routes.client.login)) res.redirect("".concat(_routes.basename).concat(_routes.client.login));else res.render('index');
});

if (_routes.basename != '') {
  app.get('*', function (req, res) {
    res.redirect("".concat(_routes.basename).concat(req.path));
  });
}

var port = process.env.PORT || 9006;
app.listen(port, function (err) {
  console.log(err || "Server is running on port ".concat(port));
});