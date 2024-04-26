/*
 * Copyright 2023 -  FIWARE Foundation e.V.
 *
 * This file is part of NGSI-LD to NGSI-v2 Adapter
 *
 */

const debug = require('debug')('adapter:entities');
const StatusCodes = require('http-status-codes').StatusCodes;
const getReasonPhrase = require('http-status-codes').getReasonPhrase;
const _ = require('lodash');
const path = require('node:path');
const NGSI_LD = require('../lib/ngsi-ld');
const NGSI_V2 = require('../lib/ngsi-v2');
const Request = require('../lib/request');

/**
 * Forward the proxied request to read data and
 * return the response.
 *
 * @param req - the incoming request
 * @param res - the response to return
 */
async function readEntities(req, res) {
    debug('readEntities');
    const isJSONLD = req.get('Accept') === 'application/ld+json';
    const isPrefer = req.get('Prefer') ? req.get('Prefer') : null;
    const contentType = isJSONLD ? 'application/ld+json' : 'application/json';
    const queryOptions = req.query.options ? req.query.options.split(',') : null;
    const queryFormat = req.query.format;
    const queryAttrs = req.query.attrs ? req.query.attrs.split(',') : null;
    const queryType = req.query.type ? req.query.type.split(',') : [];
    const queryQ = req.query.q;

    const transformFlags = {};
    transformFlags.sysAttrs = !!(queryOptions && queryOptions.includes('sysAttrs'));
    transformFlags.concise = !!(queryOptions && queryOptions.includes('concise')) || queryFormat === 'concise';
    transformFlags.keyValues =
        !!(queryOptions && (queryOptions.includes('keyValues') || queryOptions.includes('simplified'))) ||
        (queryFormat === 'keyValues') | (queryFormat === 'simplified');
    transformFlags.attrsOnly = req.path.split(path.sep).includes('attrs');
    transformFlags.pick = req.query.pick;
    transformFlags.omit = req.query.omit;

    if (isPrefer && isPrefer.startsWith('ngsi-ld=')) {
        transformFlags.version = isPrefer.substring(8);
    }

    let v2queryOptions = null;
    let ldPayload = null;
    if (req.query.options) {
        v2queryOptions = _.without(queryOptions, 'concise', 'sysAttrs');
    }

    const headers = NGSI_V2.setHeaders(res);
    const options = {
        method: req.method,
        headers,
        throwHttpErrors: false,
        retry: 0
    };

    if (req.query) {
        options.searchParams = req.query;
        delete options.searchParams.options;
        delete options.searchParams.scopeQ;
        delete options.searchParams.pick;
        delete options.searchParams.omit;
        delete options.searchParams.format;

        if (queryType.length > 1) {
            delete options.searchParams.type;
        }
        if (v2queryOptions && v2queryOptions.length > 0) {
            options.searchParams.options = v2queryOptions.join(',');
        }

        if (queryAttrs && queryAttrs.length > 0) {
            options.searchParams.attrs = queryAttrs.join(',');
        }
        if (queryQ) {
            options.searchParams.q = queryQ.replace(/"/gi, '').replace(/%22/gi, '');
        }
    }

    if (transformFlags.sysAttrs) {
        options.searchParams = options.searchParams || {};
        options.searchParams.metadata = 'dateCreated,dateModified,*';
    }

    if (options.searchParams) {
        const attrs = [];
        if (options.searchParams.q) {
            attrs.push('q=' + options.searchParams.q);
        }
        if (options.searchParams.options) {
            attrs.push('options=' + options.searchParams.options);
        }
        if (options.searchParams.type) {
            attrs.push('type=' + options.searchParams.type);
        }
        if (options.searchParams.id) {
            attrs.push('id=' + options.searchParams.id);
        }
        if (options.searchParams.attrs) {
            attrs.push('attrs=' + options.searchParams.attrs);
        }

        debug(req.method, req.path + '?' + attrs.join('&'));
    } else {
        debug(req.method, req.path);
    }
    const response = await Request.sendRequest(req.path, options);

    res.statusCode = response.statusCode;
    if (res.locals.tenant) {
        res.set('NGSILD-Tenant', res.locals.tenant);
    }
    if (res.locals.servicePath) {
        res.set('NGSILD-Path', res.locals.servicePath);
    }
    const v2Body = response.body ? JSON.parse(response.body) : {};
    const type = v2Body.type;
    if (!Request.is2xxSuccessful(res.statusCode)) {
        const error = {
            message: v2Body.description
        };
        //Request.getErrorType(res.statusCode, error)
        return Request.sendError(res, error);
    }

    if (queryType.length > 1 && !queryType.includes(type)) {
        res.set('Content-Type', 'application/json');
        res.type('application/json');
        return res.status(StatusCodes.NOT_FOUND).send({
            type: 'https://uri.etsi.org/ngsi-ld/errors/ResourceNotFound',
            title: getReasonPhrase(StatusCodes.NOT_FOUND),
            detail: `${req.path}`
        });
    }
    if (transformFlags.keyValues) {
        ldPayload = v2Body;
    } else if (transformFlags.attrsOnly) {
        ldPayload = NGSI_LD.formatAttribute(v2Body, transformFlags);
    } else if (v2Body instanceof Array) {
        ldPayload = _.map(v2Body, (entity) => {
            return NGSI_LD.formatEntity(entity, isJSONLD, transformFlags);
        });
    } else {
        ldPayload = NGSI_LD.formatEntity(v2Body, isJSONLD, transformFlags);
    }
    ldPayload = NGSI_LD.appendContext(ldPayload, isJSONLD);
    Request.linkContext(res, isJSONLD);
    Request.ngsiVersion(res, transformFlags.version);
    res.type(!isJSONLD ? 'application/json' : 'application/ld+json');
    return Request.sendResponse(res, v2Body, ldPayload, contentType);
}

/**
 * Forward the proxied request to create an entity and
 * return the response.
 *
 * @param req - the incoming request
 * @param res - the response to return
 */
async function createEntity(req, res) {
    debug('createEntity');
    const headers = NGSI_V2.setHeaders(res);
    const options = {
        method: req.method,
        throwHttpErrors: false,
        retry: 0,
        headers,
        json: NGSI_V2.formatEntity(req.body)
    };
    const response = await Request.sendRequest(req.path, options);
    res.statusCode = response.statusCode;
    const v2Body = response.body ? JSON.parse(response.body) : undefined;
    return Request.sendResponse(res, v2Body);
}

/**
 * Forward the proxied request to delete an entity and
 * return the response.
 *
 * @param req - the incoming request
 * @param res - the response to return
 */
async function deleteEntity(req, res) {
    debug('deleteEntity');
    const headers = NGSI_V2.setHeaders(res);
    const options = {
        method: 'DELETE',
        headers,
        throwHttpErrors: false,
        retry: 0
    };

    const response = await Request.sendRequest(req.path, options);
    res.statusCode = response.statusCode;
    const v2Body = response.body ? JSON.parse(response.body) : undefined;
    return Request.sendResponse(res, v2Body);
}

/**
 * Forward the proxied request to update an entity and
 * return the response.
 *
 * @param req - the incoming request
 * @param res - the response to return
 */
async function updateEntity(req, res) {
    debug('updateEntity');
    const headers = NGSI_V2.setHeaders(res);
    const options = {
        method: 'PATCH',
        headers,
        throwHttpErrors: false,
        retry: 0,
        json: NGSI_V2.formatEntity(req.body)
    };

    const response = await Request.sendRequest(req.path, options);
    res.statusCode = response.statusCode;
    const v2Body = response.body ? JSON.parse(response.body) : undefined;

    return Request.sendResponse(res, v2Body);
}

/**
 * Forward the proxied request to overwrite an entity and
 * return the response.
 *
 * @param req - the incoming request
 * @param res - the response to return
 */
async function replaceEntity(req, res) {
    debug('replaceEntity');
    const headers = NGSI_V2.setHeaders(res);
    const options = {
        method: 'PUT',
        headers,
        throwHttpErrors: false,
        retry: 0,
        json: NGSI_V2.formatEntity(req.body)
    };

    delete options.json.type;

    const response = await Request.sendRequest(path.join(req.path, 'attrs'), options);
    res.statusCode = response.statusCode;
    const v2Body = response.body ? JSON.parse(response.body) : undefined;
    return Request.sendResponse(res, v2Body);
}

/**
 * Forward the proxied request to merge an entity and
 * return the response.
 *
 * @param req - the incoming request
 * @param res - the response to return
 */
async function mergeEntity(req, res) {
    debug('mergeEntity');
    const headers = NGSI_V2.setHeaders(res);

    const optionsGet = {
        method: 'GET',
        headers,
        throwHttpErrors: false,
        retry: 0
    };
    const responseGet = await Request.sendRequest(req.path, optionsGet);

    if (responseGet.statusCode === 404) {
        res.set('Content-Type', 'application/json');
        res.type('application/json');
        return res.status(StatusCodes.NOT_FOUND).send({
            type: 'https://uri.etsi.org/ngsi-ld/errors/ResourceNotFound',
            title: getReasonPhrase(StatusCodes.NOT_FOUND),
            detail: `${req.path}`
        });
    }

    const mergeObject = NGSI_LD.normalizeEntity(req.body);
    const entity = NGSI_LD.formatEntity(JSON.parse(responseGet.body));
    const mergedEntity = _.merge(entity, mergeObject);

    Object.keys(req.body).forEach(function (key) {
        if (req.body[key] === 'urn:ngsi-ld:null') {
            delete mergedEntity[key];
        } else {
            Object.keys(req.body[key]).forEach(function (metadataKey) {
                if (req.body[key][metadataKey] === 'urn:ngsi-ld:null') {
                    delete mergedEntity[key][metadataKey];
                }
            });
        }
    });

    const v2mergedEntity = NGSI_V2.formatEntity(mergedEntity);
    delete v2mergedEntity.type;
    delete v2mergedEntity.id;

    const optionsPut = {
        method: 'PUT',
        headers,
        throwHttpErrors: false,
        retry: 0,
        json: v2mergedEntity
    };

    const responsePut = await Request.sendRequest(path.join(req.path, 'attrs'), optionsPut);
    res.statusCode = responsePut.statusCode;
    const v2Body = responsePut.body ? JSON.parse(responsePut.body) : undefined;
    return Request.sendResponse(res, v2Body);
}

/**
 * Forward the proxied request to update an entity attribute and
 * return the response.
 *
 * @param req - the incoming request
 * @param res - the response to return
 */
async function updateEntityAttribute(req, res) {
    debug('updateEntityAttribute');
    const headers = NGSI_V2.setHeaders(res);
    const options = {
        method: 'PATCH',
        headers,
        throwHttpErrors: false,
        retry: 0,
        json: {}
    };

    options.json[req.params.attr] = NGSI_V2.formatAttribute(req.body);
    const response = await Request.sendRequest(path.join('/entities', req.params.id, 'attrs'), options);
    res.statusCode = response.statusCode;
    const v2Body = response.body ? JSON.parse(response.body) : undefined;
    return Request.sendResponse(res, v2Body);
}

/**
 * Forward the proxied request to update an entity attribute and
 * return the response.
 *
 * @param req - the incoming request
 * @param res - the response to return
 */
async function replaceEntityAttribute(req, res) {
    debug('replaceEntityAttribute');
    const headers = NGSI_V2.setHeaders(res);
    const options = {
        method: 'PUT',
        headers,
        throwHttpErrors: false,
        retry: 0,
        json: NGSI_V2.formatAttribute(req.body)
    };

    const response = await Request.sendRequest(req.path, options);
    res.statusCode = response.statusCode;
    const v2Body = response.body ? JSON.parse(response.body) : undefined;

    return Request.sendResponse(res, v2Body);
}

/**
 * Forward the proxied request to delete an entity attribute and
 * return the response.
 *
 * @param req - the incoming request
 * @param res - the response to return
 */
async function deleteEntityAttribute(req, res) {
    debug('deleteEntityAttribute');
    const headers = NGSI_V2.setHeaders(res);
    const options = {
        method: 'DELETE',
        headers,
        throwHttpErrors: false,
        retry: 0
    };

    const response = await Request.sendRequest(req.path, options);
    res.statusCode = response.statusCode;
    const v2Body = response.body ? JSON.parse(response.body) : undefined;

    return Request.sendResponse(res, v2Body);
}

/**
 * Forward the proxied request to delete entities based on q and
 * pick/omit
 *
 * @param req - the incoming request
 * @param res - the response to return
 */
async function purgeEntities(req, res) {
    debug('purgeEntities');
    const queryAttrs = req.query.attrs ? req.query.attrs.split(',') : null;
    const queryType = req.query.type ? req.query.type.split(',') : [];
    const queryQ = req.query.q;

    const transformFlags = {};
    // Deliberately swap these for the delete function
    transformFlags.omit = req.query.pick;
    transformFlags.pick = req.query.omit;

    const headers = NGSI_V2.setHeaders(res);
    const optionsGet = {
        method: 'GET',
        headers,
        throwHttpErrors: false,
        retry: 0
    };

    if (req.query) {
        optionsGet.searchParams = req.query;
        delete optionsGet.searchParams.options;
        delete optionsGet.searchParams.scopeQ;
        delete optionsGet.searchParams.pick;

        if (queryType.length > 1) {
            delete optionsGet.searchParams.type;
        }

        if (queryAttrs && queryAttrs.length > 0) {
            optionsGet.searchParams.attrs = queryAttrs.join(',');
        }
        if (queryQ) {
            optionsGet.searchParams.q = queryQ.replace(/"/gi, '').replace(/%22/gi, '');
        }
    }

    if (optionsGet.searchParams) {
        const attrs = [];
        if (optionsGet.searchParams.q) {
            attrs.push('q=' + optionsGet.searchParams.q);
        }
        if (optionsGet.searchParams.type) {
            attrs.push('type=' + optionsGet.searchParams.type);
        }
        if (optionsGet.searchParams.id) {
            attrs.push('id=' + optionsGet.searchParams.id);
        }
        if (optionsGet.searchParams.attrs) {
            attrs.push('attrs=' + optionsGet.searchParams.attrs);
        }

        debug('GET', req.path + '?' + attrs.join('&'));
    } else {
        debug('GET', req.path);
    }

    const responseGet = await Request.sendRequest(req.path, optionsGet);
    res.statusCode = responseGet.statusCode;

    const v2BodyGet = JSON.parse(responseGet.body);
    const type = v2BodyGet.type;
    if (!Request.is2xxSuccessful(res.statusCode)) {
        return Request.sendError(res, v2BodyGet);
    }
    if (queryType.length > 1 && !queryType.includes(type)) {
        res.set('Content-Type', 'application/json');
        res.type('application/json');
        return res.status(StatusCodes.NOT_FOUND).send({
            type: 'https://uri.etsi.org/ngsi-ld/errors/ResourceNotFound',
            title: getReasonPhrase(StatusCodes.NOT_FOUND),
            detail: `${req.path}`
        });
    }

    let entities;
    let actionType;

    if (transformFlags.pick || transformFlags.omit) {
        actionType = 'replace';
        entities = _.map(v2BodyGet, (entity) => {
            const obj = NGSI_V2.formatEntity(entity, transformFlags);
            obj.id = entity.id;
            obj.type = entity.type;
            return obj;
        });
    } else {
        actionType = 'delete';
        entities = _.map(v2BodyGet, (entity) => {
            const obj = {
                id: entity.id,
                type: entity.type
            };
            return NGSI_V2.formatEntity(obj);
        });
    }

    const optionsBatchDelete = {
        method: 'POST',
        throwHttpErrors: false,
        retry: 0,
        json: {
            actionType,
            entities
        }
    };

    const responseDelete = await Request.sendRequest('/op/update/', optionsBatchDelete);
    res.statusCode = responseDelete.statusCode;
    const v2BodyDelete = responseDelete.body ? JSON.parse(responseDelete.body) : undefined;

    return Request.sendResponse(res, v2BodyDelete);
}

exports.read = readEntities;
exports.create = createEntity;
exports.delete = deleteEntity;
exports.merge = mergeEntity;
exports.purge = purgeEntities;
exports.overwrite = replaceEntity;
exports.update = updateEntity;
exports.updateAttr = updateEntityAttribute;
exports.deleteAttr = deleteEntityAttribute;
exports.overwriteAttr = replaceEntityAttribute;
