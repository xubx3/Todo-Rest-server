'use strict';

/**
 * Main application server setup
 */
var cmdlineEnv = process.argv[2];
// if command line option given, override NODE_ENV
console.log('Env :' + cmdlineEnv);

// Load configurations
var config = require('./config/config');

// Modules
var restify = require("restify"),
    mongoose = require('mongoose'),
    fs = require('fs');

// Paths
var config_path = config.root + '/config';
var models_path = config.root + '/models';

// Database
// var connectStr = config.db_prefix + '://' + config.db_username + ':' + config.db_password + '@' + config.host + ':' + config.db_port + '/' + config.db_database;
var connectStr = config.db_prefix + '://' + config.host + ':' + config.db_port + '/' + config.db_database;

var connect = function connect() {
  var options = {
    server: {
      socketOptions: { keepAlive: 120 },
      poolSize: 10
    },
    auto_reconnect: true
  };
  mongoose.connect(connectStr, options);
};
connect();

var db = mongoose.connection;
mongoose.Promise = require('bluebird');
mongoose.connection.on('opening', function () {
  console.log("reconnecting... %d", mongoose.connection.readyState);
});
db.once('open', function callback() {
  console.log("Database connection opened.");
});
db.on('error', function (err) {
  console.log("DB Connection error %s", err);
});
db.on('reconnected', function () {
  console.log('MongoDB reconnected!');
});
db.on('disconnected', function () {
  console.log('MongoDB disconnected!');
  mongoose.connect(connectStr, { server: { auto_reconnect: true } });
});

// Bootstrap models
fs.readdirSync(models_path).forEach(function (file) {
  if (file.indexOf('.' >= 0) && file.substring(file.indexOf('.') + 1) === 'js') require(models_path + '/' + file);
});

// Configure the server
var app = restify.createServer({
  //certificate: ...,
  //key: ...,
  name: 'Todo',
  version: config.version
});

app.on('error', function (err) {
  if (err.errno === 'EADDRINUSE') {
    console.log('Port already in use.');
    process.exit(1);
  } else {
    console.log(err);
  }
});

app.use(restify.acceptParser(app.acceptable));
app.use(restify.authorizationParser());
app.use(restify.dateParser());
app.use(restify.queryParser());
app.use(restify.jsonp());
app.use(restify.gzipResponse());
app.use(restify.bodyParser({}));

require(config_path + '/routes')(app);

app.listen(config.port, config.host, function () {
  console.log('%s listening at %s', app.name, app.url);
});
