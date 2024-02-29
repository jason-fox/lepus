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

describe('Delete Single Entity Attribute', function () {
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
        method: 'DELETE'
    };

    describe('When an attribute is deleted by name', function () {
        beforeEach(function (done) {
            options.url = LEPUS_URL + 'entities/urn:ngsi-ld:TemperatureSensor:001/attrs/temperature';
            contextBrokerMock = nock(V2_BROKER)
                .delete('/v2/entities/urn:ngsi-ld:TemperatureSensor:001/attrs/temperature')
                .reply(204);

            done();
        });

        it('should forward an NGSI-v2 DELETE request', function (done) {
            request(options, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
        it('should return no content', function (done) {
            request(options, function (error, response, body) {
                response.statusCode.should.equal(204);
                done();
            });
        });
    });

    describe('When a property is deleted on a tenant', function () {
        beforeEach(function (done) {
            options.url = LEPUS_URL + 'entities/urn:ngsi-ld:TemperatureSensor:001/attrs/temperature';
            options.headers = {
                'NGSILD-Tenant': 'tenant'
            };
            contextBrokerMock = nock(V2_BROKER)
                .delete('/v2/entities/urn:ngsi-ld:TemperatureSensor:001/attrs/temperature')
                .matchHeader('fiware-service', 'tenant')
                .reply(204);

            done();
        });

        afterEach((done) => {
            delete options.headers;
            done();
        });

        it('should forward an NGSI-v2 DELETE request', function (done) {
            request(options, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
    });

    describe('When no entity is found', function () {
        beforeEach(function (done) {
            delete options.searchParams;
            contextBrokerMock = nock(V2_BROKER)
                .delete('/v2/entities/urn:ngsi-ld:TemperatureSensor:001/attrs/temperature')
                .reply(404, utils.readExampleFile('./test/ngsi-v2/Not-Found.json'));
            done();
        });

        it('should forward an NGSI-v2 DELETE request', function (done) {
            request(options, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });

        it('should return not found', function (done) {
            request(options, function (error, response, body) {
                body.should.eql(utils.readExampleFile('./test/ngsi-ld/Not-Found.json'));
                done();
            });
        });
    });
});
