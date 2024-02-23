var config = {};

config.port = 3000;
config.relayTimeout = 1000;
config.v2ContextBroker = 'http://orion:1026';
config.v2Timeout = 1000;
config.userContext = 'https://context/ngsi-ld.jsonld';
config.notificationRelay = 'https://localhost:3000/notify';
config.valueType = false;

module.exports = config;
