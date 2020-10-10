var environments = {};

environments.staging = {
    httpPort: 3000,
    httpsPort: 3001,
    envName: "staging",
};

environments.production = {
    httpPort: 5000,
    httpsPort: 5001,
    envName: "production",
};

const currentEnvironment = process.env.NODE_ENV ?
    process.env.NODE_ENV.toLowerCase() :
    "";

module.exports = environments[currentEnvironment] ?
    environments[currentEnvironment] :
    environments.staging;