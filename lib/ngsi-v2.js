/*
 * Copyright 2023 -  FIWARE Foundation e.V.
 *
 * This file is part of NGSI-LD to NGSI-v2 Adapter
 *
 */

const Config = require('../lib/configService');
const Constants = require('../lib/constants');
const _ = require('lodash');

function setHeaders(res) {
    const headers = {};
    if (res.locals.tenant) {
        headers['fiware-service'] = res.locals.tenant;
    }
    if (res.locals.servicePath) {
        headers['fiware-service-path'] = res.locals.servicePath;
    }
    return headers;
}

/**
 * Amends an NGSI-LD  Subscription payload to  NGSI-v2format
 *
 */
function formatSubscription(json) {
    const notification = json.notification || {};
    const endpoint = notification.endpoint || {};
    const q = json.q ? json.q.replace(/"/gi, '').replace(/%22/gi, '') : undefined;

    let entities;

    if (json.entities) {
        entities = _.map(json.entities, (entity) => {
            if (entity.id) {
                return entity;
            } else if (entity.type && !entity.idPattern) {
                return { type: entity.type, idPattern: '.*' };
            }
            return entity;
        });
    }

    const obj = {
        type: 'Subscription',
        description: json.description
    };

    if (q) {
        obj.subject = obj.subject || {};
        obj.subject.condition = obj.subject.condition || {};
        obj.subject.condition.expression = obj.subject.condition.expression || {};
        obj.subject.condition.expression.q = q;
    }
    if (json.entities) {
        obj.subject = obj.subject || {};
        obj.subject.entities = entities;
    }
    if (json.watchedAttributes) {
        obj.subject = obj.subject || {};
        obj.subject.condition = obj.subject.condition || {};
        obj.subject.condition.attrs = json.watchedAttributes;
    }
    if (notification.format) {
        obj.notification = obj.notification || {};
        obj.notification.attrsFormat = notification.format;
    }
    if (endpoint.uri) {
        obj.notification = obj.notification || {};
        obj.notification.httpCustom = obj.notification.httpCustom || {};
        obj.notification.httpCustom.headers = obj.notification.httpCustom.headers || {};
        obj.notification.httpCustom.url = Config.getConfig().notificationRelay;
        obj.notification.httpCustom.headers.target = endpoint.uri;
    }
    if (endpoint.accept) {
        obj.notification = obj.notification || {};
        obj.notification.httpCustom = obj.notification.httpCustom || {};
        obj.notification.httpCustom.headers = obj.notification.httpCustom.headers || {};
        obj.notification.httpCustom.headers.target_accept = endpoint.accept;
    }
    return obj;
}

/**
 * Amends an NGSI-LD attribute to  NGSI-v2 format
 *
 * @param      {String}   attr       Attribute to be analyzed
 * @return     {Object}              an object containing the attribute in NGSI-LD
 *                                   format
 */

function formatAttribute(attr, isMetadata = false) {
    let obj = {};

    if (Constants.GEOJSON_TYPES.includes(attr.type)) {
        attr.value = {
            type: attr.type,
            coordinates: attr.coordinates
        };
        attr.type = 'GeoProperty';
        delete attr.coordinates;
    }

    // If a concise payload is received, infer
    // the attribute type from the value or value subtype.
    if (!attr.type) {
        if (attr.object) {
            attr.type = 'Relationship';
        } else if (attr.vocab) {
            attr.type = 'VocabProperty';
        } else if (attr.languageMap) {
            attr.type = 'LanguageProperty';
        } else if (attr.json) {
            attr.type = 'JsonProperty';
        } else if (attr.valueList) {
            attr.type = 'ListProperty';
        } else if (attr.objectList) {
            attr.type = 'ListRelationship';
        } else if (attr.value && attr.value.coordinates) {
            attr.type = 'GeoProperty';
        } else if (attr.value) {
            attr.type = 'Property';
        } else {
            attr = {
                value: attr,
                type: 'Property'
            };
        }
    }

    // Obtain the languageMap/vocab/object of the RHS and switch the NGSI-v2
    // format which is value only. Set the attribute Type to match the
    // NGSI-LD attribute type.
    switch (attr.type.toLowerCase()) {
        case 'geoproperty':
            obj = { type: 'geo:json', value: attr.value };
            break;
        case 'jsonproperty':
            obj = { type: 'JsonProperty', value: attr.json };
            break;
        case 'languageproperty':
            obj = { type: 'LanguageProperty', value: attr.languageMap };
            break;
        case 'listproperty':
            obj = { type: 'ListProperty', value: attr.valueList };
            break;
        case 'listrelationship':
            obj = { type: 'ListRelationship', value: attr.objectList };
            break;
        case 'relationship':
            obj = { type: 'Relationship', value: attr.object };
            break;
        case 'vocabproperty':
        case 'vocabularyproperty':
            obj = { type: 'VocabProperty', value: attr.vocab };
            break;
        case 'property':
        default:
            obj = { type: 'Property', value: attr.value };
            break;
    }

    // If valueType is present and being processed, override the
    // type=Property with the preferred type for NGSI-v2
    if (Config.getConfig().valueType && attr.valueType) {
        obj.type = attr.valueType;
    }

    obj.metadata = {};

    Object.keys(attr).forEach(function (key) {
        switch (key) {
            // Basic keys for LD attributes and their
            // values do not need to be reprocessed as metadata
            case 'type':
            case 'value':
            case 'valueList':
            case 'json':
            case 'object':
            case 'objectList':
            case 'languageMap':
            case 'vocab':
                break;
            // Non-reified ValueType has been processed previously
            case 'valueType':
                break;
            // Other Non-reified properties need to have value
            // added for v2 metadata
            case 'observedAt':
                obj.metadata.TimeInstant = {
                    type: 'ISO8601',
                    value: attr[key]
                };

                break;
            case 'unitCode':
                obj.metadata.unitCode = {
                    type: 'Property',
                    value: attr[key]
                };
                break;
            case 'objectType':
                obj.metadata.objectType = {
                    type: 'Property',
                    value: attr[key]
                };
                break;
            case 'expiresAt':
                obj.metadata.dateExpires = {
                    type: 'DateTime',
                    value: attr[key]
                };
                break;
            case 'metadata':
                obj.metadata = attr[key];
                break;
            default:
                if (!isMetadata) {
                    obj.metadata[key] = formatAttribute(attr[key], true);
                }
                break;
        }
    });
    if (isMetadata) {
        delete obj.metadata;
    }
    return obj;
}

function pickOmit(key, picks, omits, pickFlag) {
    if (omits.includes(key)) {
        return false;
        /*  eslint-disable eqeqeq */
    } else if (pickFlag == undefined) {
        return true;
    }
    return picks.includes(key);
}

/**
 * Amends an NGSI-LD  Entity payload to  NGSI-v2format
 *
 */
function formatEntity(json, transformFlags = {}) {
    const picks = transformFlags.pick ? transformFlags.pick.split(',') : [];
    const omits = transformFlags.omit ? transformFlags.omit.split(',') : [];
    const obj = {};
    Object.keys(json).forEach(function (key) {
        if (pickOmit(key, picks, omits, transformFlags.pick)) {
            switch (key) {
                case 'id':
                case 'type':
                    obj[key] = json[key];
                    break;
                case 'expiresAt':
                    obj.dateExpires = {
                        type: 'DateTime',
                        value: json[key]
                    };
                    break;
                case '@context':
                    // context should not be added as a root element for NSGI-v2.
                    break;
                default:
                    obj[key] = formatAttribute(json[key], false);
                    break;
            }
        }
    });
    return obj;
}

exports.formatAttribute = formatAttribute;
exports.formatEntity = formatEntity;
exports.formatSubscription = formatSubscription;
exports.setHeaders = setHeaders;
