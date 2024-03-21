/*
 * Copyright 2023 -  FIWARE Foundation e.V.
 *
 * This file is part of NGSI-LD to NGSI-v2 Adapter
 *
 */
let config = {};
const debug = require('debug')('adapter:configService');
const semver = require('semver');

function processEnvironmentVariables() {
    const environmentVariables = [
        'LEPUS_PORT',
        'LEPUS_RELAY_TIMEOUT',
        'LEPUS_URL',
        'LEPUS_ALIAS',
        'NGSI_V2_TIMEOUT',
        'NGSI_V2_CONTEXT_BROKER',
        'USER_CONTEXT_URL',
        'CORE_CONTEXT_URL'
    ];

    environmentVariables.forEach((key) => {
        const value = process.env[key];
        if (value) {
            debug('Setting %s to environment value: %s', key, value);
        }
    });

    if (process.env.LEPUS_PORT) {
        config.port = process.env.LEPUS_PORT;
    }
    if (process.env.LEPUS_RELAY_TIMEOUT) {
        config.relayTimeout = process.env.LEPUS_RELAY_TIMEOUT;
    }
    if (process.env.LEPUS_URL) {
        config.lepusUrl = process.env.LEPUS_URL;
    }
    if (process.env.LEPUS_ALIAS) {
        config.alias = process.env.LEPUS_ALIAS;
    }
    if (process.env.NGSI_V2_TIMEOUT) {
        config.v2timeout = process.env.NGSI_V2_TIMEOUT;
    }
    if (process.env.NGSI_V2_CONTEXT_BROKER) {
        config.v2ContextBroker = process.env.NGSI_V2_CONTEXT_BROKER;
    }
    if (process.env.USER_CONTEXT_URL) {
        config.userContext = process.env.USER_CONTEXT_URL;
    }
    if (process.env.CORE_CONTEXT_URL) {
        config.coreContext = process.env.CORE_CONTEXT_URL;
    }

    const re = /(?<=ngsi-ld-core-context-v)(\d+\.\d+)/g;
    const ngsiVersion = config.coreContext.match(re, '');
    config.version = ngsiVersion[0];
    config.valueType = semver.gt(`${config.version}.1`, '1.9.0');
    config.notificationRelay = config.lepusUrl + '/notify';
    config.linkHeader = config.lepusUrl + '/context.jsonld';
}

function setConfig(newConfig) {
    config = newConfig;
    processEnvironmentVariables();
}

function getConfig() {
    return config;
}

exports.setConfig = setConfig;
exports.getConfig = getConfig;
