const fs = require("fs");
const path = require("path");
const helpers = require('./helpers');
var lib = {};

lib.baseDir = path.join(__dirname, "/../.data/");

lib.create = function(dir, file, data, callback) {

    if (!fs.existsSync(lib.baseDir + dir)) {
        fs.mkdirSync(lib.baseDir + dir)
    }
    fs.open(
        lib.baseDir + dir + "/" + file + ".json",
        "wx",
        (err, fileDescriptor) => {
            if (!err && fileDescriptor) {
                const strData = JSON.stringify(data);

                fs.write(fileDescriptor, strData, (err) => {
                    if (err) {
                        callback("Error  writing to file!!");
                    } else {
                        fs.close(fileDescriptor, (err) => {
                            if (err) {
                                callback("Error closing new file!!");
                            } else {
                                callback(false);
                            }
                        });
                    }
                });
            } else {
                callback("Could not create a new file, it may already exist!!");
            }
        }
    );
};

lib.read = function(dir, file, callback) {
    fs.readFile(lib.baseDir + dir + "/" + file + ".json", "utf8", (err, data) => {
        if (!err && data) {
            const parsedData = helpers.parseStringToJson(data);
            callback(false, parsedData);
        } else {
            callback(err, data);
        }
    });
}

lib.update = function(dir, file, data, callback) {
    fs.open(
        lib.baseDir + dir + "/" + file + ".json",
        "r+",
        (err, fileDescriptor) => {
            if (!err && fileDescriptor) {
                const strData = JSON.stringify(data);
                fs.ftruncate(fileDescriptor, (err) => {
                    if (err) {
                        callback("Error truncanting the file!!!");
                    } else {
                        fs.write(fileDescriptor, strData, (err) => {
                            if (err) {
                                callback("Error  writing to file!!");
                            } else {
                                fs.close(fileDescriptor, (err) => {
                                    if (err) {
                                        callback("Error closing new file!!");
                                    } else {
                                        callback(false);
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                callback("Could not open the file for uptade, it may not exist yet!!");
            }
        }
    );
};


lib.delete = function(dir, file, callback) {
    fs.unlink(lib.baseDir + dir + "/" + file + ".json", (err) => {
        if (err) {
            callback("Error deleting file!!");
        } else {
            callback(false);
        }
    });
}

module.exports = lib;