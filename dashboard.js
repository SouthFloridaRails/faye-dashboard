(function() {
  var activity_log, dashboard, publish;
  activity_log = function() {
    return {
      show_message: function(message, type) {
        var msg, td, tr;
        msg = JSON.stringify(message);
        tr = $("<tr>");
        td = $("<td>" + type + "<br />" + msg + "</td>");
        console.log(td);
        tr.append(td);
        return $("table#log").append(tr);
      }
    };
  };
  publish = function(client, activity_logger) {
    var self;
    console.log("attaching click");
    $('#publish #submit').click(function() {
      var channel, data;
      console.log("hitting submit button");
      data = self.get_input();
      if (data != null) {
        channel = $("#publish #channel").val();
        client.publish(channel, data);
        activity_logger.show_message(data, 'outgoing');
        $("#publish #error").html("");
      } else {
        $("#publish #error").html("Bad JSON");
      }
      return false;
    });
    return self = {
      set_input: function(data) {
        return $("#publish #data").val(data);
      },
      get_input: function(data) {
        data = $("#publish #data").val();
        try {
          return JSON.parse(data);
        } catch (error) {
          return null;
        }
      }
    };
  };
  dashboard = function() {
    var activity_logger, client, publisher, subscribe_callback;
    client = new Faye.Client('http://localhost:8000/faye', {
      timeout: 60
    });
    console.log('subscribing');
    activity_logger = activity_log();
    publisher = publish(client, activity_logger);
    publisher.set_input("{}");
    subscribe_callback = function(message) {
      console.log("got message", message);
      return activity_logger.show_message(message, 'incoming');
    };
    client.subscribe('/email/new', subscribe_callback);
    return console.log("prepping timeout");
  };
  jQuery(document).ready(function() {
    return dashboard();
  });
}).call(this);
