// Dependencies
const http = require("http");
const url = require("url");

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

    // Send the response
    res.end("Hello World");

    // Log the request path
    console.log(
        `Request revieved on path ${trimmedPath} , with method ${method}`
    );
    console.log("Query object ", queryObject);

    console.log("Headers", headers);
});

// Start server on port 3000
server.listen(3000, () => {
    console.log("Server running on port 3000");
});