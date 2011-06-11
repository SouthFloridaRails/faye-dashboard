var faye = require('faye');

var bayeux = new faye.NodeAdapter({
  mount:    '/faye',
    timeout:  45
    });


var client = new faye.Client('http://localhost:8000/faye');
console.log(client);
client.publish('/email/new', {
  text:       'New email has arrived!',
  inboxSize:  34
});
