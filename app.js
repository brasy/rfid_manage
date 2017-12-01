var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var session = require('express-session');
var flash = require('connect-flash');

var ejs = require('ejs');
var os = require('os');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('.html', ejs.__express);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'RFID.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: 'rfidproject',
  name: 'sid',   //cookie name, default cookie name: connect.sid
  cookie: {maxAge: 10*24*3600*1000 },  //ten days
  resave: false,
  saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, 'public')));

//====================RFID LABEL===================
var rfidDb = require('./models/rfidDao');
var rfid = require('./routes/rfid.js');
rfidDb.create_tables();
rfid.start_rfidrw_server();
//=====================END=========================

app.use(flash());

//for login
app.use(function (req, res, next) {
  var url = req.originalUrl;
  console.log(req.session.user);
  if ((url != "/login"&&url != "/register"&&url != "/resetPassword"&&url != "/") && !req.session.user) {
    console.log("un login,  enter to login");
    return res.redirect("/login");
  }
  next();
});


//load the routes/index.. on the parent app
app.use('/', index);
app.use('/users', users);

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

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
