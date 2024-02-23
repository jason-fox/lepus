var config = {};

config.port = 3000;

// maximum length of time to forward the **NGSI-LD** notification
config.relayTimeout = 1000;

// The **NGSI-v2** [Orion Context Broker](https://github.com/telefonicaid/fiware-orion) URL - e.g. `NGSI_V2_CONTEXT_BROKER=http://orion2:1026/v2`

config.v2ContextBroker = 'http://localhost:1026/v2';

// maximum length of time to access the **NGSI-v2** [Orion Context Broker](https://github.com/telefonicaid/fiware-orion) URL in milliseconds
config.v2Timeout = 1000;

// The fixed JSON-LD `@context` to be supplied - e.g. `https://fiware.github.io/tutorials.Step-by-Step/tutorials-context.jsonld`
config.userContext = 'https://fiware.github.io/tutorials.Step-by-Step/tutorials-context.jsonld';

// The location of Lepus itself -  e.g. `http://<lepus>/notify`
config.notificationRelay = 'https://localhost:3000/notify';

//  include the NGSI-v2 attribute `type` in the returned payload
config.valueType = false;

module.exports = config;