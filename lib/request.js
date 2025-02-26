/*
 * Copyright 2023 -  FIWARE Foundation e.V.
 *
 * This file is part of NGSI-LD to NGSI-v2 Adapter
 *
 */

const debug = require('debug')('adapter:request');
const path = require('path');
const Config = require('../lib/configService');
const getReasonPhrase = require('http-status-codes').getReasonPhrase;
const StatusCodes = require('http-status-codes').StatusCodes;
const semver = require('semver');
const _ = require('lodash');

const got = require('got').extend({
    timeout: {
        request: Config.getConfig().v2Timeout
    }
});

function v2BrokerURL(url) {
    return path.join(Config.getConfig().v2ContextBroker, 'v2', url);
}

function ngsiVersion(res, preferVersion) {
    if (preferVersion) {
        const payloadVersion = semver.gt(`${preferVersion}.1`, `${Config.getConfig().version}.1`)
            ? Config.getConfig().version
            : preferVersion;
        res.header('Preference-Applied', `ngsi-ld=${payloadVersion}`);
    }
}

function linkContext(res, isJSONLD) {
    if (!isJSONLD && is2xxSuccessful(res.statusCode)) {
        res.header(
            'Link',
            `<${Config.getConfig().userContext}>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"`
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
        case 404:
            v2Body.type = 'https://uri.etsi.org/ngsi-ld/errors/NotFound';
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

async function sendRequest(path, options) {
    debug(`Forwarding ${options.method} to ${v2BrokerURL(path)}`);
    const response = await got(v2BrokerURL(path), options);
    //console.log(response.body);
    return response;
}

function sendResponse(res, v2Body, ldPayload, contentType, v2Headers, transformFlags, baseUrl) {
    if (contentType) {
        res.set('Content-Type', contentType);
        res.type(contentType);
    }

    if (v2Headers) {
        let count = 0;
        for (const key of Object.keys(v2Headers)) {
            if (key.toLowerCase() === 'fiware-total-count') {
                count = v2Headers[key];
                if (transformFlags.count) {
                    res.header('NGSILD-Results-Count', count);
                }
            }
        }
        if (Array.isArray(ldPayload) && ldPayload.length < count) {
            const prev = Number(transformFlags.offset) - ldPayload.length;
            const next = Number(transformFlags.offset) + ldPayload.length;
            let links = [res.get('Link')];
            if (prev > 0) {
                links.push(`<${baseUrl}&offset=${prev}>; rel="prev"`);
            }
            if (next < count) {
                links.push(`<${baseUrl}&offset=${next}>; rel="next"`);
            }
            res.header('Link', links);
        }
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

    getErrorType(res.statusCode, v2Body);
    return res.send(v2Body);
}

function serveContext(req, res) {
    res.set('Content-Type', 'application/ld+json');
    res.type('application/ld+json');
    return res.status(StatusCodes.OK).send({
        '@context': [Config.getConfig().userContext, Config.getConfig().coreContext]
    });
}

module.exports = {
    linkContext,
    getClientIp,
    sendResponse,
    sendRequest,
    sendError,
    is2xxSuccessful,
    ngsiVersion,
    serveContext
};
