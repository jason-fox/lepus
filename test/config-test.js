const config = {};

config.port = 3000;
config.relayTimeout = 1000;
config.v2ContextBroker = 'http://orion:1026';
config.v2Timeout = 1000;
config.userContext = 'https://context/ngsi-ld.jsonld';
config.lepusUrl = 'https://localhost:3000';
config.coreContext = 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.8.jsonld';
config.alias='lepus';

module.exports = config;
