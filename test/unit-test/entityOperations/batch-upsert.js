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

describe('Batch Upsert Entities', function () {
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
        url: LEPUS_URL + 'entityOperations/upsert'
    };
    const ORION_ENDPOINT = '/v2/op/update/';

    describe('When multiple normalized entities are upserted', function () {
        beforeEach(function (done) {
            options.json = utils.readExampleFile('./test/ngsi-ld/Batch-Upsert-Entities.json');
            contextBrokerMock = nock(V2_BROKER)
                .post(ORION_ENDPOINT, utils.readExampleFile('./test/ngsi-v2/Batch-Upsert-Entities.json'))
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

    /*
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
    });*/
});
