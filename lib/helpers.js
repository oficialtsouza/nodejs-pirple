const crypto = require('crypto');
const { type } = require('os');
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

lib.createRandomString = (len) => {
    const strLength = typeof(len) == 'number' && len > 0 ? len : false;
    if (strLength) {
        const possibleCharacters = 'qwertyuiopasdfghjklzxcvbnm0987654321'
        var str = ''
        for (i = 1; i <= strLength; i++) {
            randomChar = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            str += randomChar;
        }
        return str
    }
};

module.exports = lib;