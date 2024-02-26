/*
 * Copyright 2023 -  FIWARE Foundation e.V.
 *
 * This file is part of NGSI-LD to NGSI-v2 Adapter
 *
 */

/* eslint-disable no-unused-vars */

const lepus = require('../lib/lepus');
const config = require('./config-test');
const nock = require('nock');
const should = require('should');
const assert = require('node:assert').strict;
const utils = require('./utils');
const request = utils.request;
const LEPUS_URL = 'http://localhost:3000/ngsi-ld/v1/';
const V2_BROKER = 'http://orion:1026';
const SINGLE_ENTITY = 'entities/';
const _ = require('lodash');
const timekeeper = require('timekeeper');

let contextBrokerMock;

describe('Error Handling', function () {
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
        method: 'GET',
        url: LEPUS_URL + SINGLE_ENTITY
    };

    describe('When an unknown endpoint is requested', function () {
        it('should return GatewayTimeout', function (done) {
            request(
                {
                    method: 'GET',
                    url: LEPUS_URL + 'unknown'
                },
                function (error, response, body) {
                    console.log(body);
                    const expected = {
                        type: 'urn:ngsi-ld:MethodNotAllowed',
                        title: 'Method Not Allowed',
                        message: 'GET not supported for /unknown'
                    };
                    done(_.isEqual(body, expected) ? '' : 'Incorrect payload');
                }
            );
        });
    });

    describe('When a timeout occurs', function () {
        beforeEach(function (done) {
            contextBrokerMock = nock(V2_BROKER).get('/v2/entities/').replyWithError({
                message: 'something awful happened',
                code: 'ETIMEDOUT'
            });
            done();
        });

        it('should return GatewayTimeout', function (done) {
            request(options, function (error, response, body) {
                const expected = {
                    type: 'https://uri.etsi.org/ngsi-ld/errors/GatewayTimeout',
                    title: 'Gateway Timeout',
                    message: '/entities/ is did not respond in time'
                };
                done(_.isEqual(body, expected) ? '' : 'Incorrect payload');
            });
        });
    });

    describe('When connection is refused', function () {
        beforeEach(function (done) {
            contextBrokerMock = nock(V2_BROKER).get('/v2/entities/').replyWithError({
                message: 'something awful happened',
                code: 'ECONNREFUSED'
            });
            done();
        });

        it('should return BadGateway', function (done) {
            request(options, function (error, response, body) {
                const expected = {
                    type: 'https://uri.etsi.org/ngsi-ld/errors/BadGateway',
                    title: 'Bad Gateway',
                    message: '/entities/ server is unavailable'
                };
                done(_.isEqual(body, expected) ? '' : 'Incorrect payload');
            });
        });
    });

    describe('When an unexpected error occurs', function () {
        beforeEach(function (done) {
            contextBrokerMock = nock(V2_BROKER).get('/v2/entities/').replyWithError({
                message: 'something awful happened',
                code: 'EUNKNOWN'
            });
            done();
        });

        it('should return Internal Error', function (done) {
            request(options, function (error, response, body) {
                const expected = {
                    type: 'https://uri.etsi.org/ngsi-ld/errors/InternalError',
                    title: 'Internal Server Error',
                    message: '/entities/ caused an error:  EUNKNOWN'
                };
                done(_.isEqual(body, expected) ? '' : 'Incorrect payload');
            });
        });
    });
});
