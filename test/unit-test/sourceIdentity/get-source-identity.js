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
const SOURCE_INFO = 'info/sourceIdentity';
const timekeeper = require('timekeeper');

let contextBrokerMock;

describe('Read SourceIdentity', function () {
    beforeEach((done) => {
        nock.cleanAll();
        const time = new Date(1708729200); // 2024-02-23T16:18:07+0000
        timekeeper.freeze(time);
        lepus.start(config, () => {
            done();
        });
    });

    afterEach((done) => {
        timekeeper.reset();
        lepus.stop(function () {
            done();
        });
    });

    const options = {
        method: 'GET'
    };

    describe('When sourceInfo is read', function () {
        beforeEach(function (done) {
            options.url = LEPUS_URL + SOURCE_INFO;
            delete options.searchParams;
            contextBrokerMock = nock(V2_BROKER)
                .get('/version')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/Identity.json'));

            done();
        });

        it('should forward an NGSI-v2 GET request', function (done) {
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

        it('should return an NGSI-LD SourceIdentity', function (done) {
            request(options, function (error, response, body) {
                body.id = 'urn:ngsi-ld:ContextSourceIdentity:xxx';
                body.should.eql(utils.readExampleFile('./test/ngsi-ld/Identity.json'));
                done();
            });
        });
    });

    describe('When sourceInfo is read on a tenant', function () {
        beforeEach(function (done) {
            options.url = LEPUS_URL + SOURCE_INFO;
            delete options.searchParams;
            options.headers = {
                'NGSILD-Tenant': 'tenant'
            };
            contextBrokerMock = nock(V2_BROKER)
                .get('/version')
                .matchHeader('fiware-service', 'tenant')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/Identity.json'));

            done();
        });

        afterEach((done) => {
            delete options.headers;
            done();
        });

        it('should forward an NGSI-v2 GET request', function (done) {
            request(options, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
    });

    describe('When sourceInfo is read and context requested', function () {
        beforeEach(function (done) {
            options.url = LEPUS_URL + SOURCE_INFO;
            delete options.searchParams;
            options.headers = {
                Accept: 'application/ld+json'
            };
            contextBrokerMock = nock(V2_BROKER)
                .get('/version')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/Identity.json'));

            done();
        });

        afterEach((done) => {
            delete options.headers;
            done();
        });

        it('should forward an NGSI-v2 GET request', function (done) {
            request(options, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });

        it('should return an NGSI-LD SourceIdentity', function (done) {
            request(options, function (error, response, body) {
                body.id = 'urn:ngsi-ld:ContextSourceIdentity:xxx';
                body.should.eql(utils.readExampleFile('./test/ngsi-ld/Identity-context.json'));
                done();
            });
        });
    });
});
