# FIWARE Lepus

An **NGSI-LD** wrapper for **NGSI-v2** Context Brokers. It understands the NGSI-LD endpoints inputs, converts them to NGSI-v2, makes a request to
the NGSI-v2 broker behind it and transforms responses back to NGSI-LD using a fixed JSON-LD `@context`. It supports the NGSI-LD **federationOps** endpoints only 
and is designed to be used as a registered source with NGSI-LD Context Brokers in federation mode.

### Example

_Give me the Stores with the name "Einkauf" in **NGSI-LD** format_

```console
curl -L '<lepus-context-broker>/ngsi-ld/v1/entities?type=Store&q=name%22Einkauf%22' \
-H 'Link: <http://context/ngsi-context.jsonld>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"' \
-H 'Accept: application/ld+json'
```

is transformed to _Give me the Stores with the name "Einkauf" in **NGSI-v2** format_

```console
curl -L '<ngsi-v2-context-broker>/v2/entities?type=Store&q=nameEinkauf' \
-H 'Accept: application/json'
```

All NGSI-v2 response attributes are converted to `Property` or `Relationship` and a fixed `@context` added to the body or `Link` header.


### Supported Endpoints

The following endpoints are supported:

-   **GET**  `/entities/`- Query entities  §5.7.2; §6.4.3.2
-   **GET** `/entities/{entityId}` - Entity retrieval by id  - §5.7.1; §6.5.3.1
<br/>

-   **POST** `/subscriptions/` - Create Subscription  §5.8.1;  §6.10.3.1
-   **GET**  ` /subscriptions/` - Retrieve list of Subscriptions  §5.8.4;  §6.10.3.2
-   **GET** `/subscriptions/{subscriptionId}` - Subscription retrieval by id  §5.8.3;  §6.11.3.1
-   **PATCH** `/subscriptions/{subscriptionId}` - Subscription update by id  §5.8.2;  §6.11.3.2
-   **DELETE** `/subscriptions/{subscriptionId}` - Subscription deletion by id  §5.8.5;  §6.11.3.3
<br/>

-   **GET** ` /types/` - Retrieve available entity types  §5.7.5; §d5.7.6; §6.25.3.1
-   **GET** ` /types/{type}` -  Details about available entity type §5.7.7; §6.26.3.1
<br/>

-   **GET** ` /attributes/` - Available attributes §5.7.8; §5.7.9; §6.27.3.1
-   **GET** `/attributes/{attrId}` - Details about available attribute §5.7.10; §6.28.3.1

Internally 

-   **POST** ` /notify/` receives NGSI-v2 notifications and forwards then as NGSI-LD

### Usage

To use the wrapper, run:

```console
 docker-compose up
```

Then insert some data into an NGSI-v2 broker such as Telefónica's [Orion Context Broker](https://github.com/telefonicaid/fiware-orion)

```console
curl -L 'http://localhost:1026/v2/entities/' \
-H 'Content-Type: application/json' \
-d '{
    "id": "urn:ngsi-ld:Store:001",
    "type": "Store",
    "address": {
        "type": "PostalAddress",
        "value": {
            "streetAddress": "Bornholmer Straße 65",
            "addressRegion": "Berlin",
            "addressLocality": "Prenzlauer Berg",
            "postalCode": "10439"
        },
        "metadata": {
    		"verified": {
        		"value": true,
        		"type": "Boolean"
    		}
    	}
    },
    "location": {
        "type": "geo:json",
        "value": {
             "type": "Point",
             "coordinates": [13.3986, 52.5547]
        }
    },
    "name": {
        "type": "Text",
        "value": "Bösebrücke Einkauf"
    }
}'
```

```console
curl -L 'http://localhost:1026/v2/entities/' \
-H 'Content-Type: application/json' \
-d '{
  "type": "Store",
    "id": "urn:ngsi-ld:Store:002",
    "address": {
        "type": "PostalAddress",
        "value": {
            "streetAddress": "Friedrichstraße 44",
            "addressRegion": "Berlin",
            "addressLocality": "Kreuzberg",
            "postalCode": "10969"
        },
        "metadata": {
    		"verified": {
        		"value": true,
        		"type": "Boolean"
    		}
    	}
    },
    "location": {
        "type": "geo:json",
        "value": {
             "type": "Point",
             "coordinates": [13.3903, 52.5075]
        }
    },
    "name": {
        "type": "Text",
        "value": "Checkpoint Markt"
    }
}'
```

Now query Lepus as if it is an NGSI-LD source - e.g.

```console
curl -L 'http://localhost:3005/ngsi-ld/v1/types' \
-H 'Link: <http://context/ngsi-context.jsonld>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"' \
-H 'Accept: application/ld+json'
```

returns NGSI-LD with a fixed `@context`

```json
{
    "id": "urn:ngsi-ld:EntityTypeList:a1993de4-83e0-44c9-990b-be2e84b31df1",
    "type": "EntityTypeList",
    "typeList": [
        "Store"
    ],
    "@context": "https://fiware.github.io/tutorials.Step-by-Step/tutorials-context.jsonld"
}
```

### Configuration

Configuration occurs using Docker Environment variables:

  -   **DEBUG** - for debug output - e.g. `DEBUG=adapter:*`
  -   **NGSI_V2_CONTEXT_BROKER** for the **NGSI-v2** [Orion Context Broker](https://github.com/telefonicaid/fiware-orion) URL - e.g. `NGSI_V2_CONTEXT_BROKER=http://orion2:1026/v2` 
  -   **CONTEXT_URL** for the fixed JSON-LD `@context` to be supplied - e.g. `CONTEXT_URL=https://fiware.github.io/tutorials.Step-by-Step/tutorials-context.jsonld`
  -   **NOTIFICATION_RELAY_URL** for the location of Lepus itself -  e.g. `NOTIFICATION_RELAY_URL=http://<lepus>/notify`

## NGSI-LD Registration

Since Lepus does not understand JSON-LD directly, registrations must as an LD context broker to preprocess all interactions
using the `"key": "jsonldContext"`:

```
curl -L 'http://localhost:9090/ngsi-ld/v1/csourceRegistrations/' \
-H 'Content-Type: application/json' \
-H 'Link: <ngsi-context.jsonld>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"' \
-d ' {
    "type": "ContextSourceRegistration",
    "information": [
        {
            "entities": [
                
                 {
                    "type": "Shelf"
                }
            ]
        }
    ],
     "contextSourceInfo":[
        {
            "key": "jsonldContext",
            "value": "<hard-coded-json-ld>"
        }
    ],
    "mode": "inclusive",
    "operations": [
        "federationOps"
    ],
    "endpoint": "http://<lepus>"
}'


## License

[MIT](LICENSE) © 2023 FIWARE Foundation e.V.
