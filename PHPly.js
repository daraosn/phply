var Shell = require("shelljs");
var Spawn = require("child_process").spawn;
var Path = require("path");
var URL = require("url");
var FS = require("fs");
var Dalog = require("dalog").default;
var Env = require("./env")

var PHPLY_VERSION = require("./version");
var PHP_VERSION = "";
var SERVER_SOFTWARE = "";

var Logger = new Dalog({header: "PHPly", lineBreak: false});

var Config = {
    debug: false, // debug mode
    verbose: false, // verbose mode, requires debug enabled
    documentRoot: "", // absolute base directory
    phpCgi: "", // absolute path for php-cgi
    serveStatic: false, // serve static files
    rewriteNotFound: null, // PHP file to use to rewrite 404s, usually `index.php`
    stripPoweredBy: true, // removes header X-Powered-By: PHP..
};

function PHPly(config) {
    // configuration overrides and checks
    Object.assign(Config, config);

    if (!Config.documentRoot) throw new Error("No root directory provided for serving PHP files.");

    Config.phpCgi = Config.phpCgi || Shell.which("php-cgi").trim();
    if (!Config.phpCgi) throw new Error("Cannot find binary `php-cgi`, please install or provide path.");

    // set static environmental variables
    Env.PATH = process.env.PATH;

    PHP_VERSION = Shell.exec(`${Config.phpCgi} --version`, {silent: true}).match(/PHP ([0-9]+\.[0-9]+\.[0-9]+)/);
    if (!PHP_VERSION) throw new Error("Unable to get php-cgi version, please check if `php-cgi --version` works.");
    PHP_VERSION = PHP_VERSION[1];

    SOFTWARE_VERSION = `Node.js ${process.version}, phply v${PHPLY_VERSION}, PHP ${PHP_VERSION}`

    if (Config.debug) Logger.info(`Initialized v${PHPLY_VERSION} with settings:\n`, Config);

    // return express request handler
    return function (req, res, next) {
        // req.pause();

        req.phplyLogger = Logger.spawn();
        if (Config.debug) req.phplyLogger.info("New request:", req.url);
        var url = URL.parse(req.url);
        var file = Path.join(Config.documentRoot, url.pathname);
        processRequest(url, file, req, res, next)
    };
}

function processRequest(url, file, req, res, next) {
    var logger = req.phplyLogger;

    // NOTE: being annoyingly explicit with `return`s to avoid future bugs if code added beyond
    if (Config.debug) {
        logger.info("Checking request for file:", file);
    }
    FS.stat(file, function (err, stat) {
        if (err) { // file unavailable, check rewrite rule or 404
            if (Config.debug) logger.warn("File not found!");
            if (Config.rewriteNotFound) {
                // TODO: improve and make rule handler
                // TODO: watch out for infinite loops (if rewrite causes 404)
                file = Config.rewriteNotFound;
                res.status(302);
                if (Config.debug) logger.warn("Rewrite request to:", file);
                processRequest(url, file, req, res, next);
                return;
            } else {
                next(); // 404, most likely
                if (Config.debug) logger.warn("Calling next handler");
                return;
            }
        }
        // check if url pathname is directory or file
        if (stat.isDirectory()) {
            if (Config.debug) logger.info("Request is a folder");
            if (file.substring(file.length-1) !== "/") { // without trailing slash, redirect.
                if (Config.debug) logger.info("Add trailing space and redirect");
                res.redirect(url.pathname + "/");
                return;
            } else { // without trailing slash, try index.php
                // TODO: should make a check for index.html or next() would take care?
                file = Path.join(file, "index.php");
                if (Config.debug) logger.info("Redirect to index.php on folder and redirect");
                processRequest(url, file, req, res, next);
                return;
            }
        } else {
            if (/\.php$/.test(file)) { // ends with php, parse it
                if (Config.debug) logger.info("PHP file found, processing with php-cgi");
                phpCgi(url, file, req, res, next);
                return;
            } else { // different file
                if (Config.serveStatic) { // serve asset
                    if (Config.debug) logger.info("Non-PHP file found, serving staticly.");
                    res.sendFile(file);
                    return;
                } else { // continue
                    if (Config.debug) logger.info("Non-PHP file found, calling next handler.");
                    next();
                    return;
                }
            }
        }
    });
}

function phpCgi(url, file, req, res, next) {
    var logger = req.phplyLogger;

    // override dynamic PHP variables
    var env = Object.assign({}, Env);
    env.DOCUMENT_ROOT = Config.documentRoot;
    env.QUERY_STRING = url.query || "";
    env.REQUEST_METHOD = req.method;
    env.REQUEST_URI = req.url;
    env.REMOTE_ADDR = req.connection.remoteAddress || "";
    env.REMOTE_HOST = req.ip || "";
    env.REMOTE_PORT = req.connection.remotePort || "";
    env.SCRIPT_FILENAME = file;
    env.SCRIPT_NAME = req.path
    env.SERVER_ADDR = req.socket.server.address().address;
    env.SERVER_SOFTWARE = SERVER_SOFTWARE;
    env.SERVER_NAME = req.hostname || "";
    env.SERVER_PORT = req.socket.server.address().port;
    env.SERVER_PROTOCOL = "HTTP/" + req.httpVersion;

    // http://stackoverflow.com/questions/24378472/what-is-php-serverredirect-status
    env.REDIRECT_STATUS = res.statusCode;

    if (req.method.toLowerCase() === "post") {
        // required as specified here 
        env.CONTENT_LENGTH = req.get("Content-Length") || 0;
        env.CONTENT_TYPE = req.get("Content-Type") || "";
    }

    if (req.connection.encrypted) env.HTTPS = 1;
    if (/^.*?\.php\//i.test(url)) env.PATH_INFO = url.replace(/^.*?\.php/i, "");

    for(var header in req.headers) {
        env["HTTP_" + header.replace(/-/g, "_").toUpperCase()] = req.headers[header];
    }

    if (Config.debug && Config.verbose) logger.info("php-cgi env:\n", env);

    var buffer = "";

    var php = Spawn(Config.phpCgi, [], {env: env});
    php.stdin.on("error", function () { });
    req.pipe(php.stdin);
    // req.resume();
    php.stdout.on("data", function (data) {
        buffer += data.toString();
    });
    php.on("exit", function (code) {
        if (code > 0) {
            if (Config.debug) {
                logger.error(`php-cgi error code ${code}`);
                if (Config.verbose) logger.error(`php-cgi stdout:\n${buffer}`);
            }
            res.status(500);
            next();
            return;
        }
        php.stdin.end();

        var lines = buffer.split("\r\n");
        var line = "";
        var cookies = [];
        var body = "";
        while(line = lines.shift()) {
            if (line === "") break;

            var header = line.split(": ");
            var headerName = header[0];
            var headerValue = header[1];

            if (Config.debug && Config.verbose) logger.info("php-cgi header:", header);

            // TODO: better handling for corrupt data/headers, parser could crash beyond this point.

            switch(headerName.toLowerCase()) {
                case "status":
                    res.statusCode = parseInt(headerValue, 10);
                break;
                case "set-cookie":
                    cookies.push(headerValue);
                break;
                case "x-powered-by":
                    if(Config.stripPoweredBy) break;
                default:
                    res.setHeader(headerName, headerValue);
            }
        }

        body = lines.join("\n");

        if (Config.debug && Config.verbose) logger.info("php-cgi body length:", body.length);

        if (cookies.length > 0) res.setHeader("set-cookie", cookies);
        res.status(res.statusCode).send(body);
        res.end();
        if (Config.debug) logger.info(`Response sent, status code ${res.statusCode}`);
    });

}

module.exports = PHPly;