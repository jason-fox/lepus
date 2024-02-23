/*
 * Copyright 2023 -  FIWARE Foundation e.V.
 *
 * This file is part of NGSI-LD to NGSI-v2 Adapter
 *
 */

const StatusCodes = require('http-status-codes').StatusCodes;
const getReasonPhrase = require('http-status-codes').getReasonPhrase;
const _ = require('lodash');
const debug = require('debug')('adapter:subscriptions');
const Config = require('../lib/configService');
const Request = require('../lib/request');
const NGSI_LD = require('../lib/ngsi-ld');
const NGSI_V2 = require('../lib/ngsi-v2');

/**
 * /subscription proxying
 *
 * @param req - the incoming request
 * @param res - the response to return
 */

async function listSubscriptions(req, res) {
    const headers = res.locals.headers;
    const isJSONLD = req.get('Accept') === 'application/ld+json';
    const contentType = isJSONLD ? 'application/ld+json' : 'application/json';
    const options = {
        method: req.method,
        headers,
        throwHttpErrors: false,
        retry: 0
    };

    debug('listSubscriptions: ', req.path, options);
    const response = await Request.sendRequest('/subscriptions', options);

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
    let ldPayload = [];

    if (v2Body instanceof Array) {
        const filtered = _.filter(v2Body || [], function (sub) {
            return sub.notification.httpCustom;
        });
        ldPayload = _.map(filtered, (sub) => {
            return NGSI_LD.formatSubscription(sub, isJSONLD);
        });
    }

    return Request.sendResponse(res, v2Body, ldPayload, contentType);
}

/**
 * /subscription/id proxying
 *
 * @param req - the incoming request
 * @param res - the response to return
 */

async function readSubscription(req, res) {
    const headers = res.locals.headers;
    const isJSONLD = req.get('Accept') === 'application/ld+json';
    const contentType = isJSONLD ? 'application/ld+json' : 'application/json';
    const id = req.params.id.replace(/urn:ngsi-ld:Subscription:/gi, '');
    const options = {
        method: req.method,
        throwHttpErrors: false,
        headers,
        retry: 0
    };

    debug('readSubscription: ', req.path, options);
    const response = await Request.sendRequest('/subscriptions/' + id, options);
    const v2Body = JSON.parse(response.body);
    res.statusCode = response.statusCode;
    if (res.locals.tenant) {
        res.set('NGSILD-Tenant', res.locals.tenant);
    }
    if (!Request.is2xxSuccessful(res.statusCode)) {
        return Request.sendError(res, v2Body);
    }
    res.headers = response.headers;
    Request.linkContext(res, isJSONLD);
    const ldPayload = NGSI_LD.formatSubscription(v2Body, isJSONLD);
    return Request.sendResponse(res, v2Body, ldPayload, contentType);
}

/**
 * /subscription/id deletion
 *
 * @param req - the incoming request
 * @param res - the response to return
 */

async function deleteSubscription(req, res) {
    const headers = res.locals.headers;

    const id = req.params.id.replace(/urn:ngsi-ld:Subscription:/gi, '');
    const options = {
        method: req.method,
        headers,
        throwHttpErrors: false,
        retry: 0
    };

    debug('deleteSubscription: ', req.path, options);
    const response = await Request.sendRequest('/subscriptions/' + id, options);

    res.statusCode = response.statusCode;
    res.headers = response.headers;
    if (res.locals.tenant) {
        res.set('NGSILD-Tenant', res.locals.tenant);
    }
    if (!Request.is2xxSuccessful(res.statusCode)) {
        const v2Body = JSON.parse(response.body);
        return Request.sendError(res, v2Body);
    }
    return res.send();
}

/**
 * /subscription/id creation
 *
 * @param req - the incoming request
 * @param res - the response to return
 */

async function createSubscription(req, res) {
    const headers = res.locals.headers;
    const v2Payload = NGSI_V2.formatSubscription(req.body);

    const options = {
        method: req.method,
        throwHttpErrors: false,
        headers,
        retry: 0,
        json: v2Payload
    };

    debug('createSubscription: ', req.path, options);
    const response = await Request.sendRequest('/subscriptions', options);

    res.statusCode = response.statusCode;
    if (response.headers.location) {
        {
            res.set(
                'Location',
                response.headers.location.replace(/v2\/subscriptions\//gi, 'ngsi-ld/v1/urn:ngsi-ld:Subscription:')
            );
        }
    }
    if (res.locals.tenant) {
        res.set('NGSILD-Tenant', res.locals.tenant);
    }

    if (!Request.is2xxSuccessful(res.statusCode)) {
        const v2Body = JSON.parse(response.body);
        return Request.sendError(res, v2Body);
    }
    return res.send();
}

async function updateSubscription(req, res) {
    const headers = res.locals.headers;
    const id = req.params.id.replace(/urn:ngsi-ld:Subscription:/gi, '');
    let v2Payload = NGSI_V2.formatSubscription(req.body);

    const options = {
        method: req.method,
        throwHttpErrors: false,
        retry: 0,
        headers,
        json: v2Payload
    };

    debug('updateSubscription: ', req.path, options);
    const response = await Request.sendRequest('/subscriptions/' + id, options);

    res.statusCode = response.statusCode;
    res.headers = response.headers;
    if (res.locals.tenant) {
        res.set('NGSILD-Tenant', res.locals.tenant);
    }
    if (!Request.is2xxSuccessful(res.statusCode)) {
        const v2Body = JSON.parse(response.body);
        return Request.sendError(res, v2Body);
    }
    return res.send();
}

exports.list = listSubscriptions;
exports.read = readSubscription;
exports.create = createSubscription;
exports.delete = deleteSubscription;
exports.update = updateSubscription;
