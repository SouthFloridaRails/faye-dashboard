(function() {
  var activity_log, dashboard, publish, set_up_subscribe_form;
  activity_log = function() {
    var which_msg;
    which_msg = 0;
    return {
      show_message: function(message, type, subscription) {
        var msg, td, tr;
        which_msg += 1;
        msg = JSON.stringify(message, null, 4);
        tr = $('<tr valign="top">');
        td = $("<td>(" + which_msg + ") " + type + "</td>");
        tr.append(td);
        td = $("<td><pre>" + msg + "</pre></td>");
        tr.append(td);
        if (subscription) {
          td = $("<td>" + subscription + "</td>");
          tr.append(td);
        }
        $("table#log").prepend(tr);
        return which_msg;
      }
    };
  };
  set_up_subscribe_form = function(client, activity_logger) {
    var on_subcribe, which_subscription;
    which_subscription = 0;
    on_subcribe = function() {
      var button, cancel, channel, form, subscribe_callback, subscription, subscription_label, td, tr;
      try {
        which_subscription += 1;
        channel = $("#subscribe #subscribe_channel").val();
        subscription_label = "" + which_subscription + " " + channel;
        subscribe_callback = function(message) {
          var my_subscription;
          console.log("got message", message);
          my_subscription = subscription_label;
          return activity_logger.show_message(message, 'incoming', my_subscription);
        };
        console.log("subscribing", channel);
        subscription = client.subscribe(channel, subscribe_callback);
        tr = $('<tr valign="top">');
        td = $("<td id=subscription" + which_subscription + ">");
        td.append(which_subscription);
        tr.append(td);
        td = $("<td>" + channel + "</td>");
        tr.append(td);
        form = $("<form>");
        button = $("<input type='submit' value='cancel' />");
        form.append(button);
        td = $("<td>");
        td.append(form);
        tr.append(td);
        cancel = function(subscription, tr) {
          return function() {
            subscription.cancel();
            tr.hide();
            return false;
          };
        };
        button.click(cancel(subscription, tr));
        $("#subscriptions table").prepend(tr);
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
        which_msg = activity_logger.show_message(data, 'outgoing', null);
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
    var activity_logger, client, incoming_handler, port, publisher;
    port = 9292;
    client = new Faye.Client("http://localhost:" + port + "/faye", {
      timeout: 60
    });
    console.log(client);
    activity_logger = activity_log();
    incoming_handler = function(message, callback) {
      var msg;
      if (message.channel === "/meta/connect") {
        msg = "connection status " + message.successful;
        $("#connection").html(msg);
        activity_logger.show_message(message, "meta");
      }
      return callback(message);
    };
    client.addExtension({
      incoming: incoming_handler
    });
    publisher = publish(client, activity_logger);
    publisher.set_input("{}");
    return set_up_subscribe_form(client, activity_logger);
  };
  jQuery(document).ready(function() {
    return dashboard();
  });
}).call(this);
