/*
 * Copyright 2023 -  FIWARE Foundation e.V.
 *
 * This file is part of NGSI-LD to NGSI-v2 Adapter
 *
 */

/* eslint-disable no-unused-vars */

const lepus = require('../../lib/lepus');
const config = require('../config-test');
const nock = require('nock');
const should = require('should');
const assert = require('node:assert').strict;
const utils = require('../utils');
const request = utils.request;
const LEPUS_URL = 'http://localhost:3000/ngsi-ld/v1/';
const V2_BROKER = 'http://orion:1026';
const _ = require('lodash');
const timekeeper = require('timekeeper');

let contextBrokerMock;

describe('Create Entity', function () {
    beforeEach(function (done) {
        nock.cleanAll();
        done();
    });

    afterEach(function (done) {
        nock.cleanAll();
        done();
    });

    before(function (done) {
        lepus.start(config, function (text) {
            done();
        });
    });

    after(function (done) {
        lepus.stop(function () {
            done();
        });
    });

    const options = {
        method: 'POST',
        url: LEPUS_URL + 'entities'
    };
    const ORION_ENDPOINT = '/v2/entities';

    describe('When a normalized entity is created', function () {
        beforeEach(function (done) {
            options.json = utils.readExampleFile('./test/ngsi-ld/Entity.json');
            contextBrokerMock = nock(V2_BROKER)
                .post(ORION_ENDPOINT, utils.readExampleFile('./test/ngsi-v2/Entity.json'))
                .reply(201);

            done();
        });
        it('should return success', function (done) {
            request(options, function (error, response, body) {
                response.statusCode.should.equal(201);
                done();
            });
        });

        it('should forward an NGSI-v2 POST request', function (done) {
            request(options, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
    });

    describe('When a normalized entity using keywords is created', function () {
        beforeEach(function (done) {
            options.json = utils.readExampleFile('./test/ngsi-ld/keywords.json');
            contextBrokerMock = nock(V2_BROKER)
                .post(ORION_ENDPOINT, utils.readExampleFile('./test/ngsi-v2/keywords-id.json'))
                .reply(201);

            done();
        });

        it('should forward an NGSI-v2 POST request', function (done) {
            request(options, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
    });

    describe('When a concise entity using keywords is created', function () {
        beforeEach(function (done) {
            options.json = utils.readExampleFile('./test/ngsi-ld/keywords-concise.json');
            contextBrokerMock = nock(V2_BROKER)
                .post(ORION_ENDPOINT, utils.readExampleFile('./test/ngsi-v2/keywords-concise.json'))
                .reply(201);

            done();
        });

        it('should forward an NGSI-v2 POST request', function (done) {
            request(options, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
    });

    describe('When a concise entity is created', function () {
        beforeEach(function (done) {
            options.json = utils.readExampleFile('./test/ngsi-ld/Entity-concise.json');

            contextBrokerMock = nock(V2_BROKER)
                .post(ORION_ENDPOINT, utils.readExampleFile('./test/ngsi-v2/Entity.json'))
                .reply(201);

            done();
        });

        it('should forward an NGSI-v2 POST request', function (done) {
            request(options, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });

        it('should return success', function (done) {
            request(options, function (error, response, body) {
                response.statusCode.should.equal(201);
                done();
            });
        });
    });

    describe('When a normalized entity with a user context is created', function () {
        beforeEach(function (done) {
            options.json = utils.readExampleFile('./test/ngsi-ld/Entity-context.json');
            options.headers = {
                'content-type': 'application/ld+json'
            };
            contextBrokerMock = nock(V2_BROKER)
                .post(ORION_ENDPOINT, utils.readExampleFile('./test/ngsi-v2/Entity.json'))
                .reply(201);

            done();
        });

        afterEach(function (done) {
            delete options.headers;
            done();
        });
        it('should return success', function (done) {
            request(options, function (error, response, body) {
                response.statusCode.should.equal(201);
                done();
            });
        });

        it('should forward an NGSI-v2 POST request', function (done) {
            request(options, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
    });

    describe('When an entity is created on a tenant', function () {

        beforeEach(function (done) {
            options.json = utils.readExampleFile('./test/ngsi-ld/Entity.json');
            options.headers = {
                'NGSILD-Tenant': 'tenant'
            };
            contextBrokerMock = nock(V2_BROKER)
                .matchHeader("fiware-service", 'tenant')
                .post(ORION_ENDPOINT, utils.readExampleFile('./test/ngsi-v2/Entity.json'))
                .reply(201);

            done();
        });

        it('should forward an NGSI-v2 POST request with a header', function (done) {
            request(options, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
    });
});
