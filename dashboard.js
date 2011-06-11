(function() {
  var dashboard;
  dashboard = function() {
    var client, second_publish, subscribe_callback, which;
    client = new Faye.Client('http://localhost:8000/faye', {
      timeout: 60
    });
    console.log('subscribing');
    subscribe_callback = function(message) {
      var msg;
      console.log("got message", message);
      msg = JSON.stringify(message);
      return $("#dashboard").append(msg);
    };
    client.subscribe('/email/new', subscribe_callback);
    console.log("prepping timeout");
    which = 0;
    second_publish = function() {
      console.log("second publish");
      client.publish('/email/new', {
        text: 'FROM BROWSER',
        which: which
      });
      which += 1;
      if (which < 5) {
        return setTimeout(second_publish, 1000);
      }
    };
    return setTimeout(second_publish, 1000);
  };
  jQuery(document).ready(function() {
    return dashboard();
  });
}).call(this);
