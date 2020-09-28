// Dependencies
const http = require("http");
const url = require("url");

// Create server
var server = http.createServer((req, res) => {
    // Get the url and parse it
    // true  value to parse the query string
    var parsedUrl = url.parse(req.url, true);

    // Get the path
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, "");

    // Send the response
    res.end("Hello World");

    // Log the request path
    console.log(`Request revieved on path:  ${trimmedPath}`);
});

// Start server on port 3000
server.listen(3000, () => {
    console.log("Server running on port 3000");
});