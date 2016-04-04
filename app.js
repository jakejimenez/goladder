var express = require('express');
var path = require('path');
var debug = require('debug')('workspace:server');
var http = require('http');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');
var userinfo = require('./userinfo.js')

var session = require('express-session')({
    secret: "secret",
    key: 'secret.sid',
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 3600000
    }
});

var parseString = require('xml2js').parseString;

var openid = require('openid');

var app = express();

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

var server = http.Server(app);

var picture = 'http://www.sessionlogs.com/media/icons/defaultIcon.png'
var name = '';
var loggedIn = false;

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function normalizePort(val) {
    var port = parseInt(val, 10);
    if (isNaN(port)) {
        return val;
    }
    if (port >= 0) {
        return port;
    }
    return false;
}
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    console.log('Listening on ' + bind);
}
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session);

var connection = require('./connection.js');
var routes = require('./routes.js');

connection.init();
routes.configure(app);


function createRelyingParty(req) {
    var baseUrl = req.protocol + "://" + req.get("host");
    return new openid.RelyingParty(baseUrl + "/verify", baseUrl, true, false, []);
}

app.use(function (req, res, next) {
    res.locals.user = req.session.user;
    next();
});

function forCallback(rows, callback){
  var done = 0;
  for (var i = 0; i < rows.length; i++) {
    var steamid = rows[i].steamid;
    (function(steamid) {
      userinfo.getUserName(steamid, function(name) {
        userinfo.getUserPicture(steamid, function(picture){
          results.push({
            steamid: steamid,
            name: name,
            picture: picture
          })
          done++;
          console.log("Queried " + done + " username(s)")
          if(done == (rows.length)){
            callback(results);
          }
        });
      });
    })(rows[i].steamid);
  }
}


function renderDefault(req, res, page, title){
    var session = (typeof req.session.user !== 'undefined') ? req.session.user : '';
    if(loggedIn){
        userinfo.getUserName(session, function(username){
            name = username;
            userinfo.getUserPicture(session, function(picture){
                picture = picture;
                res.render(page, {
                    title: title,
                    session: session,
                    username: name,
                    picture: picture
                });
            });
        });
    }else{
        res.render(page, {
            title: title,
            session: session
        });
    }
}

app.get("/", function (req, res) {
    renderDefault(req, res, 'index', '/');
});

app.get("/home", function (req, res) {
    renderDefault(req, res, 'home', 'Home');
});

app.get("/rules", function (req, res) {
    renderDefault(req, res, 'rules', 'Rules');
});

app.get("/support", function (req, res) {
    renderDefault(req, res, 'support', 'Support');
});

app.get("/sponsor", function (req, res) {
    renderDefault(req, res, 'sponsor', 'Sponsor');
});

app.get("/volunteer", function (req, res) {
    renderDefault(req, res, 'volunteer', 'Volunteer');
});

app.get("/teamdb", function (req, res) {
    renderDefault(req, res, 'teamdb', 'Team database');
});

app.get("/myteam", function (req, res) {
    renderDefault(req, res, 'myteam', 'My Team');
});

app.get("/findteam", function (req, res) {
    renderDefault(req, res, 'findteam', 'Find a Team');
});

app.get("/maketeam", function (req, res) {
    renderDefault(req, res, 'maketeam', 'Make a Team');
});

app.get("/signupteam", function (req, res) {
    renderDefault(req, res, 'signupteam', 'Sign up Team');
});

app.get("/mymatches", function (req, res) {
    renderDefault(req, res, 'mymatches', 'mymatches');
});

app.get("/requestmatch", function (req, res) {
    renderDefault(req, res, 'requestmatch', 'requestmatch');
});

app.get("/schedule", function (req, res) {
    renderDefault(req, res, 'schedule', 'schedule');
});

app.get("/submitmatchresult", function (req, res) {
    renderDefault(req, res, 'submitmatchresult', 'submitmatchresult');
});

app.get("/editupcomingmatch", function (req, res) {
    renderDefault(req, res, 'editupcomingmatch', 'editupcomingmatch');
});

app.get("/myprofile", function (req, res) {
    renderStats(req, res, "myprofile", "My Profile");
});

app.post("/maketeamfinal",function(req,res){
  // var steamids = JSON.parse(req.body.steamids);
  // console.log("STEAMIDS: " + steamids)
  var steamids = JSON.parse(req.body.steamids);
  var teamname = JSON.parse(req.body.teamname);
  var picture = JSON.parse(req.body.teampicture);
  res.send({
    status: "Success"
  })
});

app.post("/queryusername",function(req,res){
  var username = JSON.parse(req.body.name)
  connection.connect(function(err, con) {
    results = [];
    con.query('select * from users where lastusername like "%' + username + '%"', function(err,rows,fields){
      console.log("Sending results to client")
      con.release()
      console.log("Disconnected from database")
      if(rows == ''){
        res.send({
          result: null
        })
      }else{
        forCallback(rows, function(results){
          res.send({
            result: JSON.stringify(results)
          });
        });
      }
    });
  });
});

app.get("/login", function (req, res) {
    createRelyingParty(req).authenticate("http://steamcommunity.com/openid", false, function (e, authUrl) {
        if (e) {
            return res.redirect("/");
        }
        res.redirect(authUrl);
    });
});

app.get("/verify", function (req, res) {
    createRelyingParty(req).verifyAssertion(req, function (e, result) {
        if (!result.authenticated) {
            return res.redirect("/home");
        }
        var IDENTIFIER_REGEX = /^https?:\/\/steamcommunity\.com\/openid\/id\/([0-9]+)$/;
        var matches = IDENTIFIER_REGEX.exec(result.claimedIdentifier);
        if (matches === null) {
            return res.redirect("/home");
        }
        loggedIn = true;
        console.log("User " + matches[1] + " Logged in");
        req.session.user = matches[1]; // steam64
        return res.redirect("/home");
    });

});

app.get("/logout", function (req, res) {
    req.session.destroy(function (err) {
        res.redirect("/home");
    });
    loggedIn = false;
    console.log("User Logged out")
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = {
    loggedIn : loggedIn
}
