/*
 * Copyright 2023 -  FIWARE Foundation e.V.
 *
 * This file is part of NGSI-LD to NGSI-v2 Adapter
 *
 */

//const _ = require('lodash');

const Constants = require('../lib/constants');
const _ = require('lodash');
const INCLUDE_VALUE_TYPE = process.env.INCLUDE_VALUE_TYPE || null;

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
        obj.notification.httpCustom.url = Constants.NOTIFICATION_RELAY_URL;
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

function formatAttribute(attr, transformFlags = {}) {
    let obj = {};

    switch (attr.type.toLowerCase()) {
        // GeoProperties
        case 'geoproperty':
            obj = { type: 'geo:json', value: attr.value };
            break;
        // ListProperties
        case 'listproperty':
            obj = { type: 'ListProperty', value: attr.valueList };
            break;
        // JSONProperties
        case 'jsonproperty':
            obj = { type: 'JsonProperty', value: attr.json };
            break;
        // Relationships
        case 'relationship':
            obj = { type: 'Relationship', value: attr.object };
            break;
        // ListRelationships
        case 'listrelationship':
            obj = { type: 'ListRelationship', value: attr.objectList };
            break;
        // LanguageProperties
        case 'languageproperty':
            obj = { type: 'LanguageProperty', value: attr.languageMap };
            break;
        // VocabularyProperties
        case 'vocabularyproperty':
            obj = { type: 'VocabularyProperty', value: attr.vocab };
            break;
        // Properties
        case 'property':
        default:
            obj = { type: 'Property', value: attr.value };

            if (INCLUDE_VALUE_TYPE && attr.valueType) {
                obj.type = attr.valueType;
            }
            break;
    }

    obj.metadata = {};

    Object.keys(attr).forEach(function (key) {
        switch (key) {
            case 'type':
            case 'value':
            case 'valueType':
            case 'valueList':
            case 'json':
            case 'object':
            case 'objectList':
            case 'languageMap':
            case 'vocab':
                break;
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
            default:
                obj.metadata[key] = formatAttribute(attr[key]);
                break;
        }
    });
    return obj;
}

/**
 * Amends an NGSI-LD  payload to  NGSI-v2format
 *
 */
function formatEntity(json) {
    const obj = {};
    Object.keys(json).forEach(function (key) {
        switch (key) {
            case 'id':
            case 'type':
                obj[key] = json[key];
                break;
            case '@context':
                // context should not be added as a root element for NSGI-v2.
                break;
            default:
                obj[key] = formatAttribute(json[key]);
                break;
        }
    });
    return obj;
}

exports.formatAttribute = formatAttribute;
exports.formatEntity = formatEntity;
exports.formatSubscription = formatSubscription;
