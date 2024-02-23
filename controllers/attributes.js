/*
 * Copyright 2023 -  FIWARE Foundation e.V.
 *
 * This file is part of NGSI-LD to NGSI-v2 Adapter
 *
 */

const StatusCodes = require('http-status-codes').StatusCodes;
const getReasonPhrase = require('http-status-codes').getReasonPhrase;
const _ = require('lodash');

const debug = require('debug')('adapter:attributes');
const NGSI_LD = require('../lib/ngsi-ld');
const Constants = require('../lib/constants');

/**
 * /attributes proxying
 *
 * @param req - the incoming request
 * @param res - the response to return
 */

async function listAttributes(req, res) {
    const headers = res.locals.headers;
    const isJSONLD = req.get('Accept') === 'application/ld+json';
    const contentType = isJSONLD ? 'application/ld+json' : 'application/json';

    const options = {
        method: req.method,
        throwHttpErrors: false,
        headers,
        retry: 0
    };

    debug('listAttributes: ', req.path, options);
    const response = await Request.sendRequest('/types', options);

    res.statusCode = response.statusCode;
    if (res.locals.tenant) {
        res.set('NGSILD-Tenant', res.locals.tenant);
    }

    const v2Body = JSON.parse(response.body);
    const ldPayload = NGSI_LD.formatEntityAttributeList(v2Body, isJSONLD);

    if (_.isEmpty(ldPayload.attributeList)) {
        res.statusCode = StatusCodes.NOT_FOUND;
        return Request.sendError(res, {
            type: 'https://uri.etsi.org/ngsi-ld/errors/ResourceNotFound',
            title: getReasonPhrase(StatusCodes.NOT_FOUND),
            detail: `${req.path}`
        });
    }
    Request.linkContext(res, isJSONLD);
    return Request.sendResponse(res, v2Body, ldPayload, contentType);
}

/**
 * /attributes/<attr> proxying
 *
 * @param req - the incoming request
 * @param res - the response to return
 */

async function readAttribute(req, res) {
    const headers = res.locals.headers;
    const attrName = req.params.attr;
    const isJSONLD = req.get('Accept') === 'application/ld+json';
    const contentType = isJSONLD ? 'application/ld+json' : 'application/json';

    const options = {
        method: req.method,
        throwHttpErrors: false,
        headers,
        retry: 0
    };
    debug('readAttribute: ', req.path, options);
    const response = await Request.sendRequest('/types', options);

    res.statusCode = response.statusCode;
    if (res.locals.tenant) {
        res.set('NGSILD-Tenant', res.locals.tenant);
    }

    const v2Body = JSON.parse(response.body);
    const ldPayload = NGSI_LD.formatEntityAttribute(v2Body, isJSONLD, attrName);

    if (ldPayload.attributeCount === 0) {
        res.statusCode = StatusCodes.NOT_FOUND;
        return Request.sendError(res, {
            type: 'https://uri.etsi.org/ngsi-ld/errors/ResourceNotFound',
            title: getReasonPhrase(StatusCodes.NOT_FOUND),
            detail: `${attrName}`
        });
    }
    Request.linkContext(res, isJSONLD);
    return Request.sendResponse(res, v2Body, ldPayload, contentType);
}

exports.list = listAttributes;
exports.read = readAttribute;
