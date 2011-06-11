(function() {
  var activity_log, dashboard;
  activity_log = function() {
    return {
      show_message: function(msg) {
        var td, tr;
        console.log("yo", msg);
        tr = $("<tr>");
        td = $("<td>" + msg + "</td>");
        console.log(td);
        tr.append(td);
        return $("table#log").append(tr);
      }
    };
  };
  dashboard = function() {
    var activity_logger, client, second_publish, subscribe_callback, which;
    client = new Faye.Client('http://localhost:8000/faye', {
      timeout: 60
    });
    console.log('subscribing');
    activity_logger = activity_log();
    subscribe_callback = function(message) {
      var msg;
      console.log("got message", message);
      msg = JSON.stringify(message);
      return activity_logger.show_message(msg);
    };
    client.subscribe('/email/new', subscribe_callback);
    console.log("prepping timeout");
    which = 0;
    second_publish = function() {
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
