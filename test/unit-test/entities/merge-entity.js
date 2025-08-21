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

describe('Merge Entity', function () {
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
        method: 'PATCH',
        url: LEPUS_URL + 'entities/urn:ngsi-ld:TemperatureSensor:001'
    };
    const ORION_ENTITY_ONLY = '/v2/entities/urn:ngsi-ld:TemperatureSensor:001';
    const ORION_ENDPOINT = '/v2/entities/urn:ngsi-ld:TemperatureSensor:001/attrs';

    describe('When a normalized entity is merged', function () {
        beforeEach(function (done) {
            options.json = utils.readExampleFile('./test/ngsi-ld/Entity-no-id.json');
            contextBrokerMock = nock(V2_BROKER)
                .get(ORION_ENTITY_ONLY)
                .reply(StatusCode.OK, utils.readExampleFile('./test/ngsi-v2/Entity-id-only.json'));

            contextBrokerMock.put(ORION_ENDPOINT, utils.readExampleFile('./test/ngsi-v2/Entity-attrs.json')).reply(StatusCode.OK);

            done();
        });
        it('should return success', function (done) {
            request(options, function (error, response, body) {
                response.statusCode.should.equal(StatusCode.OK);
                done();
            });
        });

        it('should forward requests to the v2 broker', function (done) {
            request(options, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
    });

    describe('When an entity is merged using urn:ngsi-ld:null ', function () {
        beforeEach(function (done) {
            options.json = utils.readExampleFile('./test/ngsi-ld/Entity-nulls.json');
            contextBrokerMock = nock(V2_BROKER)
                .get(ORION_ENTITY_ONLY)
                .reply(StatusCode.OK, utils.readExampleFile('./test/ngsi-v2/Entity-id-only.json'));

            contextBrokerMock
                .put(ORION_ENDPOINT, utils.readExampleFile('./test/ngsi-v2/Entity-merged-nulls.json'))
                .reply(StatusCode.OK);

            done();
        });
        it('should return success', function (done) {
            request(options, function (error, response, body) {
                response.statusCode.should.equal(StatusCode.OK);
                done();
            });
        });

        it('should forward requests to the v2 broker', function (done) {
            request(options, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
    });

    describe('When a concise entity is merged', function () {
        beforeEach(function (done) {
            options.json = utils.readExampleFile('./test/ngsi-ld/Entity-concise-no-id.json');
            contextBrokerMock = nock(V2_BROKER)
                .get(ORION_ENTITY_ONLY)
                .reply(StatusCode.OK, utils.readExampleFile('./test/ngsi-v2/Entity-id-only.json'));

            contextBrokerMock.put(ORION_ENDPOINT, utils.readExampleFile('./test/ngsi-v2/Entity-attrs.json')).reply(StatusCode.OK);

            done();
        });
        it('should return success', function (done) {
            request(options, function (error, response, body) {
                response.statusCode.should.equal(StatusCode.OK);
                done();
            });
        });

        it('should forward requests to the v2 broker', function (done) {
            request(options, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
    });

    describe('When a concise entity using keywords is merged', function () {
        beforeEach(function (done) {
            options.json = utils.readExampleFile('./test/ngsi-ld/keywords-concise-no-id.json');
            contextBrokerMock = nock(V2_BROKER)
                .get(ORION_ENTITY_ONLY)
                .reply(StatusCode.OK, utils.readExampleFile('./test/ngsi-v2/Entity-id-only.json'));

            contextBrokerMock
                .put(ORION_ENDPOINT, utils.readExampleFile('./test/ngsi-v2/keywords-attrs.json'))
                .reply(StatusCode.OK);

            done();
        });
        it('should return success', function (done) {
            request(options, function (error, response, body) {
                response.statusCode.should.equal(StatusCode.OK);
                done();
            });
        });

        it('should forward requests to the v2 broker', function (done) {
            request(options, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
    });

    describe('When an merged entity is not found', function () {
        beforeEach(function (done) {
            contextBrokerMock = nock(V2_BROKER)
                .get(ORION_ENTITY_ONLY)
                .reply(404, utils.readExampleFile('./test/ngsi-v2/Not-Found.json'));

            done();
        });
        it('should return not found', function (done) {
            request(options, function (error, response, body) {
                response.statusCode.should.equal(404);
                body.should.eql(utils.readExampleFile('./test/ngsi-ld/Not-Found-Entity.json'));
                done();
            });
        });
    });
});
