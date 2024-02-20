/*
 * Copyright 2023 -  FIWARE Foundation e.V.
 *
 * This file is part of NGSI-LD to NGSI-v2 Adapter
 *
 */

const V2_BROKER_URL = process.env.NGSI_V2_CONTEXT_BROKER || 'http://localhost:1027/v2';
const DATETIME_DEFAULT = '1970-01-01T00:00:00.000Z';
const ATTRIBUTE_DEFAULT = null;
const timeout = process.env.NGSI_V2_TIMEOUT || 1000;
const StatusCodes = require('http-status-codes').StatusCodes;
const getReasonPhrase = require('http-status-codes').getReasonPhrase;

const JSON_LD_CONTEXT =
    process.env.CONTEXT_URL || 'https://fiware.github.io/tutorials.Step-by-Step/tutorials-context.jsonld';

const NOTIFICATION_RELAY_URL = process.env.NOTIFICATION_RELAY || 'https://localhost:3000/notify';

function v2BrokerURL(path) {
    return V2_BROKER_URL + path;
}

function v2Timeout() {
    return timeout;
}

function appendContext(obj, isJSONLD) {
    if (isJSONLD) {
        obj['@context'] = JSON_LD_CONTEXT;
    }
    return obj;
}

function linkContext(res, isJSONLD) {
    if (!isJSONLD && is2xxSuccessful(res.statusCode)) {
        res.header(
            'Link',
            `<${JSON_LD_CONTEXT}>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"`
        );
    }
}

function getErrorType(statusCode, v2Body) {
    let ldStatusCode = statusCode;
    v2Body.title = getReasonPhrase(ldStatusCode);

    switch (statusCode) {
        case 400:
            v2Body.type = 'https://uri.etsi.org/ngsi-ld/errors/BadRequestData';
            break;
        case 403:
            v2Body.type = 'https://uri.etsi.org/ngsi-ld/errors/TooComplexQuery';
            break;
        case 422:
            ldStatusCode = 409;
            v2Body.type = 'https://uri.etsi.org/ngsi-ld/errors/Conflict';
            v2Body.title = getReasonPhrase(ldStatusCode);
            if (v2Body.message === 'Already Exists') {
                v2Body.type = 'https://uri.etsi.org/ngsi-ld/errors/AlreadyExists';
                v2Body.title = 'Already Exists';
            }
            break;
        case 501:
            v2Body.type = 'https://uri.etsi.org/ngsi-ld/errors/NoMultiTenantSupport';
            break;
        case 503:
            v2Body.type = 'https://uri.etsi.org/ngsi-ld/errors/LdContextNotAvailable';
            break;
        default:
            v2Body.type = 'https://uri.etsi.org/ngsi-ld/errors/InvalidRequest';
            break;
    }

    return ldStatusCode;
}

/**
 * Add the client IP of the proxy client to the list of X-forwarded-for headers.
 *
 * @param req - the incoming request
 * @return a string representation of the X-forwarded-for header
 */
function getClientIp(req) {
    let ip = req.ip;
    if (ip.substr(0, 7) === '::ffff:') {
        ip = ip.substr(7);
    }
    let forwardedIpsStr = req.header('x-forwarded-for');

    if (forwardedIpsStr) {
        // 'x-forwarded-for' header may return multiple IP addresses in
        // the format: "client IP, proxy 1 IP, proxy 2 IP" so take the
        // the first one
        forwardedIpsStr += ',' + ip;
    } else {
        forwardedIpsStr = String(ip);
    }

    return forwardedIpsStr;
}

function is2xxSuccessful(status) {
    return Math.floor(status / 100) === 2;
}

function sendResponse(res, v2Body, ldPayload, contentType) {
    if (contentType) {
        res.set('Content-Type', contentType);
        res.type(contentType);
    }
    if (!is2xxSuccessful(res.statusCode)) {
        res.set('Content-Type', 'application/json');
        res.type('application/json');
        if (v2Body.description) {
            v2Body.message = v2Body.description;
            delete v2Body.description;
        }

        if (!v2Body.type) {
            res.statusCode = getErrorType(res.statusCode, v2Body);
        }
        delete v2Body.error;
        return res.send(v2Body);
    }

    return v2Body ? res.send(ldPayload) : res.send();
}

function sendError(res, v2Body) {
    res.set('Content-Type', 'application/json');
    res.type('application/json');
    return res.send(v2Body);
}

module.exports = {
    v2BrokerURL,
    v2Timeout,
    appendContext,
    linkContext,
    getClientIp,
    sendResponse,
    sendError,
    is2xxSuccessful,
    DATETIME_DEFAULT,
    ATTRIBUTE_DEFAULT,
    NOTIFICATION_RELAY_URL
};
