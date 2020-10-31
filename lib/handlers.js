const _data = require("./data");
const helpers = require("./helpers");
const checks = require('./handlers/checks');
var handler = {};

handler.checks = checks;

handler.notFound = (data, callback) => {
    callback(404);
};

handler.user = (data, callback) => {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handler._user[data.method](data, callback);
    } else {
        callback(405)
    }

}

handler._user = {};

handler._user.post = (data, callback) => {
    // Check that all required fields are filled out
    const firstName = typeof(data.payload.firstName) == "string" && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;

    const lastName = typeof(data.payload.lastName) == "string" && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;

    const phone = typeof(data.payload.phone) == "string" && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

    const password = typeof(data.payload.password) == "string" && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    const tosAgreement = typeof(data.payload.tosAgreement) == "boolean" && data.payload.tosAgreement == true ? true : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        _data.read('users', phone, (err, data) => {
            if (err) {

                hashedPassword = helpers.hash(password);
                if (hashedPassword) {
                    _data.create('users', phone, { firstName, lastName, phone, hashedPassword: hashedPassword, tosAgreement }, (err) => {
                        if (err) {
                            callback(400, { "Error": err })
                        } else {
                            callback(200, { firstName, lastName, phone, password, tosAgreement })
                        }
                    });
                } else {
                    callback(400, { "Error": "could not hash passwrod" })
                }

            } else {
                callback(400, { Error: "A user with that phone number already exist" });
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required fields' })
    }

};

handler._user.get = (data, callback) => {
    const phone = typeof(data.queryObject.phone == 'string') && data.queryObject.phone.trim().length == 10 ? data.queryObject.phone.trim() : false;

    if (phone) {

        const token = typeof(data.headers.token) == "string" ? data.headers.token : false;

        handler._tokens.verifyToken(token, phone, (valid) => {
            if (valid) {
                _data.read('users', phone, (err, data) => {
                    if (err) {
                        callback(400, { Error: "User not found" })
                    } else {
                        delete data.hashedPassword;
                        callback(200, data)
                    }
                });
            } else {
                callback(403, { Error: "Missing required token in header or token is invalid" })
            }
        });



    } else {
        callback(400, { Error: "Missing phone number" })
    }
};

handler._user.put = (data, callback) => {
    const phone = typeof(data.payload.phone) == "string" && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

    const firstName = typeof(data.payload.firstName) == "string" && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;

    const lastName = typeof(data.payload.lastName) == "string" && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;

    const password = typeof(data.payload.password) == "string" && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if (phone) {
        if (firstName || lastName || password) {
            const token = typeof(data.headers.token) == "string" ? data.headers.token : false;
            handler._tokens.verifyToken(token, phone, (valid) => {
                if (valid) {

                    _data.read('users', phone, (err, data) => {
                        if (err) {
                            callback(400, { Error: "Unable to find requested user" });
                        } else {
                            if (firstName) {
                                data.firstName = firstName;
                            }
                            if (lastName) {
                                data.lastName = lastName;
                            }
                            if (password) {
                                data.hashedPassword = helpers.hash(password);
                            }
                            _data.update('users', phone, data, (err) => {
                                if (err) {
                                    callback(500, { 'Error': "Internal server error" });
                                } else {
                                    callback(200);
                                }
                            });
                        }
                    });
                } else {
                    callback(403, { Error: "Missing required token in header or token is invalid" })
                }

            })

        }
    } else {
        callback(400, { Error: "missing required field 'phone'" });
    }


};

handler._user.delete = (data, callback) => {
    const phone = typeof(data.queryObject.phone == 'string') && data.queryObject.phone.trim().length == 10 ? data.queryObject.phone.trim() : false;

    if (phone) {

        const token = typeof(data.headers.token) == "string" ? data.headers.token : false;
        handler._tokens.verifyToken(token, phone, (valid) => {
            if (valid) {
                _data.read('users', phone, (err, data) => {
                    if (err) {
                        callback(400, { Error: "user not found" });
                    } else {
                        _data.delete('users', phone, (err) => {
                            if (err) { callback(500, { Error: "Could not delete the specified user" }) } else {
                                callback(200);
                            }
                        });
                    }
                });

            } else {
                callback(403, { Error: "Missing required token in header or token is invalid" })
            }
        });

    } else {
        callback(400, { Error: "Missing query item 'phone'" });
    }

};


handler.token = (data, callback) => {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handler._tokens[data.method](data, callback);
    } else {
        callback(405)
    }

}

handler._tokens = {}

handler._tokens.post = (data, callback) => {
    const phone = typeof(data.payload.phone) == "string" && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

    const password = typeof(data.payload.password) == "string" && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if (password && phone) {
        _data.read('users', phone, (err, data) => {
            if (!err && data) {
                if (data.hashedPassword === helpers.hash(password)) {
                    const token = helpers.createRandomString(20);
                    const expirationDate = Date.now() + 1000 * 60 * 60;
                    const tokenObject = {
                        phone,
                        id: token,
                        expires: expirationDate
                    }

                    _data.create('tokens', token, tokenObject, (err) => {
                        if (err) {
                            callback(400, { Error: "internal error" });
                        } else {
                            callback(200, { token: tokenObject });
                        }
                    });
                } else {
                    callback(400, { Error: 'Password missmatch' });
                }
            } else { callback(400, { Error: 'Could not find user' }); }
        });
    } else {
        callback(400, { Error: "Missing required fields" });
    }

};


handler._tokens.get = (data, callback) => {
    const id = typeof(data.queryObject.id == 'string') && data.queryObject.id.trim().length == 20 ? data.queryObject.id.trim() : false;
    if (id) {
        _data.read('tokens', id, (err, data) => {
            if (err) {
                callback(400, { Error: "token not found" })
            } else {
                callback(200, data)
            }
        });
    } else {
        callback(400, { Error: "Missing id in query string" })
    }

};

// Tokens - put
// Required data : id, extend
handler._tokens.put = (data, callback) => {
    const id = typeof(data.payload.id) == "string" && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;

    const extend = typeof(data.payload.extend) == "boolean" && data.payload.extend == true ? true : false;
    if (id && extend) {

        _data.read('tokens', id, (err, data) => {
            if (!err && data) {
                //Check if token isn't already expired
                if (data.expires > Date.now()) {
                    data.expires = Date.now() + 1000 * 60 * 60;

                    _data.update('tokens', id, data, (err) => {
                        if (!err) {
                            callback(200);
                        } else {
                            callback(500, { Error: "Could Not update token" });
                        }
                    });
                } else {
                    allback(400, { Error: 'Token as already expired' })
                }
            } else {
                callback(400, { Error: 'Token not found' })
            }
        });

    } else {
        callback(400, { Error: 'Missing required fields or fields are invalid' })
    }

};

handler._tokens.delete = (data, callback) => {
    const id = typeof(data.queryObject.id == 'string') && data.queryObject.id.trim().length == 20 ? data.queryObject.id.trim() : false;

    if (id) {
        _data.read('tokens', id, (err, data) => {
            if (err) {
                callback(400, { Error: "token not found" });
            } else {
                _data.delete('tokens', id, (err) => {
                    if (err) { callback(500, { Error: "Could not delete the specified token" }) } else {
                        callback(200);
                    }
                });
            }
        });
    } else {
        callback(400, { Error: "Missing query item 'id'" });
    }

};

handler._tokens.delete = (id, phone, callback) => {
    _data.read('tokens', id, (err, data) => {
        if (!err && data) {
            if (data.phone === phone && data.expires > Date.now()) {
                callback(true);
            } else { callback(false); }
        } else { callback(false); }
    });
}

handler._tokens.verifyToken = (id, phone, callback) => {

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
module.exports = handler;