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

describe('Create Entity Attribute(s)', function () {
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
        url: LEPUS_URL + 'entities/urn:ngsi-ld:TemperatureSensor:001/attrs'
    };

    describe('When a normalized property is created by name', function () {
        beforeEach(function (done) {
            options.json = {
                temperature: utils.readExampleFile('./test/ngsi-ld/Property.json')
            };
            contextBrokerMock = nock(V2_BROKER)
                .post('/v2/entities/urn:ngsi-ld:TemperatureSensor:001/attrs', {
                    temperature: utils.readExampleFile('./test/ngsi-v2/Property.json')
                })
                .reply(201);

            done();
        });

        it('should forward an NGSI-v2 POST request', function (done) {
            request(options, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
        it('should return created', function (done) {
            request(options, function (error, response, body) {
                response.statusCode.should.equal(201);
                done();
            });
        });
    });

    describe('When a concise property is created by name', function () {
        beforeEach(function (done) {
            options.json = {
                temperature: utils.readExampleFile('./test/ngsi-ld/Property-concise.json')
            };
            contextBrokerMock = nock(V2_BROKER)
                .post('/v2/entities/urn:ngsi-ld:TemperatureSensor:001/attrs', {
                    temperature: utils.readExampleFile('./test/ngsi-v2/Property.json')
                })
                .reply(201);

            done();
        });

        it('should forward an NGSI-v2 POST request', function (done) {
            request(options, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
        it('should return created', function (done) {
            request(options, function (error, response, body) {
                response.statusCode.should.equal(201);
                done();
            });
        });
    });

    describe('When a normalized relationship is created by name', function () {
        beforeEach(function (done) {
            options.json = {
                controlledAsset: utils.readExampleFile('./test/ngsi-ld/Relationship.json')
            };
            contextBrokerMock = nock(V2_BROKER)
                .post('/v2/entities/urn:ngsi-ld:TemperatureSensor:001/attrs', {
                    controlledAsset: utils.readExampleFile('./test/ngsi-v2/Relationship.json')
                })
                .reply(201);

            done();
        });

        it('should forward an NGSI-v2 POST request', function (done) {
            request(options, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
        it('should return created', function (done) {
            request(options, function (error, response, body) {
                response.statusCode.should.equal(201);
                done();
            });
        });
    });

    describe('When a concise relationship is created by name', function () {
        beforeEach(function (done) {
            options.json = {
                controlledAsset: utils.readExampleFile('./test/ngsi-ld/Relationship-concise.json')
            };
            contextBrokerMock = nock(V2_BROKER)
                .post('/v2/entities/urn:ngsi-ld:TemperatureSensor:001/attrs', {
                    controlledAsset: utils.readExampleFile('./test/ngsi-v2/Relationship.json')
                })
                .reply(201);

            done();
        });

        it('should forward an NGSI-v2 POST request', function (done) {
            request(options, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
        it('should return created', function (done) {
            request(options, function (error, response, body) {
                response.statusCode.should.equal(201);
                done();
            });
        });
    });

    describe('When a property already found', function () {
        beforeEach(function (done) {
            options.json = {
                temperature: utils.readExampleFile('./test/ngsi-ld/Property.json')
            };
            contextBrokerMock = nock(V2_BROKER)
                .post('/v2/entities/urn:ngsi-ld:TemperatureSensor:001/attrs')
                .reply(409, utils.readExampleFile('./test/ngsi-v2/Not-Found.json'));
            done();
        });

        it('should return conflict', function (done) {
            request(options, function (error, response, body) {
                response.statusCode.should.equal(409);
                done();
            });
        });
    });

    describe('When a property is created on a tenant', function () {
        beforeEach(function (done) {
            options.json = {
                temperature: utils.readExampleFile('./test/ngsi-ld/Property.json')
            };
            options.headers = {
                'NGSILD-Tenant': 'tenant'
            };
            contextBrokerMock = nock(V2_BROKER)
                .post('/v2/entities/urn:ngsi-ld:TemperatureSensor:001/attrs', {
                    temperature: utils.readExampleFile('./test/ngsi-v2/Property.json')
                })
                .matchHeader('fiware-service', 'tenant')
                .reply(201);

            done();
        });

        afterEach(function (done) {
            delete options.headers;
            done();
        });

        it('should forward an NGSI-v2 POST request', function (done) {
            request(options, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
    });
});
