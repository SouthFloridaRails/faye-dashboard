(function() {
  var activity_log, dashboard, publish, set_up_subscribe_form;
  activity_log = function() {
    var which_msg;
    which_msg = 0;
    return {
      show_message: function(message, type, channel) {
        var log_row, parent_data, show_channel, show_json, show_which_msg, tr;
        if (channel == null) {
          channel = null;
        }
        which_msg += 1;
        log_row = function() {
          var tr;
          tr = $('<tr valign="top">');
          $("table#log").prepend(tr);
          return tr;
        };
        show_channel = function(channel) {
          var td;
          td = $("<td>");
          td.append(channel);
          return tr.append(td);
        };
        show_which_msg = function() {
          var td;
          td = $("<td>(" + which_msg + ") " + type + "</td>");
          return tr.append(td);
        };
        show_json = function(message) {
          var msg, td;
          msg = JSON.stringify(message, null, 4);
          td = $("<td><pre>" + msg + "</pre></td>");
          return tr.append(td);
        };
        parent_data = null;
        if (message.__parent_data__) {
          parent_data = message.__parent_data__;
          message.__parent_data__ = void 0;
          channel = parent_data.channel;
        }
        tr = log_row();
        show_channel(channel);
        show_which_msg();
        show_json(message);
        if (parent_data) {
          show_json(parent_data);
        }
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
        return activity_logger.show_message(message, 'incoming');
      };
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
      data = self.get_input();
      if (data != null) {
        channel = $("#publish #channel").val();
        which_msg = activity_logger.show_message(data, 'outgoing', channel);
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
    var activity_logger, client, incoming_handler, port, publisher, url;
    port = 9292;
    try {
      url = "http://localhost:" + port + "/faye";
      $("#connection").prepend(url + "<br />");
      client = new Faye.Client(url, {
        timeout: 60
      });
    } catch (error) {
      alert("Faye does not appear to be running");
      throw error;
    }
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
