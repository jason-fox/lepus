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

describe('Update Entity', function () {
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

    describe('When a normalized entity is updated', function () {
        const options = {
            method: 'PATCH',
            url: LEPUS_URL + 'entities/urn:ngsi-ld:TemperatureSensor:001/attrs',
            json: utils.readExampleFile('./test/ngsi-ld/Entity-no-id.json')
        };

        beforeEach(function (done) {
            contextBrokerMock = nock(V2_BROKER)
                .patch(
                    '/v2/entities/urn:ngsi-ld:TemperatureSensor:001/attrs',
                    utils.readExampleFile('./test/ngsi-v2/Entity-no-id.json')
                )
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
});
