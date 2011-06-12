(function() {
  var activity_log, dashboard, publish, set_up_echo;
  activity_log = function() {
    var which_msg;
    which_msg = 0;
    return {
      show_message: function(message, type) {
        var msg, td, tr;
        which_msg += 1;
        msg = JSON.stringify(message);
        tr = $("<tr>");
        td = $("<td id=" + type + which_msg + ">" + type + "<br />" + msg + "</td>");
        console.log(td);
        tr.append(td);
        $("table#log").append(tr);
        return which_msg;
      }
    };
  };
  set_up_echo = function(client, channel, which_msg) {
    var subscribe_callback, subscription;
    subscribe_callback = function(message) {
      console.log("got echo", which_msg);
      $("#outgoing" + which_msg).css("background", "#44FF44");
      return subscription.cancel();
    };
    return subscription = client.subscribe(channel, subscribe_callback);
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
        set_up_echo(client, channel, which_msg);
        $("#publish #error").html("");
        console.log("publishing", channel, data);
        client.publish(channel, data);
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
