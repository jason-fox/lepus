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

let contextBrokerMock;

describe('Query Entities Tests', function () {
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
                const expected = utils.readExampleFile('./test/ngsi-ld/Entities.json');
                done(_.isEqual(body, expected) ? '' : 'Incorrect payload');
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
                const expected = utils.readExampleFile('./test/ngsi-ld/Entities.json');
                done(_.isEqual(body, expected) ? '' : 'Incorrect payload');
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
                const expected = utils.readExampleFile('./test/ngsi-ld/Entities-picked.json');
                done(_.isEqual(body, expected) ? '' : 'Incorrect payload');
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
                const expected = utils.readExampleFile('./test/ngsi-ld/Entities-omitted.json');
                done(_.isEqual(body, expected) ? '' : 'Incorrect payload');
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
                const expected = utils.readExampleFile('./test/ngsi-ld/Entities-concise.json');
                done(_.isEqual(body, expected) ? '' : 'Incorrect payload');
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
                const expected = utils.readExampleFile('./test/ngsi-ld/Entities-keyValues.json');
                done(_.isEqual(body, expected) ? '' : 'Incorrect payload');
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
                done(_.isEqual(body, []) ? '' : 'Incorrect payload');
            });
        });
    });

    describe('When normalized entities and user context is requested', function () {
        beforeEach(function (done) {
            options.searchParams = 'type=TemperatureSensor&options';
            (options.headers = {
                accept: 'application/ld+json'
            }),
                (contextBrokerMock = nock(V2_BROKER)
                    .get('/v2/entities?type=TemperatureSensor')
                    .reply(200, utils.readExampleFile('./test/ngsi-v2/Entities.json')));

            done();
        });

        afterEach(function (done) {
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
                const expected = utils.readExampleFile('./test/ngsi-ld/Entities-context.json');
                done(_.isEqual(body, expected) ? '' : 'Incorrect payload');
            });
        });
    });
});
