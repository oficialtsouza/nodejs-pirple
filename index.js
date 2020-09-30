const { write } = require("fs");
// Dependencies
const http = require("http");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
// Create server
var server = http.createServer((req, res) => {
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
            payload: buffer,
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
});

// Start server on port 3000
server.listen(3000, () => {
    console.log("Server running on port 3000");
});

var handler = {};

handler.sample = (data, callback) => {
    callback(406, { name: "Thiago" });
};

handler.notFound = (data, callback) => {
    callback(404);
};

const router = {
    sample: handler.sample,
};