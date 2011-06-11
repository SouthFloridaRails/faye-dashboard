var faye = require('faye');

var bayeux = new faye.NodeAdapter({
  mount:    '/faye'
});


var client = new faye.Client('http://localhost:8000/faye', {timeout: 60});

if (false) {
  client.subscribe('/email/new', function (message) {
    console.log("incoming", message);
  });
}

console.log(client);
if (true) {
  client.publish('/email/new', {'data': {
    text:       'FROM CONSOLE',
    inboxSize:  45
  }});
}
