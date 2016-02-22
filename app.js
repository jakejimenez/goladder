var express = require('express');
var path = require('path');
var debug = require('debug')('workspace:server');
var http = require('http');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');

var session = require('express-session')({
    secret: "secret",
    key: 'secret.sid',
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 3600000
    }
});

var mysql = require('mysql');

// var mysqlInfo;

// mysqlInfo = {
//   host: '127.0.0.1',
//   port: '3306',
//   user: 'root',
//   database: 'goladderdb'
// };

// var connection = mysql.createConnection(mysqlInfo);

// connection.connect(function(err){
//     if (err){ 
//         throw err;
//     }
//     else{
//        console.log('Connected to ' + mysqlInfo.database + ' in app');
//     }
// });

var parseString = require('xml2js').parseString;

var openid = require('openid');

var app = express();

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

var server = http.Server(app);

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }
    if (port >= 0) {
        // port number
        return port;
    }
    return false;
}

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    // handle specific listen errors with friendly messages
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

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session);

function createRelyingParty(req) {
    var baseUrl = req.protocol + "://" + req.get("host");
    return new openid.RelyingParty(baseUrl + "/verify", baseUrl, true, false, []);
}

function getUserName(steamid) {
    var temp = '';
    getUserInfo(steamid, function(error, data){
        if(error) throw error;
        var datadec = JSON.parse(JSON.stringify(data.response));
        name = datadec.players[0].personaname;
    });
}
function getUserInfo(steamid,callback) {
    var apik = 'B26B620482C987680D005B925374ED9E';
    var url = 'http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=' + apik + '&steamids=' + steamid + '&format=json';
    request({
        url: url,
        json: true
    }, function(error, response, body){
        if(!error && response.statusCode === 200){
            callback(null, body);
        } else if (error) {
            getUserInfo(steamid,callback);
        }
    });
}

app.use(function (req, res, next) {
    res.locals.user = req.session.user;
    next();
});


app.get("/home", function (req, res) {
    var session = (typeof req.session.user !== 'undefined') ? req.session.user : '';
    res.render('home', {
        title: 'Home',
        session: session
    });
});
app.get("/rules", function (req, res) {
    var session = (typeof req.session.user !== 'undefined') ? req.session.user : '';
    res.render('rules', {
        title: 'rules',
        session: session
    });
});
app.get("/support", function (req, res) {
    var session = (typeof req.session.user !== 'undefined') ? req.session.user : '';
    res.render('support', {
        title: 'support',
        session: session
    });
});
app.get("/sponser", function (req, res) {
    var session = (typeof req.session.user !== 'undefined') ? req.session.user : '';
    res.render('sponser', {
        title: 'sponser',
        session: session
    });
});
app.get("/volunteer", function (req, res) {
    var session = (typeof req.session.user !== 'undefined') ? req.session.user : '';
    res.render('volunteer', {
        title: 'volunteer',
        session: session
    });
});
app.get("/teamdb", function (req, res) {
    var session = (typeof req.session.user !== 'undefined') ? req.session.user : '';
    res.render('teamdb', {
        title: 'teamdb',
        session: session
    });
});
app.get("/myteam", function (req, res) {
    var session = (typeof req.session.user !== 'undefined') ? req.session.user : '';
    res.render('myteam', {
        title: 'myteam',
        session: session
    });
});
app.get("/findteam", function (req, res) {
    var session = (typeof req.session.user !== 'undefined') ? req.session.user : '';
    res.render('findteam', {
        title: 'findteam',
        session: session
    });
});
app.get("/mymatches", function (req, res) {
    var session = (typeof req.session.user !== 'undefined') ? req.session.user : '';
    res.render('mymatches', {
        title: 'mymatches',
        session: session
    });
});
app.get("/requestmatch", function (req, res) {
    var session = (typeof req.session.user !== 'undefined') ? req.session.user : '';
    res.render('requestmatch', {
        title: 'requestmatch',
        session: session
    });
});
app.get("/schedule", function (req, res) {
    var session = (typeof req.session.user !== 'undefined') ? req.session.user : '';
    res.render('schedule', {
        title: 'schedule',
        session: session
    });
});
app.get("/submitmatchresult", function (req, res) {
    var session = (typeof req.session.user !== 'undefined') ? req.session.user : '';
    res.render('submitmatchresult', {
        title: 'submitmatchresult',
        session: session
    });
});

app.get("/editupcomingmatch", function (req, res) {
    var session = (typeof req.session.user !== 'undefined') ? req.session.user : '';
    res.render('editupcomingmatch', {
        title: 'editupcomingmatch',
        session: session
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
            return res.redirect("/");
        }

        var IDENTIFIER_REGEX = /^https?:\/\/steamcommunity\.com\/openid\/id\/([0-9]+)$/;
        var matches = IDENTIFIER_REGEX.exec(result.claimedIdentifier);

        if (matches === null) {
            return res.redirect("/");
        }

        req.session.user = matches[1]; // steam64
        return res.redirect("/");
    });

});

app.get("/logout", function (req, res) {
    tradebot.userinv = '';
    req.session.destroy(function (err) {
        res.redirect("/");
    });
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
