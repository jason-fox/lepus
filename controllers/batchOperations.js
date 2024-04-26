/*
 * Copyright 2023 -  FIWARE Foundation e.V.
 *
 * This file is part of NGSI-LD to NGSI-v2 Adapter
 *
 */
const debug = require('debug')('adapter:batch');
const _ = require('lodash');
const NGSI_V2 = require('../lib/ngsi-v2');
const Request = require('../lib/request');

/**
 * Forward the proxied request to create an entity and
 * return the response.
 *
 * @param req - the incoming request
 * @param res - the response to return
 */
async function createEntities(req, res) {
    debug('createEntities');
    const headers = res.locals.headers;
    const contentType = req.get('content-type') ? 'application/json' : undefined;
    const entities = _.map(req.body, (entity) => {
        return NGSI_V2.formatEntity(entity);
    });

    headers['content-type'] = contentType;
    const options = {
        method: req.method,
        throwHttpErrors: false,
        retry: 0,
        json: {
            actionType: 'append_strict',
            entities
        }
    };

    const response = await Request.sendRequest('/op/update/', options);
    res.statusCode = response.statusCode;
    const v2Body = response.body ? JSON.parse(response.body) : undefined;
    const ldPayload = null;

    return Request.sendResponse(res, v2Body, ldPayload, contentType);
}

/**
 * Forward the proxied request to delete an entity and
 * return the response.
 *
 * @param req - the incoming request
 * @param res - the response to return
 */
async function deleteEntities(req, res) {
    debug('deleteEntities');
    const headers = res.locals.headers;
    const contentType = undefined;
    const entities = _.map(req.body, (entity) => {
        return { id: entity };
    });
    const options = {
        method: req.method,
        headers,
        throwHttpErrors: false,
        retry: 0,
        json: {
            actionType: 'delete',
            entities
        }
    };

    const response = await Request.sendRequest('/op/update/', options);
    res.statusCode = response.statusCode;
    const v2Body = response.body ? JSON.parse(response.body) : undefined;
    const ldPayload = null;

    return Request.sendResponse(res, v2Body, ldPayload, contentType);
}

/**
 * Forward the proxied request to update or create an entity and
 * return the response.
 *
 * @param req - the incoming request
 * @param res - the response to return
 */
async function upsertEntities(req, res) {
    debug('upsertEntities');
    const headers = res.locals.headers;
    const contentType = undefined;
    const entities = _.map(req.body, (entity) => {
        return NGSI_V2.formatEntity(entity);
    });
    const options = {
        method: req.method,
        headers,
        throwHttpErrors: false,
        retry: 0,
        json: {
            actionType: 'append',
            entities
        }
    };

    const response = await Request.sendRequest('/op/update/', options);
    res.statusCode = response.statusCode;
    const v2Body = response.body ? JSON.parse(response.body) : undefined;
    const ldPayload = null;

    return Request.sendResponse(res, v2Body, ldPayload, contentType);
}

/**
 * Forward the proxied request to update an entity and
 * return the response.
 *
 * @param req - the incoming request
 * @param res - the response to return
 */
async function updateEntities(req, res) {
    debug('updateEntities');
    const headers = res.locals.headers;
    const contentType = undefined;
    const entities = _.map(req.body, (entity) => {
        return NGSI_V2.formatEntity(entity);
    });
    const options = {
        method: req.method,
        headers,
        throwHttpErrors: false,
        retry: 0,
        json: {
            actionType: 'replace',
            entities
        }
    };

    const response = await Request.sendRequest('/op/update/', options);
    res.statusCode = response.statusCode;
    const v2Body = response.body ? JSON.parse(response.body) : undefined;
    const ldPayload = null;

    return Request.sendResponse(res, v2Body, ldPayload, contentType);
}

exports.upsert = upsertEntities;
exports.update = updateEntities;
exports.create = createEntities;
exports.delete = deleteEntities;
