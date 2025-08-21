/*
 * Copyright 2023 -  FIWARE Foundation e.V.
 *
 * This file is part of NGSI-LD to NGSI-v2 Adapter
 *
 */

/* eslint-disable no-unused-vars */

const lepus = require('../../../lib/lepus');
const config = require('../../config-test');
const nock = require('nock');
const should = require('should');
const utils = require('../../utils');
const request = utils.request;
const StatusCode = require('http-status-codes').StatusCodes;
const LEPUS_URL = 'http://localhost:3000/ngsi-ld/v1/';
const V2_BROKER = 'http://orion:1026';

let contextBrokerMock;

describe('Create Entity', function () {
    beforeEach((done) => {
        nock.cleanAll();
        lepus.start(config, () => {
            done();
        });
    });

    afterEach((done) => {
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
                .reply(StatusCode.CREATED);

            done();
        });
        it('should return success', function (done) {
            request(options, function (error, response, body) {
                response.statusCode.should.equal(StatusCode.CREATED);
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
                .reply(StatusCode.CREATED);

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
                .reply(StatusCode.CREATED);

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
                .reply(StatusCode.CREATED);

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
                response.statusCode.should.equal(StatusCode.CREATED);
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
                .reply(StatusCode.CREATED);

            done();
        });

        afterEach((done) => {
            delete options.headers;
            done();
        });
        it('should return success', function (done) {
            request(options, function (error, response, body) {
                response.statusCode.should.equal(StatusCode.CREATED);
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
                .matchHeader('fiware-service', 'tenant')
                .post(ORION_ENDPOINT, utils.readExampleFile('./test/ngsi-v2/Entity.json'))
                .reply(StatusCode.CREATED);

            done();
        });

        afterEach((done) => {
            delete options.headers;
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

describe('Create Entity with valueType', function () {
    beforeEach((done) => {
        nock.cleanAll();
        config.coreContext = 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.9.jsonld';
        lepus.start(config, () => {
            done();
        });
    });

    afterEach((done) => {
        config.coreContext = 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.8.jsonld';
        lepus.stop(function () {
            done();
        });
    });

    const options = {
        method: 'POST',
        url: LEPUS_URL + 'entities'
    };
    const ORION_ENDPOINT = '/v2/entities';

    describe('When a normalized entity with valueType is created', function () {
        beforeEach(function (done) {
            options.json = utils.readExampleFile('./test/ngsi-ld/Entity-valueType.json');
            contextBrokerMock = nock(V2_BROKER)
                .post(ORION_ENDPOINT, utils.readExampleFile('./test/ngsi-v2/Entity-valueType.json'))
                .reply(StatusCode.CREATED);

            done();
        });
        it('should return success', function (done) {
            request(options, function (error, response, body) {
                response.statusCode.should.equal(StatusCode.CREATED);
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

    describe('When a concise entity with valueType is created', function () {
        beforeEach(function (done) {
            options.json = utils.readExampleFile('./test/ngsi-ld/Entity-valueType-concise.json');
            contextBrokerMock = nock(V2_BROKER)
                .post(ORION_ENDPOINT, utils.readExampleFile('./test/ngsi-v2/Entity-valueType.json'))
                .reply(StatusCode.CREATED);

            done();
        });
        it('should return success', function (done) {
            request(options, function (error, response, body) {
                response.statusCode.should.equal(StatusCode.CREATED);
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
});

describe('Create Entity with expiresAt', function () {
    beforeEach((done) => {
        nock.cleanAll();
        config.coreContext = 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.9.jsonld';
        lepus.start(config, () => {
            done();
        });
    });

    afterEach((done) => {
        config.coreContext = 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.8.jsonld';
        lepus.stop(function () {
            done();
        });
    });

    const options = {
        method: 'POST',
        url: LEPUS_URL + 'entities'
    };
    const ORION_ENDPOINT = '/v2/entities';

    describe('When a normalized entity with expiresAt is created', function () {
        beforeEach(function (done) {
            options.json = utils.readExampleFile('./test/ngsi-ld/Entity-expiresAt.json');
            contextBrokerMock = nock(V2_BROKER)
                .post(ORION_ENDPOINT, utils.readExampleFile('./test/ngsi-v2/Entity-expiresAt.json'))
                .reply(StatusCode.CREATED);

            done();
        });
        it('should return success', function (done) {
            request(options, function (error, response, body) {
                response.statusCode.should.equal(StatusCode.CREATED);
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

    describe('When a concise entity with expiresAt is created', function () {
        beforeEach(function (done) {
            options.json = utils.readExampleFile('./test/ngsi-ld/Entity-expiresAt-concise.json');
            contextBrokerMock = nock(V2_BROKER)
                .post(ORION_ENDPOINT, utils.readExampleFile('./test/ngsi-v2/Entity-expiresAt.json'))
                .reply(StatusCode.CREATED);

            done();
        });
        it('should return success', function (done) {
            request(options, function (error, response, body) {
                response.statusCode.should.equal(StatusCode.CREATED);
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
});
