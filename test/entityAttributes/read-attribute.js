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
const SINGLE_PROPERTY = 'entities/urn:ngsi-ld:TemperatureSensor:001/attrs/temperature';
const SINGLE_RELATIONSHIP = 'entities/urn:ngsi-ld:TemperatureSensor:001/attrs/controlledAsset';
const _ = require('lodash');
const timekeeper = require('timekeeper');

let contextBrokerMock;

describe('Read Entity Attribute', function () {
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
        method: 'GET'
    };

    describe('When a normalized property is read by name', function () {
        beforeEach(function (done) {
            options.url = LEPUS_URL + SINGLE_PROPERTY;
            delete options.searchParams;
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities/urn:ngsi-ld:TemperatureSensor:001/attrs/temperature')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/Property.json'));

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

        it('should return an NGSI-LD Property', function (done) {
            request(options, function (error, response, body) {
                const expected = utils.readExampleFile('./test/ngsi-ld/Property.json');
                done(_.isEqual(body, expected) ? '' : 'Incorrect payload');
            });
        });
    });

    describe('When a concise property is read by name', function () {
        beforeEach(function (done) {
            options.url = LEPUS_URL + SINGLE_PROPERTY;
            options.searchParams = 'options=concise';
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities/urn:ngsi-ld:TemperatureSensor:001/attrs/temperature')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/Property.json'));

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

        it('should return an NGSI-LD Property', function (done) {
            request(options, function (error, response, body) {
                const expected = utils.readExampleFile('./test/ngsi-ld/Property-concise.json');
                done(_.isEqual(body, expected) ? '' : 'Incorrect payload');
            });
        });
    });

    describe('When a normalized relationship is read by name', function () {
        beforeEach(function (done) {
            options.url = LEPUS_URL + SINGLE_RELATIONSHIP;
            delete options.searchParams;
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities/urn:ngsi-ld:TemperatureSensor:001/attrs/controlledAsset')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/Relationship.json'));

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

        it('should return an NGSI-LD Relationship', function (done) {
            request(options, function (error, response, body) {
                const expected = utils.readExampleFile('./test/ngsi-ld/Relationship.json');
                done(_.isEqual(body, expected) ? '' : 'Incorrect payload');
            });
        });
    });

    describe('When a concise relationship is read by name', function () {
        beforeEach(function (done) {
            options.url = LEPUS_URL + SINGLE_RELATIONSHIP;
            options.searchParams = 'options=concise';
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities/urn:ngsi-ld:TemperatureSensor:001/attrs/controlledAsset')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/Relationship.json'));

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

        it('should return an NGSI-LD Relationship', function (done) {
            request(options, function (error, response, body) {
                const expected = utils.readExampleFile('./test/ngsi-ld/Relationship-concise.json');
                done(_.isEqual(body, expected) ? '' : 'Incorrect payload');
            });
        });
    });

    describe('When no property is found', function () {
        beforeEach(function (done) {
            options.url = LEPUS_URL + SINGLE_PROPERTY;
            delete options.searchParams;
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities/urn:ngsi-ld:TemperatureSensor:001/attrs/temperature')
                .reply(404, utils.readExampleFile('./test/ngsi-v2/Not-Found.json'));
            done();
        });

        it('should forward an NGSI-v2 GET request', function (done) {
            request(options, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });

        it('should return not found', function (done) {
            request(options, function (error, response, body) {
                const expected = utils.readExampleFile('./test/ngsi-ld/Not-Found.json');
                done(_.isEqual(body, expected) ? '' : 'Incorrect payload');
            });
        });
    });

    describe('When a property is read on a tenant', function () {
        beforeEach(function (done) {
            options.url = LEPUS_URL + SINGLE_PROPERTY;
            delete options.searchParams;
            options.headers = {
                'NGSILD-Tenant': 'tenant'
            };
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities/urn:ngsi-ld:TemperatureSensor:001/attrs/temperature')
                .matchHeader('fiware-service', 'tenant')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/Property.json'));

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
    });
});
