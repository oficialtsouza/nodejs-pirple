const helpers = require('../helpers');
const _data = require('../data');
const config = require('../../config');
const checks = (req, callback) => {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(req.method) > -1) {
        _checks[req.method](req, callback);
    } else {
        callback(405)
    }
}

_checks = {};


//Checks - post
//Required data: protocol, url, method, successCode, timeoutSeconds
//Optional data:none
_checks.post = (data, callback) => {

    const protocol = typeof(data.payload.protocol) == "string" && ['http', 'https'].indexOf(data.payload.protocol.trim()) > -1 ? data.payload.protocol.trim() : false;

    const url = typeof(data.payload.url) == "string" && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;

    const method = typeof(data.payload.method) == "string" && ['get', 'put', "delete", "post"].indexOf(data.payload.method.trim()) > -1 ? data.payload.method.trim() : false;

    const successCodes = typeof(data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;


    const timeoutSeconds = typeof(data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

    if (protocol && url && method && successCodes && timeoutSeconds) {
        //Get the token from the headers
        const token = typeof(data.headers.token) == "string" ? data.headers.token : false;

        _data.read("tokens", token, (err, tokenData) => {
            if (!err && tokenData) {
                const userPhone = tokenData.phone;
                _data.read('users', userPhone, (err, userData) => {
                    if (!err && userData) {
                        let userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : []
                        if (userChecks.length < config.maxChecks) {
                            const checkId = helpers.createRandomString(20);

                            const checkObject = {
                                id: checkId,
                                userPhone,
                                protocol,
                                url,
                                method,
                                successCodes,
                                timeoutSeconds
                            }

                            _data.create('checks', checkId, checkObject, (err) => {
                                if (!err) {
                                    userData.checks = userChecks
                                    userData.checks.push(checkId);

                                    //Save the new userData
                                    _data.update('users', userPhone, userData, (err) => {
                                        if (!err) {
                                            callback(200, checkObject);
                                        } else {
                                            callback(500, { Error: "Could not update user" })
                                        }
                                    });
                                } else {
                                    callback(500, { Error: 'Could not create check' })
                                }
                            });
                        } else {
                            callback(400, { Error: `Max number of ${config.maxChecks} checks` });
                        }
                    } else {
                        callback(403);
                    }
                });
            } else {
                callback(403);
            }
        });
    } else {
        callback(400, { Error: "Missing required fields or inputs are invalid" })
    }
};

//Checks - get
//required data : id
_checks.get = (data, callback) => {
    const id = typeof(data.queryObject.id == 'string') && data.queryObject.id.trim().length == 20 ? data.queryObject.id.trim() : false;

    if (id) {
        //Look up the check
        _data.read('checks', id, (err, checkData) => {
            if (!err && checkData) {
                const token = typeof(data.headers.token) == "string" ? data.headers.token : false;

                _checks.verifyToken(token, checkData.userPhone, (valid) => {
                    if (valid) {
                        callback(200, checkData)
                    } else {
                        callback(403, { Error: "Missing required token in header or token is invalid" })
                    }
                });

            } else {
                callback(403);
            }

        });

    } else {
        callback(400, { Error: "Missing id in query" })
    }
}


_checks.verifyToken = function(id, phone, callback) {

    _data.read('tokens', id, (err, data) => {
        if (!err && data) {
            if (phone === data.phone && data.expires > Date.now()) {
                callback(true)
            } else { callback(false); }
        } else {
            callback(false);
        }
    });
};

_checks.put = (data, callback) => {

    const id = typeof(data.payload.id == 'string') && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;

    const protocol = typeof(data.payload.protocol) == "string" && ['http', 'https'].indexOf(data.payload.protocol.trim()) > -1 ? data.payload.protocol.trim() : false;

    const url = typeof(data.payload.url) == "string" && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;

    const method = typeof(data.payload.method) == "string" && ['get', 'put', "delete", "post"].indexOf(data.payload.method.trim()) > -1 ? data.payload.method.trim() : false;

    const successCodes = typeof(data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.method : false;


    const timeoutSeconds = typeof(data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

    if (id) {
        //check to make sure one or more optional fields has been sent
        if (protocol || url || method || successCodes || timeoutSeconds) {
            _data.read('checks', id, (err, checkData) => {

                if (!err && checkData) {
                    const token = typeof(data.headers.token) == "string" ? data.headers.token : false;

                    _checks.verifyToken(token, checkData.userPhone, (valid) => {
                        if (valid) {
                            if (protocol) {
                                checkData.protocol = protocol;
                            }

                            if (url) {
                                checkData.url = url;
                            }

                            if (method) {
                                checkData.method = method;
                            }

                            if (successCodes) {
                                checkData.successCodes = successCodes;
                            }

                            if (timeoutSeconds) {
                                checkData.timeoutSeconds = timeoutSeconds;
                            }

                            _data.update('checks', id, checkData, (err) => {
                                if (!err) { callback(200); } else {
                                    callback(500);
                                }
                            });

                        } else {
                            callback(403, { Error: "Missing required token in header or token is invalid" })
                        }
                    });
                } else {
                    callback(404);
                }
            });
        }

    } else {
        callback(400, { Error: "Missing id in body" })
    }

}


//Checks - delete
_checks.delete = (data, callback) => {
    const id = typeof(data.queryObject.id == 'string') && data.queryObject.id.trim().length == 20 ? data.queryObject.id.trim() : false;

    if (id) {
        _data.read('checks', id, (err, checkData) => {
            if (!err && checkData) {
                const token = typeof(data.headers.token) == "string" ? data.headers.token : false;
                _checks.verifyToken(token, checkData.userPhone, (valid) => {
                    if (valid) {
                        //Delete the check data
                        _data.delete('checks', id, (err) => {
                            if (!err) {
                                _data.read('users', checkData.userPhone, (err, userData) => {
                                    if (!err && userData) {
                                        let userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];

                                        //Remove the deleted check from the lists fo checks
                                        const checkPos = userChecks.indexOf(id)
                                        if (checkPos > -1) {
                                            userChecks.splice(checkPos, 1)
                                            userData.checks = userChecks;
                                            _data.update('users', checkData.userPhone, userData, (err) => {
                                                if (!err) {
                                                    callback(200, userData);
                                                } else {
                                                    callback(500, { Error: "Could not update user" })
                                                }
                                            });
                                        } else {
                                            callback(500, { Error: 'Check ID not found' });
                                        }
                                    } else {
                                        callback(404, { Error: "The ckeck's owner no longer exists" })
                                    }
                                });

                            } else { callback(500, { Error: 'Could not delete check' }); }
                        });

                    } else {
                        callback(403, { Error: "Missing required token in header or token is invalid" })
                    }
                });
            } else {
                callback(404, { Error: 'Check not found' });
            }
        });
    } else {
        callback(400, { Error: "Missing query item 'id'" });
    }

};
module.exports = checks