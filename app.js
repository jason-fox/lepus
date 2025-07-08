const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const _ = require('lodash');

const nsgiLdRouter = require('./routes/ngsi-ld');
const nsgiv2Router = require('./routes/ngsi-v2');
const nocache = require('nocache');
const Request = require('./lib/request');

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
    headers['x-forwarded-for'] = Request.getClientIp(req);
    headers.accept = 'application/json';
    delete headers['link'];

    if (req.header('NGSILD-Tenant')) {
        res.locals.tenant = req.header('NGSILD-Tenant');
        headers['fiware-service'] = res.locals.tenant;
        delete headers['ngsild-tenant'];
    }

    if (req.query.scopeQ) {
        const scope = req.query.scopeQ;
        const servicePath = scope.startsWith('/') ? scope : '/' + scope;
        res.locals.servicePath = servicePath;
        headers['fiware-servicepath'] = servicePath;
    } else {
        headers['fiware-servicepath'] = '/';
    }

    res.locals.headers = headers;
    next();
});

app.use('/ngsi/v2', nsgiv2Router);
app.use('//ngsi/v2', nsgiv2Router);
app.use('/ngsi-ld/v1', nsgiLdRouter);
app.use('//ngsi-ld/v1', nsgiLdRouter);

app.get('/context.jsonld', (req, res) => {
    return Request.serveContext(req, res);
});

module.exports = app;
