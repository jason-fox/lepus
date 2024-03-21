/*
 * Copyright 2023 -  FIWARE Foundation e.V.
 *
 * This file is part of NGSI-LD to NGSI-v2 Adapter
 *
 */

const debug = require('debug')('adapter:ngsi-ld');
const Config = require('../lib/configService');

const _ = require('lodash');
const moment = require('moment-timezone');
const { v4: uuidv4 } = require('uuid');
const Constants = require('../lib/constants');
const URN_PREFIX = 'urn:ngsi-ld:';
const semver = require('semver');

/**
 * Amends an NGSIv2 attribute to NGSI-LD format
 * All native JSON types are respected and cast as Property values
 * Relationships must be give the type relationship
 *
 * @param      {String}   attr       Attribute to be analyzed
 * @return     {Object}              an object containing the attribute in NGSI-LD
 *                                   format
 */

function formatAttribute(attr, transformFlags = {}) {
    //  Deliberate double equals to include undefined.
    /*  eslint-disable eqeqeq */
    if (attr.value == null || Number.isNaN(attr.value)) {
        return undefined;
    }
    let obj = { type: 'Property', value: attr.value };

    const version = `${transformFlags.version || Config.getConfig().version}.1`;
    switch (attr.type.toLowerCase()) {
        // Properties
        case 'property':
            //obj.valueType = semver.gt(version, '1.8.0') ? attr.type : undefined;
            break;

        // Temporal Properties
        case 'datetime':
            if (Config.getConfig().valueType && semver.gt(version, '1.8.0')) {
                obj.value = moment.tz(attr.value, 'Etc/UTC').toISOString();
                obj.valueType = 'DateTime';
            } else {
                obj.value = {
                    '@type': 'DateTime',
                    '@value': moment.tz(attr.value, 'Etc/UTC').toISOString()
                };
            }
            break;
        case 'date':
            if (Config.getConfig().valueType && semver.gt(version, '1.8.0')) {
                obj.value = moment.tz(attr.value, 'Etc/UTC').toISOString();
                obj.valueType = 'Date';
            } else {
                obj.value = {
                    '@type': 'Date',
                    '@value': moment.tz(attr.value, 'Etc/UTC').format(moment.HTML5_FMT.DATE)
                };
            }
            break;
        case 'time':
            if (Config.getConfig().valueType && semver.gt(version, '1.8.0')) {
                obj.value = moment.tz(attr.value, 'Etc/UTC').toISOString();
                obj.valueType = 'Time';
            } else {
                obj.value = {
                    '@type': 'Time',
                    '@value': moment.tz(attr.value, 'Etc/UTC').format(moment.HTML5_FMT.TIME_SECONDS)
                };
            }
            break;

        case 'geoproperty':
        case 'point':
        case 'geo:point':
        case 'geo:json':
        case 'linestring':
        case 'geo:linestring':
        case 'polygon':
        case 'geo:polygon':
        case 'multipoint':
        case 'geo:multipoint':
        case 'multilinestring':
        case 'geo:multilinestring':
        case 'multipolygon':
        case 'geo:multipolygon':
            // GeoProperties
            obj.type = 'GeoProperty';
            obj.value = attr.value;
            break;
        case 'jsonproperty':
            if (semver.gt(version, '1.7.0')) {
                obj.type = 'JsonProperty';
                obj.json = attr.value;
                delete obj.value;
            }
            break;
        case 'languageproperty':
            if (semver.gt(version, '1.5.0')) {
                obj.type = 'LanguageProperty';
                obj.languageMap = attr.value;
                delete obj.value;
            }
            break;
        case 'listproperty':
            if (semver.gt(version, '1.7.0')) {
                obj.type = 'ListProperty';
                obj.valueList = attr.value;
                delete obj.value;
            }
            break;
        case 'listrelationship':
            if (semver.gt(version, '1.7.0')) {
                obj.type = 'ListRelationship';
                obj.objectList = attr.value;
                delete obj.value;
            }
            break;
        case 'relationship':
            obj.type = 'Relationship';
            obj.object = attr.value;
            delete obj.value;
            break;
        case 'vocabularyproperty':
            if (semver.gt(version, '1.7.0')) {
                obj.type = 'VocabularyProperty';
                obj.vocab = attr.value;
                delete obj.value;
            }
            break;
        default:
            // Property
            obj.value = attr.value;
            if (Config.getConfig().valueType && semver.gt(version, '1.8.0')){
                obj.valueType = (attr.type != "Property") ? attr.type : undefined;
            }
            //obj.valueType = Config.getConfig().valueType && semver.gt(version, '1.8.0') ? attr.type : undefined;
            break;
    }

    if (attr.metadata) {
        let timestamp;
        Object.keys(attr.metadata).forEach(function (key) {
            switch (key) {
                case 'TimeInstant':
                    timestamp = attr.metadata[key].value;
                    if (timestamp === Constants.ATTRIBUTE_DEFAULT || !moment(timestamp).isValid()) {
                        obj.observedAt = Constants.DATETIME_DEFAULT;
                    } else {
                        obj.observedAt = moment.tz(timestamp, 'Etc/UTC').toISOString();
                    }

                    break;
                // Non-reified properties need to have value
                // extracted from v2 metadata
                case 'unitCode':
                    obj.unitCode = attr.metadata[key].value;
                    break;
                case 'objectType':
                    obj.objectType = attr.metadata[key].value;
                    break;
                case 'dateCreated':
                    obj.createdAt = moment.tz(attr.metadata[key].value, 'Etc/UTC').toISOString();
                    break;
                case 'dateModified':
                    obj.modifiedAt = moment.tz(attr.metadata[key].value, 'Etc/UTC').toISOString();
                    break;
                default:
                    obj[key] = formatAttribute(attr.metadata[key]);
            }
        });
        delete obj.TimeInstant;
    }
    if (transformFlags.sysAttrs) {
        obj.modifiedAt = obj.modifiedAt || Constants.DATETIME_DEFAULT;
        obj.createdAt = obj.createdAt || Constants.DATETIME_DEFAULT;
    }
    if (transformFlags.concise) {
        delete obj.type;
        if (obj.value && _.isEmpty(attr.metadata) && !transformFlags.sysAttrs) {
            obj = obj.value;
        }
    }

    delete obj.metadata;
    return obj;
}

/**
 * Amends an NGSIv2 attribute type to an NGSI-LD  attribute type
 * This is  mainly GeoJSON processing and just being concistent
 * with capitalisation
 */

function formatType(type) {
    let ldType = 'Property';

    switch (type.toLowerCase()) {
        // GeoProperties
        case 'geoproperty':
        case 'point':
        case 'geo:point':
        case 'geo:json':
        case 'linestring':
        case 'geo:linestring':
        case 'polygon':
        case 'geo:polygon':
        case 'multipoint':
        case 'geo:multipoint':
        case 'multilinestring':
        case 'geo:multilinestring':
        case 'multipolygon':
        case 'geo:multipolygon':
            ldType = 'GeoProperty';
            break;
        case 'jsonproperty':
            ldType = 'JsonProperty';
            break;
        case 'languageproperty':
            ldType = 'LanguageProperty';
            break;
        case 'listproperty':
            ldType = 'ListProperty';
            break;
        case 'listrelationship':
            ldType = 'ListRelationship';
            break;
        case 'relationship':
            ldType = 'Relationship';
            break;
        case 'vocabularyproperty':
            ldType = 'VocabularyProperty';
            break;
        default:
            ldType = 'Property';
            break;
    }
    return ldType;
}

/**
 * Decides whether to pick/omit an attribute
 */

function pickOmit(key, picks, omits, pickFlag) {
    if (omits.includes(key)) {
        return false;
    } else if (pickFlag == undefined) {
        return true;
    }
    return picks.includes(key);
}

/**
 * Amends an NGSIv2 payload to NGSI-LD format
 *
 * @param      {Object}   value       JSON to be converted
 * @return     {Object}               NGSI-LD payload
 */

function formatEntity(json, isJSONLD, transformFlags = {}) {
    const picks = transformFlags.pick ? transformFlags.pick.split(',') : [];
    const omits = transformFlags.omit ? transformFlags.omit.split(',') : [];

    const obj = {};
    if (isJSONLD) {
        obj['@context'] = [Config.getConfig().userContext, Config.getConfig().coreContext];
    }

    let id;
    const modifiedAts = [Constants.DATETIME_DEFAULT];
    const createdAts = [moment().toISOString()];
    Object.keys(json).forEach(function (key) {
        if (pickOmit(key, picks, omits, transformFlags.pick)) {
            switch (key) {
                case 'id':
                    id = json[key];
                    obj[key] = id;
                    if (!id.startsWith(URN_PREFIX)) {
                        obj[key] = URN_PREFIX + json.type + ':' + id;
                        debug('Amending id to a valid URN: %s', obj[key]);
                    }

                    break;
                case 'type':
                    obj[key] = json[key];

                    break;
                case 'TimeInstant':
                    // Timestamp should not be added as a root
                    // element for NSGI-LD.
                    break;
                default:
                    obj[key] = formatAttribute(json[key], transformFlags);
                    if (transformFlags.sysAttrs) {
                        if (obj[key].modifiedAt) {
                            modifiedAts.push(obj[key].modifiedAt);
                        }
                        if (obj[key].createdAt) {
                            modifiedAts.push(obj[key].createdAt);
                        }
                    }
                    break;
            }
        }
    });

    if (transformFlags.sysAttrs) {
        obj.modifiedAt = obj.modifiedAt || _.max(modifiedAts);
        obj.createdAt = obj.createdAt || _.min(createdAts);
    }
    delete obj.TimeInstant;
    return obj;
}

/**
 * Amends an NGSI-LD concise entity attribute to
 * NGSI-LD normalized Entity attribute
 *
 */
function normalizeAttribute(attr) {
    const obj = {};

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
            attr.type = 'VocabularyProperty';
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
                value: _.clone(attr),
                type: 'Property'
            };
        }
    }

    Object.keys(attr).forEach(function (key) {
        switch (key) {
            case 'type':
            case 'value':
            case 'valueList':
            case 'vocab':
            case 'languageMap':
            case 'object':
            case 'objectList':
            case 'json':
            case 'unitCode':
            case 'valueType':
            case 'objectType':
            case 'observedAt':
                obj[key] = attr[key];
                break;
            default:
                obj[key] = normalizeAttribute(attr[key]);
                break;
        }
    });
    return obj;
}

/**
 * Amends an NGSI-LD concise entitu to  NGSI-LD normalized Entity
 *
 */
function normalizeEntity(json) {
    const obj = {};
    Object.keys(json).forEach(function (key) {
        switch (key) {
            case 'id':
            case 'type':
            case 'scope':
                obj[key] = json[key];
                break;
            default:
                obj[key] = normalizeAttribute(json[key]);
        }
    });
    return obj;
}

/**
 * Amends an NGSI-v2 query to  NGSI-LD query format.
 * This adds quote marks around strings.
 *
 */
function formatQuery(q) {
    if (!q) {
        return undefined;
    }
    const params = [];

    q.split(';').forEach((input) => {
        if (input.includes('==')) {
            const s = input.split('==');
            const key = s[0];
            const value = s[1];
            if (isNaN(value)) {
                params.push(`${key}==%22${value}%22`);
            } else {
                params.push(input);
            }
        } else {
            params.push(input);
        }
    });
    return params.join(';');
}

/**
 * Amends an NGSI-v2 subscription payload to  NGSI-LD subscription format
 *
 */
function formatSubscription(json, isJSONLD) {
    const condition = json.subject.condition || {};
    const expression = condition.expression || {};
    const notification = json.notification || {};

    const entities = _.map(json.subject.entities, (entity) => {
        if (entity.idPattern === '.*') {
            delete entity.idPattern;
        }
        return entity;
    });

    const obj = {
        id: URN_PREFIX + 'Subscription:' + json.id,
        type: 'Subscription',
        description: json.description,
        entities,
        watchedAttributes: condition.attrs,
        q: formatQuery(expression.q),
        notification: {
            attributes: notification.attrs,
            format: notification.attrsFormat,
            endpoint: {
                uri: notification.httpCustom.headers.target,
                accept: 'application/json'
            }
        }
    };

    return appendContext(obj, isJSONLD);
}

/**
 * Amends an NGSI-v2 type payload to  NGSI-LD EntityTypeList format
 *
 */
function formatEntityTypeList(json, isJSONLD) {
    const typeList = _.map(json, (type) => {
        return type.type;
    });

    const obj = {
        id: 'urn:ngsi-ld:EntityTypeList:' + uuidv4(),
        type: 'EntityTypeList',
        typeList
    };

    return appendContext(obj, isJSONLD);
}

/**
 * Amends an NGSI-v2 type payload to  NGSI-LD EntityTypeInformation format
 *
 */
function formatEntityTypeInformation(json, isJSONLD, typeName) {
    const attributeDetails = [];

    _.forEach(json.attrs, (value, key) => {
        attributeDetails.push({
            id: key,
            type: 'Attribute',
            attributeName: key,
            attributeTypes: _.map(value.types, (type) => {
                return formatType(type);
            })
        });
    });

    const obj = {
        id: 'urn:ngsi-ld:EntityTypeInformation:' + uuidv4(),
        type: 'EntityTypeInformation',
        typeName,
        entityCount: json.count,
        attributeDetails
    };

    return appendContext(obj, isJSONLD);
}

/**
 * Amends an NGSI-v2 type payload to  NGSI-LD EntityAttributeList format
 *
 */
function formatEntityAttributeList(json, isJSONLD) {
    const attributeList = [];

    _.map(json, (type) => {
        _.forEach(type.attrs, (value, key) => {
            attributeList.push(key);
        });
    });

    const obj = {
        id: 'urn:ngsi-ld:EntityAttributeList:' + uuidv4(),
        type: 'EntityAttributeList',
        attributeList: _.uniq(attributeList)
    };

    return appendContext(obj, isJSONLD);
}

function formatContextSourceIdentity(json, isJSONLD) {
    const text = json.orion.uptime.replaceAll(/[a-z ]/g, '');
    const parts = text.split(',');
    const obj = {
        id: 'urn:ngsi-ld:ContextSourceIdentity:' + uuidv4(),
        type: 'ContextSourceIdentity',
        contextSourceExtras: json.orion,
        contextSourceUptime: `P${parts[0]}DT${parts[1]}H${parts[2]}M${parts[3]}S`,
        contextSourceTimeAt: moment().toISOString(),
        contextSourceAlias: Config.getConfig().alias
    };

    if (isJSONLD) {
        obj['@context'] = Config.getConfig().coreContext;
    }

    return obj;
}

/**
 * Amends an NGSI-v2 type payload to  NGSI-LD EntityAttribute format
 *
 */
function formatEntityAttribute(json, isJSONLD, attributeName) {
    let attributeCount = 0;
    let attributeTypes = [];
    const typeNames = [];

    const filtered = _.filter(json, function (o) {
        return o.attrs[attributeName];
    });

    _.map(filtered, (type) => {
        attributeCount += type.count;
        typeNames.push(type.type);
        attributeTypes.push(type.attrs[attributeName].types);
    });

    attributeTypes = _.uniq(_.flatten(attributeTypes));

    const obj = {
        id: attributeName,
        type: 'Attribute',
        attributeCount,
        attributeTypes: _.map(attributeTypes, (type) => {
            return formatType(type);
        }),
        typeNames,
        attributeName
    };

    return appendContext(obj, isJSONLD);
}

function appendContext(obj, isJSONLD) {
    if (isJSONLD) {
        obj['@context'] = [Config.getConfig().userContext, Config.getConfig().coreContext];
    }
    return obj;
}

exports.formatAttribute = formatAttribute;
exports.normalizeEntity = normalizeEntity;
exports.formatEntity = formatEntity;
exports.formatSubscription = formatSubscription;
exports.formatEntityTypeList = formatEntityTypeList;
exports.formatEntityTypeInformation = formatEntityTypeInformation;
exports.formatEntityAttributeList = formatEntityAttributeList;
exports.formatEntityAttribute = formatEntityAttribute;
exports.formatContextSourceIdentity = formatContextSourceIdentity;
exports.appendContext = appendContext;
