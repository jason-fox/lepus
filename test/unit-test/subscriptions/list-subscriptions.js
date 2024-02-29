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

describe('List Subscriptions', function () {
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
        url: LEPUS_URL + 'subscriptions/'
    };

    const ORION_ENDPOINT = '/v2/subscriptions';

    describe('When a subscriptions are read', function () {
        beforeEach(function (done) {
            contextBrokerMock = nock(V2_BROKER)
                .get(ORION_ENDPOINT)
                .reply(200, utils.readExampleFile('./test/ngsi-v2/Subscriptions.json'));

            done();
        });
        it('should return success', function (done) {
            request(options, function (error, response, body) {
                response.statusCode.should.equal(200);
                done();
            });
        });

        it('should forward an NGSI-v2 GET request', function (done) {
            request(options, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
        it('should return an NGSI-LD payload', function (done) {
            request(options, function (error, response, body) {
                body.should.eql(utils.readExampleFile('./test/ngsi-ld/Subscriptions.json'));
                done();
            });
        });
    });

    describe('When a subscriptions are read on a tenant', function () {
        beforeEach(function (done) {
            options.headers = {
                'NGSILD-Tenant': 'tenant'
            };
            contextBrokerMock = nock(V2_BROKER)
                .matchHeader('fiware-service', 'tenant')
                .get(ORION_ENDPOINT)
                .reply(200, utils.readExampleFile('./test/ngsi-v2/Subscriptions.json'));
            done();
        });

        afterEach((done) => {
            delete options.headers;
            done();
        });

        it('should forward an NGSI-v2 GET request with a header', function (done) {
            request(options, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
    });
});
