(function() {
  var activity_log, dashboard, publish, set_up_subscribe_form;
  activity_log = function() {
    var which_msg;
    which_msg = 0;
    return {
      show_message: function(message, type) {
        var msg, td, tr;
        which_msg += 1;
        msg = JSON.stringify(message);
        tr = $("<tr>");
        td = $("<td id=" + type + which_msg + ">" + type + " " + which_msg + "<br />" + msg + "</td>");
        console.log(td);
        tr.append(td);
        $("table#log").prepend(tr);
        return which_msg;
      }
    };
  };
  set_up_subscribe_form = function(client, activity_logger) {
    var on_subcribe;
    on_subcribe = function() {
      var channel, subscribe_callback;
      try {
        subscribe_callback = function(message) {
          console.log("got message", message);
          return activity_logger.show_message(message, 'incoming');
        };
        channel = $("#subscribe #subscribe_channel").val();
        console.log("subscribing", channel);
        client.subscribe(channel, subscribe_callback);
      } catch (error) {
        console.log("error", error);
      }
      return false;
    };
    return $('#subscribe #submit').click(function() {
      return on_subcribe();
    });
  };
  publish = function(client, activity_logger) {
    var self;
    console.log("attaching click");
    $('#publish #submit').click(function() {
      var channel, data, which_msg;
      console.log("hitting submit button");
      data = self.get_input();
      if (data != null) {
        channel = $("#publish #channel").val();
        which_msg = activity_logger.show_message(data, 'outgoing');
        console.log("showing", which_msg);
        console.log("publishing", channel, data);
        client.publish(channel, data);
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
    var activity_logger, client, publisher;
    client = new Faye.Client('http://localhost:8000/faye', {
      timeout: 60
    });
    console.log('subscribing');
    activity_logger = activity_log();
    publisher = publish(client, activity_logger);
    publisher.set_input("{}");
    return set_up_subscribe_form(client, activity_logger);
  };
  jQuery(document).ready(function() {
    return dashboard();
  });
}).call(this);
