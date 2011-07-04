(function() {
  var activity_log, dashboard, publish, set_up_subscribe_form;
  activity_log = function() {
    var which_msg;
    which_msg = 0;
    return {
      show_message: function(message, type, channel) {
        var log_row, metadata, show_channel, show_json, show_which_msg, tr;
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
        metadata = null;
        if (message.metadata) {
          metadata = message.metadata;
          message = message.payload;
          channel = metadata.channel;
        }
        tr = log_row();
        show_channel(channel);
        show_which_msg();
        show_json(message);
        if (metadata) {
          show_json(metadata);
        }
        return which_msg;
      }
    };
  };
  set_up_subscribe_form = function(client, activity_logger) {
    var on_subcribe, which_subscription;
    which_subscription = 0;
    on_subcribe = function(evt) {
      var cancel_form, cell, cells, channel, subscribe_callback, subscription, subscription_tr, tr, _i, _len, _results;
      evt.preventDefault();
      which_subscription += 1;
      channel = $("#subscribe #subscribe_channel").val();
      subscribe_callback = function(message) {
        return activity_logger.show_message(message, 'incoming');
      };
      subscription = client.subscribe(channel, subscribe_callback);
      cancel_form = function(tr) {
        var button, cancel, form;
        form = $("<form id='cancel_subscribe'>");
        button = $("<input type='submit' value='cancel' />");
        form.append(button);
        cancel = function(subscription, tr) {
          return function(evt) {
            evt.preventDefault();
            subscription.cancel();
            return tr.hide();
          };
        };
        form.submit(cancel(subscription, tr));
        return form;
      };
      subscription_tr = function() {
        var tr;
        tr = $('<tr valign="top">');
        $("#subscriptions table").prepend(tr);
        return tr;
      };
      tr = subscription_tr();
      cells = [$("<td id=subscription" + which_subscription + ">" + which_subscription + "</td>"), $("<td>" + channel + "</td>"), $("<td>").append(cancel_form(tr))];
      _results = [];
      for (_i = 0, _len = cells.length; _i < _len; _i++) {
        cell = cells[_i];
        _results.push(tr.append(cell));
      }
      return _results;
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
      var key, metadata, msg;
      if (message.channel === "/meta/connect") {
        msg = "connection status " + message.successful;
        $("#connection").html(msg);
        return callback(message);
      } else if (message.channel.match(/\/meta.*/)) {
        return callback(message);
      } else {
        if (message.data) {
          metadata = {};
          for (key in message) {
            if (key !== 'data') {
              metadata[key] = message[key];
            }
          }
          message.data = {
            payload: message.data,
            metadata: metadata
          };
        }
        return callback(message);
      }
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
