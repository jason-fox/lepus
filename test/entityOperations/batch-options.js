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

describe('Batch operations options', function () {
    beforeEach((done) => {
        lepus.start(config, function (text) {
            done();
        });
    });

    afterEach((done) => {
        lepus.stop(function () {
            done();
        });
    });

    const options = {
        method: 'OPTIONS'
    };

    describe('/entityOperations/create are queried', function () {
        it('should return POST,OPTIONS', function (done) {
            options.url = LEPUS_URL + 'entityOperations/create';
            request(options, function (error, response, body) {
                response.headers.allow.should.eql('POST,OPTIONS');
                done();
            });
        });
    });
    describe('/entityOperations/delete are queried', function () {
        it('should return POST,OPTIONS', function (done) {
            options.url = LEPUS_URL + 'entityOperations/delete';
            request(options, function (error, response, body) {
                response.headers.allow.should.eql('POST,OPTIONS');
                done();
            });
        });
    });
    describe('/entityOperations/update are queried', function () {
        it('should return POST,OPTIONS', function (done) {
            options.url = LEPUS_URL + 'entityOperations/update';
            request(options, function (error, response, body) {
                response.headers.allow.should.eql('POST,OPTIONS');
                done();
            });
        });
    });
    describe('/entityOperations/upsert are queried', function () {
        it('should return POST,OPTIONS', function (done) {
            options.url = LEPUS_URL + 'entityOperations/upsert';
            request(options, function (error, response, body) {
                response.headers.allow.should.eql('POST,OPTIONS');
                done();
            });
        });
    });
});
