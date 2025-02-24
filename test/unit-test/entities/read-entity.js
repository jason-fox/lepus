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
const SINGLE_ENTITY = 'entities/urn:ngsi-ld:TemperatureSensor:001';
const timekeeper = require('timekeeper');
const LINK_HEADER =
    '<https://context/ngsi-ld.jsonld>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"';

let contextBrokerMock;

describe('Read Entity', function () {
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
        url: LEPUS_URL + SINGLE_ENTITY
    };

    describe('When a normalized entity is read by id', function () {
        beforeEach(function (done) {
            delete options.searchParams;
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities/urn:ngsi-ld:TemperatureSensor:001')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/Entity.json'));

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

        it('should return an NGSI-LD payload and Link Header', function (done) {
            request(options, function (error, response, body) {
                response.headers.link.should.equal(LINK_HEADER);
                body.should.eql(utils.readExampleFile('./test/ngsi-ld/Entity.json'));
                done();
            });
        });
    });

    describe('When an entity using v2 typed keywords is read by id 1.8 core', function () {
        beforeEach(function (done) {
            delete options.searchParams;
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities/urn:ngsi-ld:TemperatureSensor:001')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/keywords.json'));

            done();
        });

        it('should return a converted NGSI-LD payload and Link Header', function (done) {
            request(options, function (error, response, body) {
                response.headers.link.should.equal(LINK_HEADER);
                body.should.eql(utils.readExampleFile('./test/ngsi-ld/keywords.json'));
                done();
            });
        });
    });

    describe('When an entity using v2 typed keywords is read by id and prefer=ngsi-ld=1.4 is set 1.8 core', function () {
        beforeEach(function (done) {
            delete options.searchParams;
            options.headers = {
                prefer: 'ngsi-ld=1.4'
            };
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities/urn:ngsi-ld:TemperatureSensor:001')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/keywords.json'));

            done();
        });

        it('should return a 1.4 payload, a Preference-Applied header and a Link Header', function (done) {
            request(options, function (error, response, body) {
                response.headers.link.should.equal(LINK_HEADER);
                response.headers['preference-applied'].should.equal('ngsi-ld=1.4');
                body.should.eql(utils.readExampleFile('./test/ngsi-ld/keywords-1.4.json'));
                done();
            });
        });
    });

    describe('When an entity using v2 dateExpired is read by id and prefer=ngsi-ld=1.4 is set', function () {
        beforeEach(function (done) {
            delete options.searchParams;
            options.headers = {
                prefer: 'ngsi-ld=1.4'
            };
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities/urn:ngsi-ld:TemperatureSensor:001')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/Entity-expiresAt.json'));

            done();
        });

        it('should return a 1.4 payload, a Preference-Applied header and a Link Header', function (done) {
            request(options, function (error, response, body) {
                response.headers.link.should.equal(LINK_HEADER);
                response.headers['preference-applied'].should.equal('ngsi-ld=1.4');
                body.should.eql(utils.readExampleFile('./test/ngsi-ld/Entity-expiresAt-1.4.json'));
                done();
            });
        });
    });

    describe('When an entity using v2 typed keywords is read by id and prefer=ngsi-ld=1.17 is set  1.8 core', function () {
        beforeEach(function (done) {
            delete options.searchParams;
            options.headers = {
                prefer: 'ngsi-ld=1.17'
            };
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities/urn:ngsi-ld:TemperatureSensor:001')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/keywords.json'));

            done();
        });

        it('should return a 1.8 payload, a Preference-Applied header and a Link Header', function (done) {
            request(options, function (error, response, body) {
                response.headers.link.should.equal(LINK_HEADER);
                response.headers['preference-applied'].should.equal('ngsi-ld=1.8');
                body.should.eql(utils.readExampleFile('./test/ngsi-ld/keywords-1.8.json'));
                done();
            });
        });
    });

    describe('When a concise entity is read by id', function () {
        beforeEach(function (done) {
            options.searchParams = 'options=concise';
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities/urn:ngsi-ld:TemperatureSensor:001')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/Entity.json'));

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

        it('should return an NGSI-LD payload and Link Header', function (done) {
            request(options, function (error, response, body) {
                response.headers.link.should.equal(LINK_HEADER);
                body.should.eql(utils.readExampleFile('./test/ngsi-ld/Entity-concise.json'));
                done();
            });
        });
    });

    describe('When a keyValues entity is read by id', function () {
        beforeEach(function (done) {
            options.searchParams = 'options=keyValues';
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities/urn:ngsi-ld:TemperatureSensor:001?options=keyValues')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/Entity-keyValues.json'));

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

        it('should return a keyValues payload and Link Header', function (done) {
            request(options, function (error, response, body) {
                response.headers.link.should.equal(LINK_HEADER);
                body.should.eql(utils.readExampleFile('./test/ngsi-ld/Entity-keyValues.json'));
                done();
            });
        });
    });

    describe('When an Entity with attrs is read by id', function () {
        beforeEach(function (done) {
            options.searchParams = 'attrs=category,temperature';
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities/urn:ngsi-ld:TemperatureSensor:001?attrs=category,temperature')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/Entity.json'));

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
        beforeEach(function (done) {
            options.searchParams = 'pick=category,temperature';
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities/urn:ngsi-ld:TemperatureSensor:001')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/Entity.json'));

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
                response.headers.link.should.equal(LINK_HEADER);
                body.should.eql(utils.readExampleFile('./test/ngsi-ld/Entity-pick.json'));
                done();
            });
        });
    });

    describe('When an Entity with omit is read by id', function () {
        beforeEach(function (done) {
            options.searchParams = 'omit=category,temperature';
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities/urn:ngsi-ld:TemperatureSensor:001')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/Entity.json'));

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
                response.headers.link.should.equal(LINK_HEADER);
                body.should.eql(utils.readExampleFile('./test/ngsi-ld/Entity-omit.json'));
                done();
            });
        });
    });

    describe('When an Entity with sysAttrs is read by id', function () {
        beforeEach(function (done) {
            options.searchParams = 'options=sysAttrs';
            const time = new Date(1708729200); // 2024-02-23T16:18:07+0000

            timekeeper.freeze(time);
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities/urn:ngsi-ld:TemperatureSensor:001?metadata=dateCreated,dateModified,*')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/Entity-sysAttrs.json'));

            done();
        });

        afterEach((done) => {
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
                response.headers.link.should.equal(LINK_HEADER);
                body.should.eql(utils.readExampleFile('./test/ngsi-ld/Entity-sysAttrs.json'));
                done();
            });
        });
    });

    describe('When no entity is found', function () {
        beforeEach(function (done) {
            delete options.searchParams;
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities/urn:ngsi-ld:TemperatureSensor:001')
                .reply(404, utils.readExampleFile('./test/ngsi-v2/Not-Found.json'));
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
                body.should.eql(utils.readExampleFile('./test/ngsi-ld/Not-Found.json'));
                done();
            });
        });
    });

    describe('When a normalized entity is read on a tenant', function () {
        beforeEach(function (done) {
            delete options.searchParams;
            options.headers = {
                'NGSILD-Tenant': 'tenant'
            };
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities/urn:ngsi-ld:TemperatureSensor:001')
                .matchHeader('fiware-service', 'tenant')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/Entity.json'));

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
});

describe('Read Entity with valueType', function () {
    beforeEach((done) => {
        nock.cleanAll();
        config.coreContext = 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.9.jsonld';
        lepus.start(config, () => {
            done();
        });
    });

    afterEach((done) => {
        config.coreContext = 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.8.jsonld';
        lepus.stop(function () {
            done();
        });
    });

    const options = {
        method: 'GET',
        url: LEPUS_URL + SINGLE_ENTITY
    };

    describe('When an entity using v2 typed keywords is read by id', function () {
        beforeEach(function (done) {
            delete options.searchParams;
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities/urn:ngsi-ld:TemperatureSensor:001')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/keywords.json'));

            done();
        });

        it('should return a converted NGSI-LD payload and Link Header', function (done) {
            request(options, function (error, response, body) {
                response.headers.link.should.equal(LINK_HEADER);
                body.should.eql(utils.readExampleFile('./test/ngsi-ld/keywords-1.9.json'));
                done();
            });
        });
    });

    describe('When an entity using v2 typed keywords is read by id and prefer=ngsi-ld=1.4 is set', function () {
        beforeEach(function (done) {
            delete options.searchParams;
            options.headers = {
                prefer: 'ngsi-ld=1.4'
            };
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities/urn:ngsi-ld:TemperatureSensor:001')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/keywords.json'));

            done();
        });

        it('should return a 1.4 payload, a Preference-Applied header and a Link Header', function (done) {
            request(options, function (error, response, body) {
                response.headers.link.should.equal(LINK_HEADER);
                response.headers['preference-applied'].should.equal('ngsi-ld=1.4');
                body.should.eql(utils.readExampleFile('./test/ngsi-ld/keywords-1.4.json'));
                done();
            });
        });
    });

    describe('When an entity using v2 typed keywords is read by id and prefer=ngsi-ld=1.17 is set', function () {
        beforeEach(function (done) {
            delete options.searchParams;
            options.headers = {
                prefer: 'ngsi-ld=1.17'
            };
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities/urn:ngsi-ld:TemperatureSensor:001')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/keywords.json'));

            done();
        });

        it('should return a 1.9 payload, a Preference-Applied header and a Link Header', function (done) {
            request(options, function (error, response, body) {
                response.headers.link.should.equal(LINK_HEADER);
                response.headers['preference-applied'].should.equal('ngsi-ld=1.9');
                body.should.eql(utils.readExampleFile('./test/ngsi-ld/keywords-1.9.json'));
                done();
            });
        });
    });

    describe('When a normalized entity with valueType is read by id', function () {
        beforeEach(function (done) {
            delete options.searchParams;
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities/urn:ngsi-ld:TemperatureSensor:001')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/Entity-valueType.json'));

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

        it('should return an NGSI-LD payload and Link Header', function (done) {
            request(options, function (error, response, body) {
                response.headers.link.should.equal(LINK_HEADER);
                body.should.eql(utils.readExampleFile('./test/ngsi-ld/Entity-valueType.json'));
                done();
            });
        });
    });

    describe('When a concise entity with valueType is read by id', function () {
        beforeEach(function (done) {
            options.searchParams = 'options=concise';
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities/urn:ngsi-ld:TemperatureSensor:001')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/Entity-valueType.json'));

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

        it('should return an NGSI-LD payload and Link Header', function (done) {
            request(options, function (error, response, body) {
                response.headers.link.should.equal(LINK_HEADER);
                body.should.eql(utils.readExampleFile('./test/ngsi-ld/Entity-valueType-concise.json'));
                done();
            });
        });
    });
});

describe('Read Entity with expiresAt', function () {
    beforeEach((done) => {
        nock.cleanAll();
        config.coreContext = 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.9.jsonld';
        lepus.start(config, () => {
            done();
        });
    });

    afterEach((done) => {
        config.coreContext = 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.8.jsonld';
        lepus.stop(function () {
            done();
        });
    });

    const options = {
        method: 'GET',
        url: LEPUS_URL + SINGLE_ENTITY
    };
    describe('When a normalized entity with expiresAt is read by id', function () {
        beforeEach(function (done) {
            delete options.searchParams;
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities/urn:ngsi-ld:TemperatureSensor:001')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/Entity-expiresAt.json'));

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

        it('should return an NGSI-LD payload and Link Header', function (done) {
            request(options, function (error, response, body) {
                response.headers.link.should.equal(LINK_HEADER);
                body.should.eql(utils.readExampleFile('./test/ngsi-ld/Entity-expiresAt.json'));
                done();
            });
        });
    });

    describe('When a concise entity with expiresAt is read by id', function () {
        beforeEach(function (done) {
            options.searchParams = 'options=concise';
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/entities/urn:ngsi-ld:TemperatureSensor:001')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/Entity-expiresAt.json'));

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

        it('should return an NGSI-LD payload and Link Header', function (done) {
            request(options, function (error, response, body) {
                response.headers.link.should.equal(LINK_HEADER);
                body.should.eql(utils.readExampleFile('./test/ngsi-ld/Entity-expiresAt-concise.json'));
                done();
            });
        });
    });
});
