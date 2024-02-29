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

describe('Subscriptions options', function () {
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

    describe('/subscriptions are queried', function () {
        it('should return GET,POST,OPTIONS', function (done) {
            options.url = LEPUS_URL + 'subscriptions';
            request(options, function (error, response, body) {
                response.headers.allow.should.eql('GET,POST,OPTIONS');
                done();
            });
        });
    });

    describe('/subscriptions/xxx are queried', function () {
        it('should return GET,PATCH,DELETE,OPTIONS', function (done) {
            options.url = LEPUS_URL + 'subscriptions/xxx';
            request(options, function (error, response, body) {
                response.headers.allow.should.eql('GET,PATCH,DELETE,OPTIONS');
                done();
            });
        });
    });
});
