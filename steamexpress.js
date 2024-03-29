var program = require('commander');
var os = require('os');
var fs = require('fs-extra');
var path = require('path');
var readline = require('readline');
var sortedObject = require('sorted-object');

var _exit = process.exit;
var eol = os.EOL;
// var pkg = require('../package.json');

var version = 1.0;

// Re-assign process.exit because of commander
// TODO: Switch to a different command framework
process.exit = exit

// CLI

before(program, 'outputHelp', function () {
    this.allowUnknownOption();
});

program
.version(version)
.usage('[options] [dir]')
.option('-s  --socket', 'add socket.io support')
.option('    --git', 'add .gitignore')
.option('-f, --force', 'force on non-empty directory')
.parse(process.argv);

if (!exit.exited) {
    main();
}

/**
* Install a before function; AOP.
*/

function before(obj, method, fn) {
    var old = obj[method];

    obj[method] = function () {
        fn.call(this);
        old.apply(this, arguments);
    };
}

/**
* Prompt for confirmation on STDOUT/STDIN
*/

function confirm(msg, callback) {
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question(msg, function (input) {
        rl.close();
        callback(/^y|yes|ok|true$/i.test(input));
    });
}

/**
* Create application at the given directory `path`.
*
* @param {String} path
*/

function createApplication(app_name, path) {
    var wait = 3;

    console.log();
    function complete() {
        if (--wait) return;
        var prompt = launchedFromCmd() ? '>' : '$';

        console.log();
        console.log('   install dependencies:');
        console.log('     %s cd %s && npm install', prompt, path);
        console.log();
        console.log('   run the app:');

        if (launchedFromCmd()) {
            console.log('     %s SET DEBUG=%s:* & npm start', prompt, app_name);
        } else {
            console.log('     %s DEBUG=%s:* npm start', prompt, app_name);
        }

        console.log();
    }

    // socket.io support
    if (program.socket) {
        var app = loadTemplate('js/app-socket.js');
    } else {
        var app = loadTemplate('js/app.js');
    }

    mkdir(path, function() {
        mkdir(path + '/public');

        mkdir(path + '/public/javascripts', function() {
            copy_template('js/main.js', path + '/public/javascripts/main.js');
        });

        mkdir(path + '/public/images', function() {
            copy_image('images/steam_login.png', path + '/public/images/steam_login.png');
            copy_image('images/steam_logout.png', path + '/public/images/steam_logout.png');
            complete();
        });

        mkdir(path + '/views', function() {
            if (program.socket) {
                copy_template('jade/index-socket.jade', path + '/views/index.jade');
            } else {
                copy_template('jade/index.jade', path + '/views/index.jade');
            }
            copy_template('jade/error.jade', path + '/views/error.jade')
            complete();
        });

        // Template support
        app = app.replace('{views}', program.template);

        // package.json
        var pkg = {
            name: app_name
            , version: '0.0.0'
            , private: true
            , scripts: { start: 'node app.js' }
            , dependencies: {
                'express': '~4.13.1',
                'body-parser': '~1.13.2',
                'cookie-parser': '~1.3.5',
                'debug': '~2.2.0',
                'morgan': '~1.6.1',
                'serve-favicon': '~2.3.0',
                'express-session': '~1.12.1',
                'openid': '~0.5.13',
                'jade': '~1.11.0'
            }
        }

        if (program.socket) {
            pkg.dependencies['socket.io'] = '~1.3.7';
            pkg.dependencies['express-socket.io-session'] = '~1.3.1';
        }

        // sort dependencies like npm(1)
        pkg.dependencies = sortedObject(pkg.dependencies);

        // write files
        write(path + '/package.json', JSON.stringify(pkg, null, 2));
        write(path + '/app.js', app);

        if (program.git) {
            write(path + '/.gitignore', fs.readFileSync(__dirname + '/../templates/js/gitignore', 'utf-8'));
        }

        complete();
    });
}

function copy_template(from, to) {
    from = path.join(__dirname, '..', 'templates', from);
    write(to, fs.readFileSync(from, 'utf-8'));
}

function copy_image(from, to) {
    from = path.join(__dirname, '..', 'templates', from);
    fs.copySync(from, to);
    console.log('   \x1b[36mcreate\x1b[0m : ' + to);
}

/**
* Check if the given directory `path` is empty.
*
* @param {String} path
* @param {Function} fn
*/

function emptyDirectory(path, fn) {
    fs.readdir(path, function(err, files){
        if (err && 'ENOENT' != err.code) throw err;
        fn(!files || !files.length);
    });
}

/**
* Graceful exit for async STDIO
*/

function exit(code) {
    // flush output for Node.js Windows pipe bug
    // https://github.com/joyent/node/issues/6247 is just one bug example
    // https://github.com/visionmedia/mocha/issues/333 has a good discussion
    function done() {
        if (!(draining--)) _exit(code);
    }

    var draining = 0;
    var streams = [process.stdout, process.stderr];

    exit.exited = true;

    streams.forEach(function(stream){
        // submit empty write request and wait for completion
        draining += 1;
        stream.write('', done);
    });

    done();
}

/**
* Determine if launched from cmd.exe
*/

function launchedFromCmd() {
    return process.platform === 'win32'
    && process.env._ === undefined;
}

/**
* Load template file.
*/

function loadTemplate(name) {
    return fs.readFileSync(path.join(__dirname, '..', 'templates', name), 'utf-8');
}

/**
* Main program.
*/

function main() {
    // Path
    var destinationPath = program.args.shift() || '.';

    // App name
    var appName = path.basename(path.resolve(destinationPath));

    // Generate application
    emptyDirectory(destinationPath, function (empty) {
        if (empty || program.force) {
            createApplication(appName, destinationPath);
        } else {
            confirm('destination is not empty, continue? [y/N] ', function (ok) {
                if (ok) {
                    process.stdin.destroy();
                    createApplication(appName, destinationPath);
                } else {
                    console.error('aborting');
                    exit(1);
                }
            });
        }
    });
}

/**
* echo str > path.
*
* @param {String} path
* @param {String} str
*/

function write(path, str, mode) {
    fs.writeFileSync(path, str, { mode: mode || 0666 });
    console.log('   \x1b[36mcreate\x1b[0m : ' + path);
}

/**
* Mkdir -p.
*
* @param {String} path
* @param {Function} fn
*/

function mkdir(path, fn) {
    fs.mkdirs(path, 0755, function(err){
        if (err) throw err;
        console.log('   \033[36mcreate\033[0m : ' + path);
        fn && fn();
    });
}
