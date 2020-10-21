const crypto = require('crypto');
const config = require('../config');

var lib = {}

lib.hash = (str) => {
    if (typeof(str) == 'string' && str.length > 0) {
        return crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    } else {
        return false;
    }
}

lib.parseStringToJson = (str) => {
    try {
        return JSON.parse(str);
    } catch (error) {
        return false;
    }
}

module.exports = lib;