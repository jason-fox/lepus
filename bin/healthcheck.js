#!/usr/bin/env node

/*
 * Copyright 2025 -  FIWARE Foundation e.V.
 *
 * This file is part of NGSI-LD to NGSI-v2 Adapter
 *
 */

const Request = require('../lib/request');
const httpCode = process.env.HEALTHCHECK_CODE || 200;
const config = require('../lib/configService');
const debug = require('debug')('adapter:lepus');
const newConfig = require('../config');

async function getVersion() {
    const options = {
        method: 'GET',
        throwHttpErrors: false,
        retry: 0
    };
    const result = await Request.sendRequest('/../version/', options);
    return result;
}

config.setConfig(newConfig);
getVersion().then((result) => {
    debug(`Performed health check, result ${result.statusCode}`);
    if (result.statusCode === httpCode) {
        process.exit(0);
    } else {
        process.exit(1);
    }
});
