const fs = require('fs');
const got = require('got');

function readExampleFile(name, raw) {
    let text = null;
    try {
        text = fs.readFileSync(name, 'UTF8');
    } catch (e) {
        /* eslint-disable no-console */
        console.error(JSON.stringify(e));
    }

    //console.log(JSON.parse(text))
    return raw ? text : JSON.parse(text);
}

function delay(ms) {
    return function (callback) {
        setTimeout(callback, ms);
    };
}

/**
 *  Transform the "request" options into "got" options and add additional "got" defaults
 *
 *  The following options are currently exposed:
 *   - `method` - HTTP Method
 *   - `searchParams` - query string params
 *   - `qs` - alias for query string params
 *   - `headers`
 *   - `responseType` - either `text` or `json`. `json` is the default
 *   - `json` - a supplied JSON object as the request body
 *   - `body` - any ASCII text as  the request body
 *   - `url` - the request URL
 *   - `uri` - alternative alias for the request URL.
 *
 * @param {Object} options          Original definition of the request using the request library
 * @return {Object}                 Updated definition of the request using the got library
 *
 */
function getOptions(options) {
    const httpOptions = {
        method: options.method,
        searchParams: options.searchParams || options.qs,
        headers: options.headers,
        throwHttpErrors: options.throwHttpErrors || false,
        retry: options.retry || 0,
        responseType: options.responseType || 'json'
    };

    // got library is not properly documented, so it is not clear which takes precedence
    // among body, json and form (see https://stackoverflow.com/q/70754880/1485926).
    // Thus, we are enforcing our own precedence with the "else if" chain below.
    // Behaviour is consistent with the one described at usermanual.md#iotagentlibrequest

    if (options.method === 'GET' || options.method === 'HEAD' || options.method === 'OPTIONS') {
        // Do nothing - Never add a body
    } else if (options.body) {
        // body takes precedence over json or form
        httpOptions.body = options.body;
    } else if (options.json) {
        // json takes precedence over form
        httpOptions.json = options.json;
    } else if (options.form) {
        // Note that we don't consider 'form' part of the function API (check usermanual.md#iotagentlibrequest)
        // but we are preparing the code anyway as a safe measure
        httpOptions.form = options.form;
    }

    return httpOptions;
}

/*
 *
 *  Make a direct HTTP request using the underlying request library
 *  (currently [got](https://github.com/sindresorhus/got)),
 *
 *  This function mimics the interface of the obsolete request library and switches
 *  back from promises to callbacks to avoid re-writing large chunks of code.
 *  This centralizes all HTTP requests in a single location and is useful
 *  when creating agents which use an HTTP transport for their southbound
 *  commands, and removes the need for the custom IoT Agent to import its own
 *  additonal request library.
 *
 * @param {Object} options            Definition of the request .
 * @param {Function} callback         The callback function.
 *
 */

function request(options, callback) {
    const httpOptions = getOptions(options);
    //debug( 'Options: %s', JSON.stringify(options, null, 4));
    got(options.url || options.uri, httpOptions)
        .then((response) => {
            //debug( 'Response %s', JSON.stringify(response.body, null, 4));
            return callback(null, response, response.body);
        })
        .catch((error) => {
            //debug( 'Error: %s', JSON.stringify(util.inspect(error), null, 4));
            console.log(error);
            return callback(error);
        });
}

exports.readExampleFile = readExampleFile;
exports.delay = delay;
exports.request = request;
