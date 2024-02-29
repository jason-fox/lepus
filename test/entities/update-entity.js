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
const utils = require('../utils');
const request = utils.request;
const LEPUS_URL = 'http://localhost:3000/ngsi-ld/v1/';
const V2_BROKER = 'http://orion:1026';
const SINGLE_ENTITY = 'entities/urn:ngsi-ld:TemperatureSensor:001';

let contextBrokerMock;

describe('Update Entity', function () {
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
        url: LEPUS_URL + SINGLE_ENTITY + '/attrs'
    };

    const ORION_ENDPOINT = '/v2/entities/urn:ngsi-ld:TemperatureSensor:001/attrs';

    describe('When a normalized entity is updated', function () {
        beforeEach(function (done) {
            options.json = utils.readExampleFile('./test/ngsi-ld/Entity-no-id.json');
            contextBrokerMock = nock(V2_BROKER)
                .patch(ORION_ENDPOINT, utils.readExampleFile('./test/ngsi-v2/Entity-no-id.json'))
                .reply(200);

            done();
        });
        it('should return success', function (done) {
            request(options, function (error, response, body) {
                response.statusCode.should.equal(200);
                done();
            });
        });

        it('should forward an NGSI-v2 PATCH request', function (done) {
            request(options, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
    });

    describe('When a concise entity is updated', function () {
        beforeEach(function (done) {
            options.json = utils.readExampleFile('./test/ngsi-ld/Entity-no-id.json');
            contextBrokerMock = nock(V2_BROKER)
                .patch(ORION_ENDPOINT, utils.readExampleFile('./test/ngsi-v2/Entity-no-id.json'))
                .reply(200);

            done();
        });
        it('should return success', function (done) {
            request(options, function (error, response, body) {
                response.statusCode.should.equal(200);
                done();
            });
        });

        it('should forward an NGSI-v2 PATCH request', function (done) {
            request(options, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
    });

    describe('When an updated entity is not found', function () {
        beforeEach(function (done) {
            contextBrokerMock = nock(V2_BROKER)
                .patch(ORION_ENDPOINT, utils.readExampleFile('./test/ngsi-v2/Entity-no-id.json'))
                .reply(404, utils.readExampleFile('./test/ngsi-v2/Not-Found.json'));

            done();
        });
        it('should return not found', function (done) {
            request(options, function (error, response, body) {
                response.statusCode.should.equal(404);
                body.should.eql(utils.readExampleFile('./test/ngsi-ld/Not-Found.json'));
                done();
            });
        });
    });
});
