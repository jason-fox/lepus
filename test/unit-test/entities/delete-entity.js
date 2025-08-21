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

describe('Delete Entity', function () {
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
        method: 'DELETE',
        url: LEPUS_URL + 'entities/urn:ngsi-ld:TemperatureSensor:001'
    };
    const ORION_ENDPOINT = '/v2/entities/urn:ngsi-ld:TemperatureSensor:001';

    describe('When an entity is deleted', function () {
        beforeEach(function (done) {
            contextBrokerMock = nock(V2_BROKER).delete(ORION_ENDPOINT).reply(StatusCode.NO_CONTENT);

            done();
        });
        it('should return no content', function (done) {
            request(options, function (error, response, body) {
                response.statusCode.should.equal(StatusCode.NO_CONTENT);
                done();
            });
        });

        it('should forward an NGSI-v2 DELETE request', function (done) {
            request(options, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
    });

    describe('When an deleted entity is not found', function () {
        beforeEach(function (done) {
            contextBrokerMock = nock(V2_BROKER)
                .delete(ORION_ENDPOINT)
                .reply(StatusCode.NOT_FOUND, utils.readExampleFile('./test/ngsi-v2/Not-Found.json'));

            done();
        });
        it('should return not found', function (done) {
            request(options, function (error, response, body) {
                response.statusCode.should.equal(StatusCode.NOT_FOUND);
                body.should.eql(utils.readExampleFile('./test/ngsi-ld/Not-Found.json'));
                done();
            });
        });
    });
});
