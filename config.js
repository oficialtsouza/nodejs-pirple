var environments = {};

environments.staging = {
    httpPort: 3000,
    httpsPort: 3001,
    envName: "staging",
    hashingSecret: "H4S1NGS3C3T"
};

environments.production = {
    httpPort: 5000,
    httpsPort: 5001,
    envName: "production",
    hashingSecret: "H4S1NGS3C3T"
};

const currentEnvironment = process.env.NODE_ENV ?
    process.env.NODE_ENV.toLowerCase() :
    "";

module.exports = environments[currentEnvironment] ?
    environments[currentEnvironment] :
    environments.staging;