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

describe('Purge Entities Tests', function () {
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
        method: 'DELETE',
        url: LEPUS_URL + 'entities'
    };

    describe('When entities are purged by type', function () {
        beforeEach(function (done) {
            options.searchParams = 'type=TemperatureSensor';
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities?type=TemperatureSensor')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/Entities.json'));

            contextBrokerMock
                .post('/v2/op/update/', utils.readExampleFile('./test/ngsi-v2/Batch-Delete-Entities.json'))
                .reply(200);

            done();
        });

        it('should forward requests to the v2 broker', function (done) {
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
    });

    describe('When entities are purged and attributes picked', function () {
        beforeEach(function (done) {
            options.searchParams = 'q=temperature==100&pick=temperature';
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities?q=temperature==100')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/Entities.json'));

            contextBrokerMock
                .post('/v2/op/update/', utils.readExampleFile('./test/ngsi-v2/Batch-Replace-Entities-picked.json'))
                .reply(200);
            done();
        });

        it('should forward requests to the v2 broker', function (done) {
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
    });
});
