/*   From:
 *     http://php.net/manual/en/reserved.variables.server.php
 *     http://php.net/manual/en/install.unix.commandline.php
 *     phpinfo() on Apache Server
 * 
 *    PHP_SELF:
 *      The filename of the currently executing script, relative to the document root.
 *    argv:
 *      Array of arguments passed to the script.
 *    argc:
 *      Contains the number of command line parameters passed to the script (if run on the command line).
 *    GATEWAY_INTERFACE:
 *      What revision of the CGI specification the server is using; i.e. 'CGI/1.1'.
 *    SERVER_ADDR:
 *      The IP address of the server under which the current script is executing.
 *    SERVER_NAME:
 *      The name of the server host under which the current script is executing.
 *    SERVER_SOFTWARE:
 *      Server identification string, given in the headers when responding to requests.
 *    SERVER_PROTOCOL:
 *      Name and revision of the information protocol via which the page was requested; i.e. 'HTTP/1.0'.
 *    REQUEST_METHOD:
 *      Which request method was used to access the page; i.e. 'GET', 'HEAD', 'POST', 'PUT'.
 *    REQUEST_TIME:
 *      The timestamp of the start of the request. Available since PHP 5.1.0.
 *    REQUEST_TIME_FLOAT:
 *      The timestamp of the start of the request, with microsecond precision. Available since PHP 5.4.0.
 *    QUERY_STRING:
 *      The query string, if any, via which the page was accessed.
 *    DOCUMENT_ROOT:
 *      The document root directory under which the current script is executing, as defined in the server's configuration file.
 *    HTTP_ACCEPT:
 *      Contents of the Accept: header from the current request, if there is one.
 *    HTTP_ACCEPT_CHARSET:
 *      Contents of the Accept-Charset: header from the current request, if there is one. Example: 'iso-8859-1,*,utf-8'.
 *    HTTP_ACCEPT_ENCODING:
 *      Contents of the Accept-Encoding: header from the current request, if there is one. Example: 'gzip'.
 *    HTTP_ACCEPT_LANGUAGE:
 *      Contents of the Accept-Language: header from the current request, if there is one. Example: 'en'.
 *    HTTP_CONNECTION:
 *      Contents of the Connection: header from the current request, if there is one. Example: 'Keep-Alive'.
 *    HTTP_HOST:
 *      Contents of the Host: header from the current request, if there is one.
 *    HTTP_REFERER:
 *      The address of the page (if any) which referred the user agent to the current page.
 *    HTTP_USER_AGENT:
 *      Contents of the User-Agent: header from the current request, if there is one.
 *    HTTPS:
 *      Set to a non-empty value if the script was queried through the HTTPS protocol.
 *    REMOTE_ADDR:
 *      The IP address from which the user is viewing the current page.
 *    REMOTE_HOST:
 *      The Host name from which the user is viewing the current page.
 *    REMOTE_PORT:
 *      The port being used on the user's machine to communicate with the web server.
 *    REMOTE_USER:
 *      The authenticated user.
 *    REDIRECT_REMOTE_USER:
 *      The authenticated user if the request is internally redirected.
 *    SCRIPT_FILENAME:
 *      The absolute pathname of the currently executing script.
 *    SERVER_ADMIN:
 *      The value given to the SERVER_ADMIN (for Apache) directive in the web server configuration file.
 *    SERVER_PORT:
 *      The port on the server machine being used by the web server for communication.
 *    SERVER_SIGNATURE:
 *      String containing the server version and virtual host name which are added to server-generated pages, if enabled.
 *    PATH_TRANSLATED:
 *      Filesystem- (not document root-) based path to the current script, after the server has done any virtual-to-real mapping.
 *    SCRIPT_NAME:
 *      Contains the current script's path.
 *    REQUEST_URI:
 *      The URI which was given in order to access this page; for instance, '/index.html'.
 *    PHP_AUTH_DIGEST:
 *      When doing Digest HTTP authentication this variable is set to the 'Authorization' header sent by the client (which you should then use to make the appropriate validation).
 *    PHP_AUTH_USER:
 *      When doing HTTP authentication this variable is set to the username provided by the user.
 *    PHP_AUTH_PW:
 *      When doing HTTP authentication this variable is set to the password provided by the user.
 *    AUTH_TYPE:
 *      When doing HTTP authentication this variable is set to the authentication type.
 *    PATH_INFO:
 *      Contains any client-provided pathname information trailing the actual script filename but preceding the query string, if available.
 *    ORIG_PATH_INFO:
 *      Original version of 'PATH_INFO' before processed by PHP.
 */

module.exports = {
    // PHP_SELF: "", // @skip filled by php-cgi
    // argv: "", // @skip not required for php-cgi
    // argc: "", // @skip not required for php-cgi
    GATEWAY_INTERFACE: "CGI/1.1", // @static
    // SERVER_ADDR: "127.0.0.1", // @override by request
    // SERVER_NAME: "localhost", // @override by request
    // SERVER_SOFTWARE: "Node.js v?.?", // @override by module, adds version
    // SERVER_PROTOCOL: "", // @override by request
    // REQUEST_METHOD: "", // @override by request
    // REQUEST_TIME: "", // @skip filled by php-cgi
    // REQUEST_TIME_FLOAT: "", // @skip filled by php-cgi
    // QUERY_STRING: "", // @override by request
    // DOCUMENT_ROOT: "", // @override by request
    // HTTPS: false, // @override by request
    // REMOTE_ADDR: "", // @override by request
    // REMOTE_HOST: "", // @override by request
    // REMOTE_PORT: "", // @override by request
    // REMOTE_USER: "", // @override by request
    // REDIRECT_REMOTE_USER: "", // TODO
    // SCRIPT_FILENAME: "", // @override by request
    // SERVER_ADMIN: "", // TODO: Apache uses ServerAdmin for this, Express doesn't.
    // SERVER_PORT: 80, // @override by request
    SERVER_SIGNATURE: "Node.js/phply", // @static
    // PATH_TRANSLATED: "", // TODO
    // SCRIPT_NAME: "", // @override by request
    // REQUEST_URI: "", // @override by request
    // PHP_AUTH_DIGEST: "", // TODO
    // PHP_AUTH_USER: "", // TODO
    // PHP_AUTH_PW: "", // TODO
    // AUTH_TYPE: "", // TODO
    // PATH_INFO: "", // @override by request
    // ORIG_PATH_INFO: "", // TODO
};