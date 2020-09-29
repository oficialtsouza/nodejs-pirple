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
    req.on("data", (data) => {
        buffer += decoder.write(data);
    });

    req.on("end", (data) => {
        buffer += decoder.end();

        // Send the response
        res.end("Hello World");

        // Log the request path
        console.log(
            `Request revieved on path ${trimmedPath} , with method ${method}`
        );
        console.log("Query object ", queryObject);

        console.log("Headers", headers);

        console.log("Payload ", buffer);
    });
});

// Start server on port 3000
server.listen(3000, () => {
    console.log("Server running on port 3000");
});