var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { expressjwt } = require("express-jwt");

var articlesRouter = require('./routes/articles');
var usersRouter = require('./routes/users');
const uploadRouter = require('./routes/upload');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//在所有路由之前添加jwt验证

app.use(
  expressjwt({
    secret: "test123456",
    algorithms: ["HS256"],
  }).unless({
    path: [
      "/api/users",
      // "/api/articles/users/:uid", 这样的路由，必须使用正则匹配
      /^\/api\/articles\/users\/\w+/,
      {
        url: /^\/api\/articles\/\w+/,
        methods: ["GET"],
      },
    ],
  })
);

app.use('/api/articles', articlesRouter);
app.use('/api/users', usersRouter);
app.use('/api/upload', uploadRouter);

app.use(function (err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    res.status(401).json({
      code: 0, msg: "无效的token或者没有没有传递token-请重新登录"
    });

  } else {
    next(err);
  }
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;