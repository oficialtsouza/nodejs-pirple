const checks = (req, callback) => {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(req.method) > -1) {
        _checks[req.method](req, callback);
    } else {
        callback(405)
    }
}

_checks = {};

_checks.get = (req, callback) => {
    callback(200);
};

module.exports = checks