/*
 * Copyright 2023 -  FIWARE Foundation e.V.
 *
 * This file is part of NGSI-LD to NGSI-v2 Adapter
 *
 */

const debug = require('debug')('adapter:entities');
const _ = require('lodash');
const path = require('node:path');
const NGSI_LD = require('../lib/ngsi-ld');
const NGSI_V2 = require('../lib/ngsi-v2');
const Request = require('../lib/request');
const Config = require('../lib/configService');
const StatusCodes = require('http-status-codes').StatusCodes;
const getReasonPhrase = require('http-status-codes').getReasonPhrase;

/**
 * Forward the proxied request to read data and
 * return the response.
 *
 * @param req - the incoming request
 * @param res - the response to return
 */
async function generateEntityMap(req, res) {
    debug('readIds');
    const isJSONLD = req.get('Accept') === 'application/ld+json';
    const isPrefer = req.get('Prefer') ? req.get('Prefer') : null;
    const contentType = isJSONLD ? 'application/ld+json' : 'application/json';
    const queryOptions = req.query.options ? req.query.options.split(',') : null;
    const queryType = req.query.type ? req.query.type.split(',') : [];
    const queryQ = req.query.q;


  
    let v2queryOptions = null;
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

        if (queryType.length > 1) {
            delete options.searchParams.type;
        }
        if (v2queryOptions && v2queryOptions.length > 0) {
            options.searchParams.options = v2queryOptions.join(',');
        }
        if (queryQ) {
            options.searchParams.q = queryQ.replace(/"/gi, '').replace(/%22/gi, '');
        }
        options.searchParams.attrs = 'id';
        options.searchParams.limit = Config.getConfig().limit;
    }


    if (options.searchParams) {
        attrs = [];
        if (options.searchParams.q) {
            attrs.push('q=' + options.searchParams.q);
        }
        if (options.searchParams.type) {
            attrs.push('type=' + options.searchParams.type);
        }
        if (options.searchParams.id) {
            attrs.push('id=' + options.searchParams.id);
        }

        debug(req.method, req.path + '?' + attrs.join('&'));
    } else {
        debug(req.method, req.path);
    }

    let moreEntities = true;
    const ids = [];
    let offset = 0;

    while (moreEntities){
        const response = await Request.sendRequest('/entities', options);
        const v2Body = response.body ? JSON.parse(response.body) : [];
        if (!Request.is2xxSuccessful(res.statusCode)) {
            const error = {
                message: v2Body.description
            };
            //Request.getErrorType(res.statusCode, error)
            return Request.sendError(res, error);
        }
        const returnedIds = _.map(v2Body , (e)=>{ return e.id; });
        ids.push(...returnedIds)

        if (returnedIds.length === 0){
            moreEntities = false
        } else {
            offset = offset + options.searchParams.limit;
            options.searchParams.offset = offset;
        }
       
    }

    if (res.locals.tenant) {
        res.set('NGSILD-Tenant', res.locals.tenant);
    }
    if (res.locals.servicePath) {
        res.set('NGSILD-Path', res.locals.servicePath);
    }

    console.log(ids)
    const ldPayload = NGSI_LD.formatEntityMap(ids, isJSONLD);
    console.log(ldPayload)
    res.type(!isJSONLD ? 'application/json' : 'application/ld+json');
    return Request.sendResponse(res, {}, ldPayload, contentType);
}
/**
 * Since Entity Maps are not stored, return not found
 * 
 * @param req - the incoming request
 * @param res - the response to return
 */
function readEntityMap(req, res) {
    return res.status(StatusCodes.NOT_FOUND).send({
        type: 'https://uri.etsi.org/ngsi-ld/errors/ResourceNotFound',
        title: getReasonPhrase(StatusCodes.NOT_FOUND),
        detail: `${req.path}`
    });
}

/**
 * Since Entity Maps are not stored, return not found
 *
 * @param req - the incoming request
 * @param res - the response to return
 */
function mergeEntityMap(req, res) {
    return res.status(StatusCodes.NOT_FOUND).send({
        type: 'https://uri.etsi.org/ngsi-ld/errors/ResourceNotFound',
        title: getReasonPhrase(StatusCodes.NOT_FOUND),
        detail: `${req.path}`
    });
}

exports.generate = generateEntityMap;
exports.read = readEntityMap;
exports.merge = mergeEntityMap;
