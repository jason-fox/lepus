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
const LEPUS_URL = 'http://localhost:3000/ngsi-ld/v1/';
const V2_BROKER = 'http://orion:1026';

let contextBrokerMock;

describe('Query Entities Tests', function () {
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
        method: 'GET',
        url: LEPUS_URL + 'entities'
    };

    describe('When normalized entities are read by type', function () {
        beforeEach(function (done) {
            options.searchParams = 'type=TemperatureSensor';
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities?type=TemperatureSensor')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/Entities.json'));

            done();
        });

        it('should forward an NGSI-v2 GET request', function (done) {
            request(options, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });

        it('should return success', function (done) {
            request(options, function (error, response, body) {
                response.statusCode.should.equal(200);
                done();
            });
        });

        it('should return an NGSI-LD payload', function (done) {
            request(options, function (error, response, body) {
                body.should.eql(utils.readExampleFile('./test/ngsi-ld/Entities.json'));
                done();
            });
        });
    });

    describe('When normalized entities are read by query', function () {
        beforeEach(function (done) {
            options.searchParams = 'q=temperature==100';
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities?q=temperature==100')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/Entities.json'));

            done();
        });

        it('should forward an NGSI-v2 GET request', function (done) {
            request(options, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });

        it('should return success', function (done) {
            request(options, function (error, response, body) {
                response.statusCode.should.equal(200);
                done();
            });
        });

        it('should return an NGSI-LD payload', function (done) {
            request(options, function (error, response, body) {
                body.should.eql(utils.readExampleFile('./test/ngsi-ld/Entities.json'));
                done();
            });
        });
    });

    describe('When normalized entities are queried and attributes picked', function () {
        beforeEach(function (done) {
            options.searchParams = 'q=temperature==100&pick=id,type,temperature';
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities?q=temperature==100')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/Entities.json'));

            done();
        });

        it('should forward an NGSI-v2 GET request', function (done) {
            request(options, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });

        it('should return success', function (done) {
            request(options, function (error, response, body) {
                response.statusCode.should.equal(200);
                done();
            });
        });

        it('should return an NGSI-LD payload', function (done) {
            request(options, function (error, response, body) {
                body.should.eql(utils.readExampleFile('./test/ngsi-ld/Entities-picked.json'));
                done();
            });
        });
    });

    describe('When normalized entities are queried and attributes omitted', function () {
        beforeEach(function (done) {
            options.searchParams = 'q=temperature==100&omit=id,type,temperature';
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities?q=temperature==100')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/Entities.json'));

            done();
        });

        it('should forward an NGSI-v2 GET request', function (done) {
            request(options, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });

        it('should return success', function (done) {
            request(options, function (error, response, body) {
                response.statusCode.should.equal(200);
                done();
            });
        });

        it('should return an NGSI-LD payload', function (done) {
            request(options, function (error, response, body) {
                body.should.eql(utils.readExampleFile('./test/ngsi-ld/Entities-omitted.json'));
                done();
            });
        });
    });

    describe('When concise entities are read by type', function () {
        beforeEach(function (done) {
            options.searchParams = 'type=TemperatureSensor&options=concise';
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities?type=TemperatureSensor')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/Entities.json'));

            done();
        });

        it('should forward an NGSI-v2 GET request', function (done) {
            request(options, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });

        it('should return success', function (done) {
            request(options, function (error, response, body) {
                response.statusCode.should.equal(200);
                done();
            });
        });

        it('should return an NGSI-LD payload', function (done) {
            request(options, function (error, response, body) {
                body.should.eql(utils.readExampleFile('./test/ngsi-ld/Entities-concise.json'));
                done();
            });
        });
    });

    describe('When keyValues entities are read by type', function () {
        beforeEach(function (done) {
            options.searchParams = 'type=TemperatureSensor&options=keyValues';
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities?type=TemperatureSensor&options=keyValues')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/Entities-keyValues.json'));

            done();
        });

        it('should forward an NGSI-v2 GET request', function (done) {
            request(options, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });

        it('should return success', function (done) {
            request(options, function (error, response, body) {
                response.statusCode.should.equal(200);
                done();
            });
        });

        it('should return a keyValues payload', function (done) {
            request(options, function (error, response, body) {
                body.should.eql(utils.readExampleFile('./test/ngsi-ld/Entities-keyValues.json'));
                done();
            });
        });
    });

    describe('When no entities are returned', function () {
        beforeEach(function (done) {
            options.searchParams = 'type=TemperatureSensor';
            contextBrokerMock = nock(V2_BROKER).get('/v2/entities?type=TemperatureSensor').reply(200, []);

            done();
        });

        it('should forward an NGSI-v2 GET request', function (done) {
            request(options, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });

        it('should return success', function (done) {
            request(options, function (error, response, body) {
                response.statusCode.should.equal(200);
                done();
            });
        });

        it('should return an NGSI-LD payload', function (done) {
            request(options, function (error, response, body) {
                body.should.eql([]);
                done();
            });
        });
    });

    describe('When normalized entities and user context is requested', function () {
        beforeEach(function (done) {
            options.searchParams = 'type=TemperatureSensor&options';
            options.headers = {
                accept: 'application/ld+json'
            };
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities?type=TemperatureSensor')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/Entities.json'));

            done();
        });

        afterEach((done) => {
            delete options.headers;
            done();
        });

        it('should forward an NGSI-v2 GET request', function (done) {
            request(options, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });

        it('should return success', function (done) {
            request(options, function (error, response, body) {
                response.statusCode.should.equal(200);
                done();
            });
        });

        it('should return an NGSI-LD payload with @context', function (done) {
            request(options, function (error, response, body) {
                body.should.eql(utils.readExampleFile('./test/ngsi-ld/Entities-context.json'));
                done();
            });
        });
    });
    describe('When entities are read on a tenant', function () {
        beforeEach(function (done) {
            options.searchParams = 'type=TemperatureSensor';
            options.headers = {
                'NGSILD-Tenant': 'tenant'
            };
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities?type=TemperatureSensor')
                .matchHeader('fiware-service', 'tenant')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/Entities.json'));

            done();
        });

        afterEach((done) => {
            delete options.headers;
            done();
        });

        it('should forward an NGSI-v2 GET request', function (done) {
            request(options, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
    });

    describe('When normalized entities are read by id', function () {
        beforeEach(function (done) {
            options.searchParams =
                'id=urn:ngsi-ld:TemperatureSensor:001,urn:ngsi-ld:TemperatureSensor:002,urn:ngsi-ld:TemperatureSensor:003';
            contextBrokerMock = nock(V2_BROKER)
                .get(
                    '/v2/entities?id=urn:ngsi-ld:TemperatureSensor:001,urn:ngsi-ld:TemperatureSensor:002,urn:ngsi-ld:TemperatureSensor:003'
                )
                .reply(200, utils.readExampleFile('./test/ngsi-v2/Entities.json'));

            done();
        });

        it('should forward an NGSI-v2 GET request', function (done) {
            request(options, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
    });
});
