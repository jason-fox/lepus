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
const utils = require('../utils');
const request = utils.request;
const LEPUS_URL = 'http://localhost:3000/ngsi-ld/v1/';

describe('attributes options', function () {
    beforeEach((done) => {
        lepus.start(config, () => {
            done();
        });
    });

    afterEach((done) => {
        lepus.stop(() => {
            done();
        });
    });

    const options = {
        method: 'OPTIONS'
    };

    describe('/attributes are queried', function () {
        it('should return GET,OPTIONS', function (done) {
            options.url = LEPUS_URL + 'attributes';
            request(options, function (error, response, body) {
                response.headers.allow.should.eql('GET,OPTIONS');
                done();
            });
        });
    });

    describe('/attributes/xxx are queried', function () {
        it('should return GET,OPTIONS', function (done) {
            options.url = LEPUS_URL + 'attributes/xxx';
            request(options, function (error, response, body) {
                response.headers.allow.should.eql('GET,OPTIONS');
                done();
            });
        });
    });
});
