/*
 * Copyright 2023 -  FIWARE Foundation e.V.
 *
 * This file is part of NGSI-LD to NGSI-v2 Adapter
 *
 */

const StatusCodes = require('http-status-codes').StatusCodes;
const getReasonPhrase = require('http-status-codes').getReasonPhrase;
const _ = require('lodash');

const path = require('path');
const debug = require('debug')('adapter:identity');
const NGSI_LD = require('../lib/ngsi-ld');
const Constants = require('../lib/constants');
const Config = require('../lib/configService');
const Request = require('../lib/request');
const got = require('got').extend({
    timeout: {
        request: Config.getConfig().v2Timeout
    }
});

function is2xxSuccessful(status) {
    return Math.floor(status / 100) === 2;
}

/**
 * /attributes/<attr> proxying
 *
 * @param req - the incoming request
 * @param res - the response to return
 */

async function getIdentity(req, res) {
    const headers = res.locals.headers;
    const attrName = req.params.attr;
    const isJSONLD = req.get('Accept') === 'application/ld+json';
    const contentType = isJSONLD ? 'application/ld+json' : 'application/json';

    const options = {
        method: 'GET',
        throwHttpErrors: false,
        headers,
        retry: 0
    };
    debug('getIdentity');

    const response = await got(path.join(Config.getConfig().v2ContextBroker, 'version'), options);

    res.statusCode = response.statusCode;
    if (res.locals.tenant) {
        res.set('NGSILD-Tenant', res.locals.tenant);
    }

    const v2Body = JSON.parse(response.body);
    const ldPayload = NGSI_LD.formatContextSourceIdentity(v2Body, isJSONLD);

    if (!isJSONLD && is2xxSuccessful(res.statusCode)) {
        res.header(
            'Link',
            `<${
                Config.getConfig().coreContext
            }>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"`
        );
    }
    return Request.sendResponse(res, v2Body, ldPayload, contentType);
}

exports.get = getIdentity;
