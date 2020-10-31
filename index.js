// Dependencies
const http = require("http");
const https = require("https");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
const config = require("./config");
const fs = require("fs");
const handler = require("./lib/handlers");
const helpers = require("./lib/helpers");

// Instantiate HTTP server
var httpServer = http.createServer((req, res) => {
    unifiedServer(req, res);
});

// Start http server on port 3000
httpServer.listen(config.httpPort, () => {
    console.log(
        `Server running in ${config.envName} mode,  on port ${config.httpPort}`
    );
});

const httpsServerOptions = {
    key: fs.readFileSync("./https/private.key"),
    cert: fs.readFileSync("./https/certificate.crt"),
};
// Instantiate HTTPS server
var httpsServer = https.createServer(httpsServerOptions, (req, res) => {
    unifiedServer(req, res);
});

// Start https server on port 3000
httpsServer.listen(config.httpsPort, () => {
    console.log(
        `Server running in ${config.envName} mode,  on port ${config.httpsPort}`
    );
});

const unifiedServer = (req, res) => {
    // Get the url and parse it, true  value to parse the query string
    var parsedUrl = url.parse(req.url, true);

    // Get the path
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, "");

    // Get the HTTP Method in lowercase
    var method = req.method.toLowerCase();

    // Get the query string as object
    var queryObject = parsedUrl.query;

    // Get headers
    var headers = req.headers;

    // Get payload, if any
    var decoder = new StringDecoder("utf-8");
    var buffer = "";

    //Add data to buffer
    req.on("data", (data) => {
        buffer += decoder.write(data);
    });

    //End the buffer and finish the body
    req.on("end", () => {
        buffer += decoder.end();

        //payload sent to handler
        const data = {
            trimmedPath,
            method,
            queryObject,
            headers,
            payload: helpers.parseStringToJson(buffer)
        };

        chosenHandler = handler[trimmedPath] ?
            handler[trimmedPath] :
            handler.notFound;

        chosenHandler(data, (statusCode, payload) => {
            statusCode = typeof statusCode === "number" ? statusCode : 200;
            payload = payload ? JSON.stringify(payload) : "{}";
            //Set header to identify json response
            res.setHeader("Content-Type", "application/json");
            //Set status code
            res.writeHead(statusCode);
            // Send the response
            res.end(payload);
            console.log(`Returning payload :  ${payload}`);
        });
    });
};


router = {

};