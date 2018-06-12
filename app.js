const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const OAuthServer = require( 'express-oauth-server' );
const OAuthModel = require( './Auth/OAuthModel' );
const ClearTokensJobs = require( './Auth/ClearTokensJobs' );

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
app.use( fileUpload() );
app.use( '/public', express.static( __dirname + '/public' ) );


const tokensClearer = ClearTokensJobs(); 

//LOGIN ROUTE
app.post( '/login', app.oauth.token() );
app.get( '/me', app.oauth.authenticate(), (req, res) => {
  res.send( req.res.locals.oauth.token.user );
});
app.post( '/logout', app.oauth.authenticate(), async ( req, res ) => {
  const logout = await OAuthModel.logout( req.res.locals.oauth.token );
  if( logout ) {
    res.status(200).send( 'logged out!' );
  } else {
    res.status( 400 ).send( 'logout failed' );
  }
})

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

const RecintRoutes = require( './Routes/Recint' );
Router.use( '/recints', RecintRoutes );

const RecintZoneRoutes = require( './Routes/RecintZone' );
Router.use( '/recintzones', RecintZoneRoutes );

const ZonePolygonsRoutes = require( './Routes/ZonePolygons' );
Router.use( '/zonepolygons', ZonePolygonsRoutes );

const SeatRowsRoutes = require( './Routes/SeatRows' );
Router.use( '/seatrows', SeatRowsRoutes );

const CodeRoutes = require( './Routes/Code' );
Router.use( '/codes', CodeRoutes );

const DeliverRoutes = require( './Routes/Deliver' );
Router.use( '/deliveries', DeliverRoutes );

const SaleRoutes = require( './Routes/Sale' );
Router.use( '/sales', SaleRoutes );

const PaymentRoutes = require( './Routes/Payment' );
Router.use( '/payments', PaymentRoutes );

const ComissionRoutes = require( './Routes/Comission' );
Router.use( '/comissions', ComissionRoutes );

const ScanGroupRoutes = require( './Routes/ScanGroups' );
Router.use( '/scangroups', ScanGroupRoutes );

const ScanTypesRoutes = require( './Routes/ScanTypes' );
Router.use( '/scantypes', ScanTypesRoutes );

const UserScanGroupRoutes = require( './Routes/UserScanGroup' );
Router.use( '/userscangroups', UserScanGroupRoutes );

const LogEntriesRoutes = require( './Routes/LogEntries' );
Router.use( '/logentries', LogEntriesRoutes );

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
