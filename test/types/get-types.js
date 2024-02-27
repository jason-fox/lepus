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
const timekeeper = require('timekeeper');

let contextBrokerMock;

describe('Attributes endpoint', function () {
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

    describe('When types are requested', function () {
        const options = {
            method: 'GET',
            url: LEPUS_URL + 'types'
        };

        beforeEach(function (done) {
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/types')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/Types.json'));

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
        it('should return an EntityTypeList', function (done) {
            request(options, function (error, response, body) {
                body.id = 'urn:ngsi-ld:EntityTypeList:xxx';
                const expected = utils.readExampleFile('./test/ngsi-ld/EntityTypeList.json');
                done(_.isEqual(body, expected) ? '' : 'Incorrect payload');
            });
        });
    });

    describe('When single attribute is requested', function () {
        const options = {
            method: 'GET',
            url: LEPUS_URL + 'types/TemperatureSensor'
        };

        beforeEach(function (done) {
            contextBrokerMock = nock(V2_BROKER)
                .get('/v2/types/TemperatureSensor')
                .reply(200, utils.readExampleFile('./test/ngsi-v2/Types.json'));

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
        it('should return EntityTypeInformation', function (done) {
            request(options, function (error, response, body) {
                body.id = 'urn:ngsi-ld:EntityTypeInformation:xxx';
                const expected = utils.readExampleFile('./test/ngsi-ld/EntityTypeInformation.json');
                done(_.isEqual(body, expected) ? '' : 'Incorrect payload');
            });
        });
    });
});