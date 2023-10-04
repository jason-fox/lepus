const express = require('express');
const router = express.Router();
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const _ = require('lodash');

const indexRouter = require('./routes/index');
const nocache = require('nocache');
const Constants = require('./lib/constants');

const app = express();
app.disable('x-powered-by');
app.set('etag', false);

app.use(logger('dev'));
const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/*+json' }));
// Never cache
app.use(nocache());

app.use(function (req, res, next) {
    const headers = _.clone(req.headers);
    headers['x-forwarded-for'] = Constants.getClientIp(req);
    headers.accept = 'application/json';
    delete headers['link'];

    if (req.header('NGSILD-Tenant')) {
    	res.locals.tenant = req.header('NGSILD-Tenant');
        headers['fiware-service'] = res.locals.tenant;
    	delete headers['ngsild-tenant'];
    }

    if ( req.header('NGSILD-Path')) {
    	res.locals.servicePath = req.header('NGSILD-Path');
        headers['fiware-servicepath'] = res.locals.servicePath;
        delete headers['ngsild-path'];
    }

    res.locals.headers = headers;
    next();
});

app.use('/ngsi-ld/v1', indexRouter);
app.use('//ngsi-ld/v1', indexRouter);

module.exports = app;
