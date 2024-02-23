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
const SINGLE_ENTITY = 'entities/urn:ngsi-ld:TemperatureSensor:001';
const _ = require('lodash');
const timekeeper = require('timekeeper');

let contextBrokerMock;

describe('Read Entity', function () {
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

    describe('When a normalized entity is read by id', function () {
        const options = {
            method: 'GET',
            url: LEPUS_URL + SINGLE_ENTITY
        };

        beforeEach(function (done) {
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities/urn:ngsi-ld:TemperatureSensor:001')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/TemperatureSensor:001.json'));

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

        it('should return an NGSI-LD payload', function (done) {
            request(options, function (error, response, body) {
                const expected = utils.readExampleFile('./test/ngsi-ld/TemperatureSensor:001.json');
                done(_.isEqual(body, expected) ? '' : 'Incorrect payload');
            });
        });
    });

    describe('When a concise entity is read by id', function () {
        const options = {
            method: 'GET',
            searchParams: 'options=concise',
            url: LEPUS_URL + SINGLE_ENTITY
        };

        beforeEach(function (done) {
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities/urn:ngsi-ld:TemperatureSensor:001')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/TemperatureSensor:001.json'));

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

        it('should return an NGSI-LD payload', function (done) {
            request(options, function (error, response, body) {
                const expected = utils.readExampleFile('./test/ngsi-ld/TemperatureSensor:001-concise.json');
                done(_.isEqual(body, expected) ? '' : 'Incorrect payload');
            });
        });
    });

    describe('When a keyValues entity is read by id', function () {
        const options = {
            method: 'GET',
            searchParams: 'options=keyValues',
            url: LEPUS_URL + SINGLE_ENTITY
        };

        beforeEach(function (done) {
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities/urn:ngsi-ld:TemperatureSensor:001?options=keyValues')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/TemperatureSensor:001-keyValues.json'));

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

        it('should return a keyValues payload', function (done) {
            request(options, function (error, response, body) {
                const expected = utils.readExampleFile('./test/ngsi-ld/TemperatureSensor:001-keyValues.json');
                done(_.isEqual(body, expected) ? '' : 'Incorrect payload');
            });
        });
    });

    describe('When an Entity with attrs is read by id', function () {
        const options = {
            method: 'GET',
            searchParams: 'attrs=category,temperature',
            url: LEPUS_URL + SINGLE_ENTITY
        };

        beforeEach(function (done) {
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities/urn:ngsi-ld:TemperatureSensor:001?attrs=category,temperature')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/TemperatureSensor:001.json'));

            done();
        });

        it('should forward an NGSI-v2 GET request with attrs', function (done) {
            request(options, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
    });

    describe('When an Entity with pick is read by id', function () {
        const options = {
            method: 'GET',
            searchParams: 'pick=category,temperature',
            url: LEPUS_URL + SINGLE_ENTITY
        };

        beforeEach(function (done) {
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities/urn:ngsi-ld:TemperatureSensor:001')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/TemperatureSensor:001.json'));

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

        it('should return picked attrs only', function (done) {
            request(options, function (error, response, body) {
                const expected = utils.readExampleFile('./test/ngsi-ld/TemperatureSensor:001-pick.json');
                done(_.isEqual(body, expected) ? '' : 'Incorrect payload');
            });
        });
    });

    describe('When an Entity with omit is read by id', function () {
        const options = {
            method: 'GET',
            searchParams: 'omit=category,temperature',
            url: LEPUS_URL + SINGLE_ENTITY
        };

        beforeEach(function (done) {
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities/urn:ngsi-ld:TemperatureSensor:001')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/TemperatureSensor:001.json'));

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

        it('should return without omitted attrs', function (done) {
            request(options, function (error, response, body) {
                const expected = utils.readExampleFile('./test/ngsi-ld/TemperatureSensor:001-omit.json');
                done(_.isEqual(body, expected) ? '' : 'Incorrect payload');
            });
        });
    });

    describe('When an Entity with sysAttrs is read by id', function () {
        const options = {
            method: 'GET',
            searchParams: 'options=sysAttrs',
            url: LEPUS_URL + SINGLE_ENTITY
        };

        beforeEach(function (done) {
            const time = new Date(1708729200); // 2024-02-23T16:18:07+0000

            timekeeper.freeze(time);
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities/urn:ngsi-ld:TemperatureSensor:001?metadata=dateCreated,dateModified,*')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/TemperatureSensor:001-sysAttrs.json'));

            done();
        });

        afterEach(function (done) {
            timekeeper.reset();
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

        it('should return without omitted attrs', function (done) {
            request(options, function (error, response, body) {
                const expected = utils.readExampleFile('./test/ngsi-ld/TemperatureSensor:001-sysAttrs.json');
                done(_.isEqual(body, expected) ? '' : 'Incorrect payload');
            });
        });
    });

    describe('When no entity is found', function () {
        const options = {
            method: 'GET',
            url: LEPUS_URL + SINGLE_ENTITY
        };

        beforeEach(function (done) {
            contextBrokerMock = nock(V2_BROKER).get('/v2/entities/urn:ngsi-ld:TemperatureSensor:001').reply(404);

            done();
        });

        it('should forward an NGSI-v2 GET request', function (done) {
            request(options, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });

        it('should return not found', function (done) {
            request(options, function (error, response, body) {
                response.statusCode.should.equal(404);
                done();
            });
        });
    });
});
