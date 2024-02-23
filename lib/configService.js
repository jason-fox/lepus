let config = {};
const debug = require('debug')('adapter:configService');

function processEnvironmentVariables() {
    const environmentVariables = [
        'LEPUS_PORT',
        'LEPUS_RELAY_TIMEOUT',
        'LEPUS_RELAY_URL',
        'NGSI_V2_TIMEOUT',
        'NGSI_V2_CONTEXT_BROKER',
        'USER_CONTEXT_URL',
        'INCLUDE_VALUE_TYPE'
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
    if (process.env.LEPUS_RELAY_URL) {
        config.notificationRelay = process.env.LEPUS_RELAY_URL;
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
    if (process.env.INCLUDE_VALUE_TYPE) {
        config.valueType = process.env.INCLUDE_VALUE_TYPE.trim().toLowerCase() === 'true';
    }
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

