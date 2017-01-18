/**
 * Environment dependent configuration properties
 */

var path=require('path');

module.exports = {
  root: path.normalize(__dirname + '/..'),
  host: '127.0.0.1'
  , port: '4000'
  , db_prefix: 'mongodb'
  , db_port: '27017'
  , db_database: 'todo'
  , db_username: ''
  , db_password: ''
  ,version: '1.0.0'
};
