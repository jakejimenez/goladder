var user = require('./models/user.js');
var team = require('./models/team.js');

module.exports = {
  configure: function(app) {
    app.get('/user/', function(req, res) {
      user.get(req.query, res);
    });

    app.post('/user/', function(req, res) {
      user.create(req.query, res);
    });

    app.put('/user/', function(req, res) {
      user.update(req.query, res);
    });

    app.delete('/user/', function(req, res) {
      team.delete(req.query, res);
    });
    app.get('/team/', function(req, res) {
      team.get(req.query, res);
    });

    app.post('/team/', function(req, res) {
      team.create(req.query, res);
    });

    app.put('/team/', function(req, res) {
      team.update(req.query, res);
    });

    app.delete('/team/', function(req, res) {
      team.delete(req.query, res);
    });

  }
};
