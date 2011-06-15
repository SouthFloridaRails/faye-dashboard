(function() {
  var activity_log, dashboard, publish, set_up_subscribe_form;
  activity_log = function() {
    var which_msg;
    which_msg = 0;
    return {
      show_message: function(message, type, channel) {
        var msg, parent_data, td, tr;
        if (channel == null) {
          channel = null;
        }
        which_msg += 1;
        tr = $('<tr valign="top">');
        parent_data = null;
        if (message.__parent_data__) {
          parent_data = message.__parent_data__;
          message.__parent_data__ = void 0;
          channel = parent_data.channel;
        }
        td = $("<td>");
        td.append(channel);
        tr.append(td);
        msg = JSON.stringify(message, null, 4);
        td = $("<td>(" + which_msg + ") " + type + "</td>");
        tr.append(td);
        td = $("<td><pre>" + msg + "</pre></td>");
        tr.append(td);
        if (parent_data) {
          msg = JSON.stringify(parent_data, null, 4);
          td = $("<td><pre>" + msg + "</pre></td>");
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
    on_subcribe = function(evt) {
      var button, cancel, channel, form, subscribe_callback, subscription, td, tr;
      evt.preventDefault();
      which_subscription += 1;
      channel = $("#subscribe #subscribe_channel").val();
      subscribe_callback = function(message) {
        console.log("got message", message);
        return activity_logger.show_message(message, 'incoming');
      };
      console.log("subscribing", channel);
      subscription = client.subscribe(channel, subscribe_callback);
      tr = $('<tr valign="top">');
      td = $("<td id=subscription" + which_subscription + ">");
      td.append(which_subscription);
      tr.append(td);
      td = $("<td>" + channel + "</td>");
      tr.append(td);
      form = $("<form id='cancel_subscribe'>");
      button = $("<input type='submit' value='cancel' />");
      form.append(button);
      td = $("<td>");
      td.append(form);
      tr.append(td);
      cancel = function(subscription, tr) {
        return function(evt) {
          evt.preventDefault();
          subscription.cancel();
          return tr.hide();
        };
      };
      form.submit(cancel(subscription, tr));
      return $("#subscriptions table").prepend(tr);
    };
    return $('form#subscribe').submit(on_subcribe);
  };
  publish = function(client, activity_logger) {
    var self;
    $('form#publish').submit(function() {
      var channel, data, which_msg;
      console.log("hitting submit button");
      data = self.get_input();
      if (data != null) {
        channel = $("#publish #channel").val();
        which_msg = activity_logger.show_message(data, 'outgoing', channel);
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
    try {
      client = new Faye.Client("http://localhost:" + port + "/faye", {
        timeout: 60
      });
    } catch (error) {
      alert("Faye does not appear to be running");
      throw error;
    }
    console.log(client);
    activity_logger = activity_log();
    incoming_handler = function(message, callback) {
      var extras, key, msg;
      if (message.channel === "/meta/connect") {
        msg = "connection status " + message.successful;
        $("#connection").html(msg);
      } else {
        if (message.data) {
          extras = {};
          for (key in message) {
            if (key !== 'data') {
              extras[key] = message[key];
            }
          }
          message.data.__parent_data__ = extras;
        }
      }
      console.log(message);
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
