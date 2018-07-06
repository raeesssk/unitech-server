var express = require('express');
var router = express.Router();
var pg = require('pg');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');
// var nodemailer = require('nodemailer');

var oauth = require('./oauth');
var login = require('./routes/login');
var customer = require('./routes/customer');
var product = require('./routes/product');
var expense = require('./routes/expense');

var routes = require('./routes/index');
var invoice = require('./routes/invoice');
var dashboard = require('./routes/dashboard');
var user = require('./routes/user');
var sms = require('./routes/sms');
var emailsent = require('./routes/emailsent');
var backup = require('./routes/backup');


var pmx = require('pmx').init({
  http          : true, // HTTP routes logging (default: true)
  ignore_routes : [/socket\.io/, /notFound/], // Ignore http routes with this pattern (Default: [])
  errors        : true, // Exceptions loggin (default: true)
  custom_probes : true, // Auto expose JS Loop Latency and HTTP req/s as custom metrics
  network       : true, // Network monitoring at the application level
  ports         : true  // Shows which ports your app is listening on (default: false)
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// OAuth2 Server
app.oauth = oauth;
app.all('/oauth/token', app.oauth.grant());
app.use(app.oauth.errorHandler());

// Define Routes Here
app.use('/login', login);
app.use('/customer', customer);
app.use('/product', product);
app.use('/expense', expense);
app.use('/invoice', invoice);
app.use('/dashboard', dashboard);
app.use('/sms', sms);
app.use('/emailsent', emailsent);
app.use('/backup', backup);
app.use('/user', user);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});



module.exports = app;
