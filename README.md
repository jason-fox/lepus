# FIWARE Lepus

[![FIWARE Core Context Management](https://nexus.lab.fiware.org/static/badges/chapters/core.svg)](https://github.com/FIWARE/catalogue/blob/master/core/README.md)
[![License: MIT](https://img.shields.io/github/license/jason-fox/lepus.svg)](https://opensource.org/licenses/MIT)
[![Docker badge](https://img.shields.io/badge/quay.io-fiware%2Flepus-grey?logo=red%20hat&labelColor=EE0000)](https://quay.io/repository/fiware/lepus)<br/>
[![NGSI v2](https://img.shields.io/badge/NGSI-v2-5dc0cf.svg)](https://fiware-ges.github.io/orion/api/v2/stable/)
[![NGSI LD](https://img.shields.io/badge/NGSI-LD-d6604d.svg)](https://www.etsi.org/deliver/etsi_gs/CIM/001_099/009/01.07.01_60/gs_cim009v010701p.pdf)
[![JSON LD](https://img.shields.io/badge/JSON--LD-1.1-f06f38.svg)](https://w3c.github.io/json-ld-syntax/)

An **NGSI-LD** wrapper for use with **NGSI-v2** Context Brokers. It understands the NGSI-LD endpoints and inputs, converts them to NGSI-v2, makes a request to
the NGSI-v2 broker behind it and transforms responses back to NGSI-LD using a **fixed JSON-LD `@context`**. It supports the NGSI-LD **federationOps** endpoints only 
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

All NGSI-v2 response attributes are converted to `Property` or `Relationship` (or subtype) and a fixed `@context` added to the body or `Link` header.


### Supported Endpoints

The following endpoints are supported as defined in the latest [NGSI-LD Specification](https://www.etsi.org/deliver/etsi_gs/CIM/001_099/009/01.07.01_60/gs_cim009v010701p.pdf)

#### Entities

-   **GET**  `/entities/` - Query entities  - §5.7.2; §6.4.3.2
-   **POST**  `/entities/` - Entity creation  - §5.6.1; §6.4.3.1
<br/>

-   **GET** `/entities/{entityId}` - Entity retrieval by id  - §5.7.1; §6.5.3.1
-   **PATCH** `/entities/{entityId}` - Merge Entity  - §5.6.17; §6.5.3.4
-   **PUT** `/entities/{entityId}` - Replace Entity  - §5.6.17; §6.5.3.3
-   **DELETE** `/entities/{entityId}` - Entity retrieval by id  - §5.6.6; §6.5.3.2
<br/>

-   **POST** `/entities/{entityId}/attrs` - Append Entity attributes - §5.6.3; §6.6.3.1
-   **PATCH** `/entities/{entityId}/attrs` - Update Entity attributes  - §5.6.2; §6.6.3.2
<br>

-   **DELETE** `/entities/{entityId}/{attr}` - Delete Entity attribute - §5.6.5; §6.7.3.2
-   **PUT** `/entities/{entityId}/{attr}` - Replace Entity attribute - §5.6.19; §6.7.3.3
<br/>

#### Subscriptions

-   **POST** `/subscriptions/` - Create Subscription  - §5.8.1;  §6.10.3.1
-   **GET**  ` /subscriptions/` - Retrieve list of Subscriptions  - §5.8.4;  §6.10.3.2
-   **GET** `/subscriptions/{subscriptionId}` - Subscription retrieval by id  - §5.8.3;  §6.11.3.1
-   **PATCH** `/subscriptions/{subscriptionId}` - Subscription update by id  - §5.8.2;  §6.11.3.2
-   **DELETE** `/subscriptions/{subscriptionId}` - Subscription deletion by id  - §5.8.5;  §6.11.3.3
<br/>

#### Types

-   **GET** ` /types/` - Retrieve available entity types  - §5.7.5; §5.7.6; §6.25.3.1
-   **GET** ` /types/{type}` -  Details about available entity type  - §5.7.7; §6.26.3.1
<br/>

#### Attributes

-   **GET** ` /attributes/` - Available attributes  - §5.7.8; §5.7.9; §6.27.3.1
-   **GET** `/attributes/{attrId}` - Details about available attribute - §5.7.10; §6.28.3.1

#### Batch Operations

-   **POST** `/entityOperations/create` - Batch Entity creation  - §5.6.7; 6.14.3.1
-   **POST** `/entityOperations/upsert` - Batch Entity create or update (upsert)  - §5.6.8; §6.15.3.1
-   **POST** `/entityOperations/update` - Batch Entity update - §5.6.9; §6.16.3.1
-   **POST** `/entityOperations/delete` - Batch Entity deletion  - §5.6.10; §6.17.3.1
> -   **POST** `/entityOperations/query` - Query entities based on POST - §5.7.2; §6.23.3.1 ❌
> -   **POST** `/entityOperations/merge` - Batch Entity merge - §5.6.20; §6.31.3.1  ❌

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
  -   **NGSI_V2_TIMEOUT** maximum length of time to access the **NGSI-v2** [Orion Context Broker](https://github.com/telefonicaid/fiware-orion) URL in milliseconds
  -   **CONTEXT_URL** for the fixed JSON-LD `@context` to be supplied - e.g. `CONTEXT_URL=https://fiware.github.io/tutorials.Step-by-Step/tutorials-context.jsonld`
  -   **NOTIFICATION_RELAY_URL** for the location of Lepus itself -  e.g. `NOTIFICATION_RELAY_URL=http://<lepus>/notify`
  -   **NOTIFICATION_RELAY_TIMEOUT** maximum length of time to forward the **NGSI-LD** notification
  -   **INCLUDE_VALUE_TYPE** - include the NGSI-v2 attribute `type` in the returned payload

## NGSI-LD Registration

Since Lepus does not understand JSON-LD directly, registrations must be created within an LD context broker using the `"key": "jsonldContext"` 
to preprocess all interactions:

```console
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
```


## License

[MIT](LICENSE) © 2023 FIWARE Foundation e.V.
