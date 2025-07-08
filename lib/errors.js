const StatusCodes = require('http-status-codes').StatusCodes;
const getReasonPhrase = require('http-status-codes').getReasonPhrase;

const tryCatch = (controller) => async (req, res, next) => {
    try {
        await controller(req, res);
    } catch (error) {
        switch (error.code) {
            case 'ENOTFOUND':
                return res.status(StatusCodes.NOT_FOUND).send({
                    type: 'https://uri.etsi.org/ngsi-ld/errors/ResourceNotFound',
                    title: getReasonPhrase(StatusCodes.NOT_FOUND),
                    message: `${req.path} cannot be found`
                });
                break;
            case 'ETIMEDOUT':
                return res.status(StatusCodes.GATEWAY_TIMEOUT).send({
                    type: 'https://uri.etsi.org/ngsi-ld/errors/GatewayTimeout',
                    title: getReasonPhrase(StatusCodes.GATEWAY_TIMEOUT),
                    message: `${req.path} is did not respond in time`
                });
                break;
            case 'ECONNREFUSED':
                return res.status(StatusCodes.BAD_GATEWAY).send({
                    type: 'https://uri.etsi.org/ngsi-ld/errors/BadGateway',
                    title: getReasonPhrase(StatusCodes.BAD_GATEWAY),
                    message: `${req.path} server is unavailable`
                });
                break;
            default:
                debug(error);

                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
                    type: 'https://uri.etsi.org/ngsi-ld/errors/InternalError',
                    title: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
                    message: `${req.path} caused an error:  ${error.code}`
                });
                break;
        }
        return next(error);
    }
};


function methodNotAllowedHandler(req, res) {
    res.status(StatusCodes.METHOD_NOT_ALLOWED).send({
        type: 'urn:ngsi-ld:MethodNotAllowed',
        title: getReasonPhrase(StatusCodes.METHOD_NOT_ALLOWED),
        message: `${req.method} not supported for ${req.path}`
    });
}

exports.tryCatch = tryCatch;
exports.methodNotAllowedHandler = methodNotAllowedHandler;