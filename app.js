const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const OAuthServer = require( 'express-oauth-server' );
const OAuthModel = require( './Auth/OAuthModel' );

const helmet = require( 'helmet' );
const cors = require( 'cors' );

const app = express();

app.oauth = new OAuthServer({
  debug: true,
  model:  OAuthModel
});

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(helmet.frameguard());
app.use(helmet.xssFilter());
app.use(helmet.noSniff());
app.use(helmet.ieNoOpen());
app.disable('x-powered-by');

app.use(cors());
app.use( (req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
  res.set('Access-Control-Allow-Headers', 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token');

  next();
});

//LOGIN ROUTE
app.post( '/login', app.oauth.token() );
app.get( '/me', app.oauth.authenticate(), (req, res) => {
  res.send( req.res.locals.oauth.token.user );
});

//TODO: Protect the routes
const Router = express.Router();
app.use( '/', app.oauth.authenticate(), Router );

const CompanyRoutes = require( './Routes/Company' );
Router.use( '/companies', CompanyRoutes );

const UserRoutes = require( './Routes/User' );
Router.use( '/users', UserRoutes );

const RoleRoutes = require( './Routes/Role' );
Router.use( '/roles', RoleRoutes );

const SessionRoutes = require( './Routes/Session' );
Router.use( '/sessions', SessionRoutes );

const TypeRoutes = require( './Routes/Type' );
Router.use( '/types', TypeRoutes );

const CodeRoutes = require( './Routes/Code' );
Router.use( '/codes', CodeRoutes );

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

  res.status(err.status || 500);
  res.send( err.message );
});

module.exports = app;
