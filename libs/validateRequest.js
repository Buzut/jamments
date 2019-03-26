const qs = require('querystring');
const v8n = require('v8n');
const BadRequestError = require('./badRequestError');

/**
 * Make sure post is urlencoded
 * @param { Object } req
 * @return { Promise }
 */
function validateReqHeaders(req) {
    const { headers } = req;

    if (!headers || !headers['content-type'] || headers['content-type'] !== 'application/x-www-form-urlencoded') {
        return Promise.reject(new BadRequestError('Content-type must be "application/x-www-form-urlencoded"'));
    }

    return Promise.resolve(req);
}

/**
 * Make sure body isn't larger than a MB
 * @param { Stream } body
 * @return { Null | BadRequestError } null if everything's fine, Err otherwise
 */
function validateReqLength(body) {
    // 1e6 ± 1MB
    if (body.length > 1e6) return new BadRequestError('POST content can’t exceed 1MB', 413);
    return null;
}

/**
 * Parse data from request object and validate its content
 * @param { Object } req
 * @return { Promise }
 */
function parseReqData(req) {
    let body = '';

    return new Promise((resolve, reject) => {
        req.on('data', (data) => {
            body += data;

            const reqTooBigErr = validateReqLength(body);
            if (reqTooBigErr) reject(reqTooBigErr);
        });

        req.on('end', () => {
            resolve(qs.parse(body));
        });
    });
}

/**
 * Verify that no post param is missing
 * @param { Object } req
 * @param { Array.<String|Object> } paramsList
 * @return { Promise }
 * @return { Promise.resolve<Object> }
 * @return { Promise.reject<BadRequestError> }
 */
function validateRequest(req, paramsList) {
    return validateReqHeaders(req)
    .then(parseReqData)
    .then((post) => {
        const wrongTypeErr = (paramName, paramType) => Promise.reject(new BadRequestError(`${paramName} param must be a ${paramType}`));
        const validatorFnErr = msg => Promise.reject(new BadRequestError(msg));
        const validatorFnErrDefaultMsg = paramName => `${paramName} failed to validate`;

        for (const param of paramsList) {
            let paramName;
            let paramType;
            let paramCoerce;
            let paramOptional;
            let validatorFn;
            let validatorFailMsg;
            let customValidatorFn;

            // define if string or object
            if (v8n().object().test(param)) {
                const paramKeys = Object.keys(param);

                if (paramKeys.length === 1) {
                    [paramName] = paramKeys;
                    paramType = param[paramName];
                }

                else {
                    paramName = param.name;
                    paramType = param.type;
                    paramCoerce = param.coerce;
                    paramOptional = param.optional;
                    validatorFn = param.validator;
                    validatorFailMsg = param.failMsg;
                    customValidatorFn = param.customValidator;

                    if (!paramName) throw new Error('Parameters object that have more than { paramName: paramType } must have a "name" property');
                }
            }

            else paramName = param;

            if (paramCoerce && (paramType === 'integer' || paramType === 'number')) post[paramName] = Number(post[paramName]);
            else if (paramCoerce && paramType === 'boolean') post[paramName] = (post[paramName] === 'true' || post[paramName] === true);
            const paramValue = post[paramName];

            // validate presence
            if (!paramValue && !v8n().boolean(paramValue) && !paramOptional) return Promise.reject(new BadRequestError(`Missing ${paramName} param`));
            if (!paramValue && paramOptional) continue;

            // validate type
            if (paramType) {
                if (paramType === 'string' && !v8n().string().test(paramValue)) return wrongTypeErr(paramName, paramType);
                if (paramType === 'number' && !v8n().number().test(paramValue)) return wrongTypeErr(paramName, paramType);
                if (paramType === 'integer' && !v8n().number().test(paramValue)) return wrongTypeErr(paramName, paramType);
                if (paramType === 'boolean' && !v8n().boolean().test(paramValue)) return wrongTypeErr(paramName, paramType);
            }

            // custom validation
            if (validatorFn && !validatorFn(v8n()).test(paramValue)) {
                if (validatorFailMsg) return validatorFnErr(validatorFailMsg);
                return validatorFnErr(validatorFnErrDefaultMsg(paramName));
            }

            if (customValidatorFn && !customValidatorFn(paramValue)) {
                if (validatorFailMsg) return validatorFnErr(validatorFailMsg);
                return validatorFnErr(validatorFnErrDefaultMsg(paramName));
            }
        }

        return Promise.resolve(post);
    });
}

module.exports = validateRequest;
