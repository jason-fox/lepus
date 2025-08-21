/*
 * Copyright 2023 -  FIWARE Foundation e.V.
 *
 * This file is part of NGSI-LD to NGSI-v2 Adapter
 *
 */
const debug = require('debug')('adapter:types');
const NGSI_LD = require('../lib/ngsi-ld');
const Request = require('../lib/request');

async function listTypes(req, res) {
    const headers = res.locals.headers;
    const isJSONLD = req.get('Accept') === 'application/ld+json';
    const contentType = isJSONLD ? 'application/ld+json' : 'application/json';
    const options = {
        method: req.method,
        throwHttpErrors: false,
        headers,
        retry: 0
    };

    debug('listTypes: ', req.path, options);
    const response = await Request.sendRequest(req.path, options);

    res.statusCode = response.statusCode;
    res.headers = response.headers;
    if (res.locals.tenant) {
        res.set('NGSILD-Tenant', res.locals.tenant);
    }
    const v2Body = JSON.parse(response.body);
    if (!Request.is2xxSuccessful(res.statusCode)) {
        return Request.sendError(res, v2Body);
    }

    Request.linkContext(res, isJSONLD);

    let ldPayload = [];

    ldPayload = NGSI_LD.formatEntityTypeList(v2Body, isJSONLD);

    return Request.sendResponse(req, res, v2Body, ldPayload, contentType);
}

async function readType(req, res) {
    const headers = res.locals.headers;
    const typeName = req.params.type;
    const isJSONLD = req.get('Accept') === 'application/ld+json';
    const contentType = isJSONLD ? 'application/ld+json' : 'application/json';
    const options = {
        method: req.method,
        throwHttpErrors: false,
        headers,
        retry: 0
    };

    debug('readType: ', req.path, options);
    const response = await Request.sendRequest(req.path, options);

    res.statusCode = response.statusCode;
    if (res.locals.tenant) {
        res.set('NGSILD-Tenant', res.locals.tenant);
    }
    const v2Body = JSON.parse(response.body);
    if (!Request.is2xxSuccessful(res.statusCode)) {
        return Request.sendError(res, v2Body);
    }
    res.headers = response.headers;
    Request.linkContext(res, isJSONLD);

    const ldPayload = NGSI_LD.formatEntityTypeInformation(v2Body, isJSONLD, typeName);

    return Request.sendResponse(req, res, v2Body, ldPayload, contentType);
}

exports.list = listTypes;
exports.read = readType;
