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

describe('Create Entity Attribute(s)', function () {
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
                .reply(StatusCode.CREATED);

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
                response.statusCode.should.equal(StatusCode.CREATED);
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
                .reply(StatusCode.CREATED);

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
                response.statusCode.should.equal(StatusCode.CREATED);
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
                .reply(StatusCode.CREATED);

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
                response.statusCode.should.equal(StatusCode.CREATED);
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
                .reply(StatusCode.CREATED);

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
                response.statusCode.should.equal(StatusCode.CREATED);
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
                .reply(StatusCode.CREATED);

            done();
        });

        afterEach((done) => {
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
