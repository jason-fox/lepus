const debug = require('debug')('adapter:batch');
const _ = require('lodash');
const NGSI_V2 = require('../lib/ngsi-v2');
const Constants = require('../lib/constants');
const got = require('got').extend({
    timeout: {
        request: Constants.v2Timeout()
    }
});

/**
 * Forward the proxied request to create an entity and
 * return the response.
 *
 * @param req - the incoming request
 * @param res - the response to return
 */
async function createEntities(req, res) {
    debug('POST', Constants.v2BrokerURL('/op/update/'), 'actionType: append_strict');
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

    const response = await got(Constants.v2BrokerURL('/op/update/'), options);
    res.statusCode = response.statusCode;
    const v2Body = response.body ? JSON.parse(response.body) : undefined;
    const ldPayload = null;

    return Constants.sendResponse(res, v2Body, ldPayload, contentType);
}

/**
 * Forward the proxied request to delete an entity and
 * return the response.
 *
 * @param req - the incoming request
 * @param res - the response to return
 */
async function deleteEntities(req, res) {
    debug('POST', Constants.v2BrokerURL('/op/update/'), 'actionType: delete');
    const headers = res.locals.headers;
    const contentType = undefined;
    const entities = _.map(req.body, (entity) => {
        return NGSI_V2.formatEntity(entity);
    });
    const options = {
        method: req.method,
        throwHttpErrors: false,
        retry: 0,
        json: {
            actionType: 'delete',
            entities
        }
    };

    const response = await got(Constants.v2BrokerURL('/op/update/'), options);
    res.statusCode = response.statusCode;
    const v2Body = response.body ? JSON.parse(response.body) : undefined;
    const ldPayload = null;

    return Constants.sendResponse(res, v2Body, ldPayload, contentType);
}

/**
 * Forward the proxied request to update or create an entity and
 * return the response.
 *
 * @param req - the incoming request
 * @param res - the response to return
 */
async function upsertEntities(req, res) {
    debug('POST', Constants.v2BrokerURL('/op/update/'), 'actionType: append');
    const headers = res.locals.headers;
    const contentType = undefined;
    const entities = _.map(req.body, (entity) => {
        return NGSI_V2.formatEntity(entity);
    });
    const options = {
        method: req.method,
        throwHttpErrors: false,
        retry: 0,
        json: {
            actionType: 'append',
            entities
        }
    };

    const response = await got(Constants.v2BrokerURL('/op/update/'), options);
    res.statusCode = response.statusCode;
    const v2Body = response.body ? JSON.parse(response.body) : undefined;
    const ldPayload = null;

    return Constants.sendResponse(res, v2Body, ldPayload, contentType);
}

/**
 * Forward the proxied request to update an entity and
 * return the response.
 *
 * @param req - the incoming request
 * @param res - the response to return
 */
async function updateEntities(req, res) {
    debug('POST', Constants.v2BrokerURL('/op/update/'), 'actionType: replace');
    const headers = res.locals.headers;
    const contentType = undefined;
    const entities = _.map(req.body, (entity) => {
        return NGSI_V2.formatEntity(entity);
    });
    const options = {
        method: req.method,
        throwHttpErrors: false,
        retry: 0,
        json: {
            actionType: 'replace',
            entities
        }
    };

    const response = await got(Constants.v2BrokerURL('/op/update/'), options);
    res.statusCode = response.statusCode;
    const v2Body = response.body ? JSON.parse(response.body) : undefined;
    const ldPayload = null;

    return Constants.sendResponse(res, v2Body, ldPayload, contentType);
}

exports.upsert = upsertEntities;
exports.update = updateEntities;
exports.create = createEntities;
exports.delete = deleteEntities;
