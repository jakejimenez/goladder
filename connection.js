var mysql = require('mysql');
var fs = require('fs');
var hostname;
var password;
var obj;

function Connection() {
  this.pool = null;
  this.init = function() {
    var obj = JSON.parse(fs.readFileSync('./cred.json', 'utf8'));
    hostname = obj.hostname;
    password = obj.password;
    this.pool = mysql.createPool({
      connectionLimit: 100,
      host: hostname,
      port: '3306',
      user: 'root',
      password: password,
      database: 'goladdersql'
    });
  };

  this.connect = function(callback) {
    this.pool.getConnection(function(err, connection) {
      callback(err, connection);
    });
  };
}

module.exports = new Connection();
