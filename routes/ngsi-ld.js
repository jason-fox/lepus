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
const entityMap = require('../controllers/entityMap');
const subscriptions = require('../controllers/subscriptions');
const notify = require('../controllers/notify');
const types = require('../controllers/types');
const batch = require('../controllers/batchOperations');
const identity = require('../controllers/sourceIdentity');
const attributes = require('../controllers/attributes');
const StatusCodes = require('http-status-codes').StatusCodes;

const methodNotAllowedHandler = require('../lib/errors').methodNotAllowedHandler;
const tryCatch = require('../lib/errors').tryCatch;

function optionsHandler(req, res, next, options = 'GET,OPTIONS', acceptPatch) {
    if (acceptPatch) {
        res.header('Accept-Patch', acceptPatch);
    }

    res.header('Allow', options);
    res.status(StatusCodes.OK).send();
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
router.route('/notify').post(tryCatch(notify.notifyAsLD)).all(methodNotAllowedHandler);

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

router
    .route('/entityMap')
    .options((req, res, next) => {
        optionsHandler(req, res, next, 'GET,OPTIONS');
    })
    .get(tryCatch(entityMap.generate))
    .all(methodNotAllowedHandler);
router
    .route('/entityMap/:id')
    .get(tryCatch(entityMap.read))
    .patch(tryCatch(entityMap.merge))
    .options((req, res, next) => {
        optionsHandler(
            req,
            res,
            next,
            'GET,PATCH,OPTIONS',
            'application/json, application/ld+json, application/merge-patch+json'
        );
    })
    .all(methodNotAllowedHandler);
// All other routes
router.route('/*').all(methodNotAllowedHandler);

module.exports = router;
