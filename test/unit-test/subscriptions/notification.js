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
const SUBSCRIBER_ENDPOINT = 'http://localhost:3001';
const StatusCodes = require('http-status-codes').StatusCodes;
const bodyParser = require('body-parser');
const express = require('express');

describe('Raise Notification', function () {
    const subscriber = express();
    let notification = null;

    // parse application/json
    subscriber.use(bodyParser.json());
    subscriber.use(bodyParser.json({ type: 'application/*+json' }));

    subscriber.post('/notify', (req, res) => {
        notification = req.body;
        res.status(StatusCodes.OK).send();
    });

    subscriber.listen(3001);

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
        headers: {
            Target: SUBSCRIBER_ENDPOINT + '/notify'
        },
        method: 'POST',
        url: LEPUS_URL + '/notify'
    };

    describe('When a notification is raised', function () {
        beforeEach(function (done) {
            options.json = utils.readExampleFile('./test/ngsi-v2/Notification.json');
            notification = null;
            done();
        });
        it('should return success', function (done) {
            request(options, function (error, response, body) {
                response.statusCode.should.equal(200);
                done();
            });
        });

        it('should forward an NGSI-LD subscriber', function (done) {
            request(options, function (error, response, body) {
                notification.id = 'urn:ngsi-ld:Notification:xxx';
                notification.notifiedAt = '2024-02-xxx';
                notification.should.eql(utils.readExampleFile('./test/ngsi-ld/Notification.json'));
                done();
            });
        });
    });
});
