/*
 * Copyright 2023 -  FIWARE Foundation e.V.
 *
 * This file is part of NGSI-LD to NGSI-v2 Adapter
 *
 */

const debug = require('debug')('adapter:routes');
const express = require('express');
const router = express.Router();
const entities = require('../controllers/entities');
const subscriptions = require('../controllers/subscriptions');
const notify = require('../controllers/notify');
const types = require('../controllers/types');
const batch = require('../controllers/batchOperations');
const identity = require('../controllers/sourceIdentity');
const attributes = require('../controllers/attributes');
const StatusCodes = require('http-status-codes').StatusCodes;
const getReasonPhrase = require('http-status-codes').getReasonPhrase;

function optionsHandler(req, res, next, options = 'GET,OPTIONS', acceptPatch) {
    if (acceptPatch) {
        res.header('Accept-Patch', acceptPatch);
    }

    res.header('Allow', options);
    res.status(StatusCodes.OK).send();
}

const tryCatch = (controller) => async (req, res, next) => {
    try {
        await controller(req, res);
    } catch (error) {
        switch (error.code) {
            case 'ENOTFOUND':
                res.status(StatusCodes.NOT_FOUND).send({
                    type: 'https://uri.etsi.org/ngsi-ld/errors/ResourceNotFound',
                    title: getReasonPhrase(StatusCodes.NOT_FOUND),
                    message: `${req.path} cannot be found`
                });
                break;
            case 'ETIMEDOUT':
                res.status(StatusCodes.GATEWAY_TIMEOUT).send({
                    type: 'https://uri.etsi.org/ngsi-ld/errors/GatewayTimeout',
                    title: getReasonPhrase(StatusCodes.GATEWAY_TIMEOUT),
                    message: `${req.path} is did not respond in time`
                });
                break;
            case 'ECONNREFUSED':
                res.status(StatusCodes.BAD_GATEWAY).send({
                    type: 'https://uri.etsi.org/ngsi-ld/errors/BadGateway',
                    title: getReasonPhrase(StatusCodes.BAD_GATEWAY),
                    message: `${req.path} server is unavailable`
                });
                break;
            default:
                debug(error);
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
                    type: 'https://uri.etsi.org/ngsi-ld/errors/InternalError',
                    title: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
                    message: `${req.path} caused an error:  ${error.code}`
                });
                break;
        }
        return next(error);
    }
};

function methodNotAllowedHandler(req, res) {
    res.status(StatusCodes.METHOD_NOT_ALLOWED).send({
        type: 'urn:ngsi-ld:MethodNotAllowed',
        title: getReasonPhrase(StatusCodes.METHOD_NOT_ALLOWED),
        message: `${req.method} not supported for ${req.path}`
    });
}

// Entities
router
    .route('/entities')
    .get(tryCatch(entities.read))
    .post(tryCatch(entities.create))
    .delete(tryCatch(entities.purge))
    .options((req, res, next) => {
        optionsHandler(req, res, next, 'GET,POST,DELETE,OPTIONS');
    })
    .all(methodNotAllowedHandler);
router
    .route('/entities/:id')
    .get(tryCatch(entities.read))
    .put(tryCatch(entities.overwrite))
    .patch(tryCatch(entities.merge))
    .delete(tryCatch(entities.delete))
    .options((req, res, next) => {
        optionsHandler(
            req,
            res,
            next,
            'GET,PATCH,PUT,DELETE,OPTIONS',
            'application/json, application/ld+json, application/merge-patch+json'
        );
    })
    .all(methodNotAllowedHandler);
// Entity Attributes
router
    .route('/entities/:id/attrs')
    .post(tryCatch(entities.create))
    .patch(tryCatch(entities.update))
    .options((req, res, next) => {
        optionsHandler(req, res, next, 'GET,PATCH,POST,OPTIONS', 'application/json, application/ld+json');
    })
    .all(methodNotAllowedHandler);
router
    .route('/entities/:id/attrs/:attr')
    .get(tryCatch(entities.read))
    .patch(tryCatch(entities.updateAttr))
    .delete(tryCatch(entities.deleteAttr))
    .put(tryCatch(entities.overwriteAttr))
    .options((req, res, next) => {
        optionsHandler(req, res, next, 'GET,PATCH,PUT,DELETE,OPTIONS', 'application/json, application/ld+json');
    })
    .all(methodNotAllowedHandler);

// Subscriptions
router
    .route('/subscriptions')
    .get(tryCatch(subscriptions.list))
    .post(tryCatch(subscriptions.create))
    .options((req, res, next) => {
        optionsHandler(req, res, next, 'GET,POST,OPTIONS');
    })
    .all(methodNotAllowedHandler);

router
    .route('/subscriptions/:id')
    .get(tryCatch(subscriptions.read))
    .delete(tryCatch(subscriptions.delete))
    .patch(tryCatch(subscriptions.update))
    .options((req, res, next) => {
        optionsHandler(req, res, next, 'GET,PATCH,DELETE,OPTIONS');
    })
    .all(methodNotAllowedHandler);

// Types
router.route('/types').get(tryCatch(types.list)).options(optionsHandler).all(methodNotAllowedHandler);
router.route('/types/:type').get(tryCatch(types.read)).options(optionsHandler).all(methodNotAllowedHandler);

// Attributes
router.route('/attributes').get(tryCatch(attributes.list)).options(optionsHandler).all(methodNotAllowedHandler);
router.route('/attributes/:attr').get(tryCatch(attributes.read)).options(optionsHandler).all(methodNotAllowedHandler);

// Notifications
router.route('/notify').post(tryCatch(notify.notify)).all(methodNotAllowedHandler);

// Batch Operations
router
    .route('/entityOperations/create')
    .post(tryCatch(batch.create))
    .options((req, res, next) => {
        optionsHandler(req, res, next, 'POST,OPTIONS');
    })
    .all(methodNotAllowedHandler);
router
    .route('/entityOperations/upsert')
    .post(tryCatch(batch.upsert))
    .options((req, res, next) => {
        optionsHandler(req, res, next, 'POST,OPTIONS');
    })
    .all(methodNotAllowedHandler);
router
    .route('/entityOperations/update')
    .options((req, res, next) => {
        optionsHandler(req, res, next, 'POST,OPTIONS');
    })
    .post(tryCatch(batch.update))
    .all(methodNotAllowedHandler);
router
    .route('/entityOperations/delete')
    .options((req, res, next) => {
        optionsHandler(req, res, next, 'POST,OPTIONS');
    })
    .post(tryCatch(batch.delete))
    .all(methodNotAllowedHandler);
router
    .route('/info/sourceIdentity')
    .options((req, res, next) => {
        optionsHandler(req, res, next, 'GET,OPTIONS');
    })
    .get(tryCatch(identity.get))
    .all(methodNotAllowedHandler);

// All other routes
router.route('/*').all(methodNotAllowedHandler);

module.exports = router;
