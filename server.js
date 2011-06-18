var http = require('http'),
    faye = require('faye');
faye.Logging.logLevel = 'info';

var bayeux = new faye.NodeAdapter({
  mount:    '/faye'
});
var serverAuth = {
  incoming: function(message, callback) {
    console.log("incoming message");
    console.log(message);
    callback(message);
  },
  outcoming: function(message, callback) {
    console.log("outcoming message");
    console.log(message);
    callback(message);
  }
};


// Handle non-Bayeux requests
var server = http.createServer(function(request, response) {
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.write('Hello, non-Bayeux request');
  response.end();
});

// bayeux.addExtension(serverAuth);
bayeux.attach(server);
server.listen(9292);
