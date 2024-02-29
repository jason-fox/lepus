/*
 * Copyright 2023 -  FIWARE Foundation e.V.
 *
 * This file is part of NGSI-LD to NGSI-v2 Adapter
 *
 */

/* eslint-disable no-unused-vars */

const lepus = require('../../lib/lepus');
const config = require('../config-test');
const should = require('should');
const utils = require('../utils');
const request = utils.request;
const LEPUS_CONTEXT = 'http://localhost:3000/context.jsonld';
const JSON_LD_CONTENT_TYPE = 'application/ld+json; charset=utf-8';

describe('Context Handling', function () {
    beforeEach((done) => {
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
        url: LEPUS_CONTEXT
    };

    describe('When a JSON-LD Context is requested', function () {
        it('should return a valid JSON-LD Context', function (done) {
            request(options, function (error, response, body) {
                response.headers['content-type'].should.equal(JSON_LD_CONTENT_TYPE);
                body.should.eql(utils.readExampleFile('./test/ngsi-ld/context.jsonld'));
                done();
            });
        });
    });
});
