var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var winston = require('winston');
winston.add(winston.transports.File, {
  level: 'warning',
  timestamp: true,
  filename: './runtime/api.log',
  maxsize: 1048576,
  maxFiles: 7,
  prettyPrint: true,
});
require('dotenv').config();

var index = require('./routes/index');
var users = require('./routes/users');
var wallet = require('./routes/wallet');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/wallet', wallet);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  if (err.isServer) {
    winston.error(`${req.path} Bad Request`, err.output.payload);
  }
  return res.status(err.output.statusCode).json(err.output.payload);
});

module.exports = app;
