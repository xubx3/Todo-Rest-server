'use strict';

var gulp = require('gulp');
var mongoUtil = require('mongo-utils');
var config = require('./config/config');
var fs = require('fs');

//备份DB
gulp.task('dumpDb', function () {
  var connectStr = config.db_prefix + '://' + config.host + ':' + config.db_port + '/' + config.db_database;
  var dumpDir = __dirname + "/backup";
  fs.existsSync(dumpDir) || fs.mkdirSync(dumpDir);

  var dumpCommand = mongoUtil.makeDumpCommand(connectStr, dumpDir);
  dumpCommand = dumpCommand.replace(/'/g, function (value) {
    return "";
  });
  console.log(dumpCommand);
  mongoUtil.loggedExec(dumpCommand, function (err, stdOut, stdErr) {
    process.stdout.write(stdOut);
  });
});

//还原DB
gulp.task('restoreDb', function () {
  var connectStr = config.db_prefix + '://' + config.host + ':' + config.db_port + '/' + config.db_database;
  var dumpDir = __dirname + "/backup";

  var restoreCommand = mongoUtil.makeRestoreCommand(connectStr, dumpDir);
  restoreCommand = restoreCommand.replace(/'/g, function (value) {
    return "";
  });
  mongoUtil.loggedExec(restoreCommand, function (err, stdOut, stdErr) {
    if (err) throw err;
    process.stdout.write(stdOut);
  });
});

