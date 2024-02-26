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

let contextBrokerMock;

describe('Batch Delete Entities', function () {
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
        method: 'POST',
        url: LEPUS_URL + 'entityOperations/delete'
    };
    const ORION_ENDPOINT = '/v2/op/update/';

    describe('When multiple entities are deleted', function () {
        beforeEach(function (done) {
            options.json = utils.readExampleFile('./test/ngsi-ld/Batch-Delete-Entities.json');
            contextBrokerMock = nock(V2_BROKER)
                .post(ORION_ENDPOINT, utils.readExampleFile('./test/ngsi-v2/Batch-Delete-Entities-no-type.json'))
                .reply(204);

            done();
        });
        it('should return no content', function (done) {
            request(options, function (error, response, body) {
                console.log(body);
                response.statusCode.should.equal(204);
                done();
            });
        });

        it('should forward an NGSI-v2 DELETE request', function (done) {
            request(options, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
    });
    /*
    describe('When an deleted entity is not found', function () {
        beforeEach(function (done) {
            contextBrokerMock = nock(V2_BROKER)
                .delete(ORION_ENDPOINT)
                .reply(404, utils.readExampleFile('./test/ngsi-v2/Not-Found.json'));

            done();
        });
        it('should return not found', function (done) {
            request(options, function (error, response, body) {
                response.statusCode.should.equal(404);
                const expected = utils.readExampleFile('./test/ngsi-ld/Not-Found.json');
                done(_.isEqual(body, expected) ? '' : 'Incorrect payload');
            });
        });
    });*/
});
