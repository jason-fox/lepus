const debug = require('debug')('adapter:routes');
const express = require('express');
const router = express.Router();
const notify = require('../controllers/notify');
const methodNotAllowedHandler = require('../lib/errors').methodNotAllowedHandler;
const tryCatch = require('../lib/errors').tryCatch;



router.route('/notify').post(tryCatch(notify.notifyAsV2)).all(methodNotAllowedHandler);

module.exports = router;