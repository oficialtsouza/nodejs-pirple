var environments = {};

environments.staging = {
    port: 3000,
    envName: "staging",
};

environments.production = {
    port: 5000,
    envName: "production",
};

const currentEnvironment = process.env.NODE_ENV ?
    process.env.NODE_ENV.toLowerCase() :
    "";

module.exports = environments[currentEnvironment] ?
    environments[currentEnvironment] :
    environments.staging;