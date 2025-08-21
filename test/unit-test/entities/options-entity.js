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
const utils = require('../../utils');
const request = utils.request;
const LEPUS_URL = 'http://localhost:3000/ngsi-ld/v1/';

describe('Entity options', function () {
    beforeEach(function (done) {
        lepus.start(config, function (text) {
            done();
        });
    });

    afterEach(function (done) {
        lepus.stop(function () {
            done();
        });
    });

    const options = {
        method: 'OPTIONS'
    };

    describe('/entities are queried', function () {
        it('should return GET,HEAD,POST,DELETE,OPTIONS', function (done) {
            options.url = LEPUS_URL + 'entities';
            request(options, function (error, response, body) {
                response.headers.allow.should.equal('GET,HEAD,POST,DELETE,OPTIONS');
                done();
            });
        });
    });

    describe('/entities/xxx are queried', function () {
        it('should return GET,HEAD,PATCH,PUT,DELETE,OPTIONS', function (done) {
            options.url = LEPUS_URL + 'entities/xxx';
            request(options, function (error, response, body) {
                response.headers.allow.should.equal('GET,HEAD,PATCH,PUT,DELETE,OPTIONS');
                done();
            });
        });
    });

    describe('/entities/xxx/attrs are queried', function () {
        it('should return GET,HEAD,PATCH,POST,OPTIONS', function (done) {
            options.url = LEPUS_URL + 'entities/xxx/attrs';
            request(options, function (error, response, body) {
                response.headers.allow.should.equal('GET,HEAD,PATCH,POST,OPTIONS');
                done();
            });
        });
    });

    describe('/entities/xxx/attrs/yyy are queried', function () {
        it('should return GET,HEAD,PATCH,PUT,DELETE,OPTIONS', function (done) {
            options.url = LEPUS_URL + 'entities/xxx/attrs/yyy';
            request(options, function (error, response, body) {
                response.headers.allow.should.equal('GET,HEAD,PATCH,PUT,DELETE,OPTIONS');
                done();
            });
        });
    });
});
