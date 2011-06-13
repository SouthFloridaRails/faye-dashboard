activity_log = ->
  which_msg = 0
  show_message: (message, type, subscription) ->
    which_msg += 1
    # return if which_msg > 500
    msg = JSON.stringify message, null, 4
    tr = $('<tr valign="top">')
    td = $("<td>(#{which_msg}) #{type}</td>")
    tr.append(td)
    td = $("<td><pre>#{msg}</pre></td>")
    tr.append(td)
    if (subscription)
      td = $("<td>#{subscription}</td>")
      tr.append(td)
    $("table#log").prepend(tr)
    which_msg

set_up_subscribe_form = (client, activity_logger) ->
  which_subscription = 0
  on_subcribe = ->
    try
      which_subscription += 1
      channel = $("#subscribe #subscribe_channel").val()
      subscription_label = "#{which_subscription} #{channel}"
      subscribe_callback = (message) ->
        console.log("got message", message)
        my_subscription = subscription_label
        activity_logger.show_message(message, 'incoming', my_subscription)
      console.log("subscribing", channel)
      subscription = client.subscribe channel, subscribe_callback
      tr = $('<tr valign="top">')
      td = $("<td id=subscription#{which_subscription}>")
      td.append(which_subscription)
      tr.append(td)
      td = $("<td>#{channel}</td>")
      tr.append(td)
      form = $("<form>")
      button = $("<input type='submit' value='cancel' />")
      form.append(button)
      td = $("<td>")
      td.append(form)
      tr.append(td)
      cancel = (subscription, tr) ->
        ->
          subscription.cancel()
          tr.hide()
          false
      button.click(cancel(subscription, tr))
      $("#subscriptions table").prepend(tr)
    catch error
      console.log("error", error)
    false

  $('#subscribe #submit').click ->
    on_subcribe()

publish = (client, activity_logger) ->
  # singleton
  console.log("attaching click")
  $('#publish #submit').click ->
    console.log "hitting submit button"
    data = self.get_input()
    if data?
      channel = $("#publish #channel").val()
      which_msg = activity_logger.show_message(data, 'outgoing', null)
      console.log("showing", which_msg)
      console.log("publishing", channel, data)
      client.publish channel, data
      $("#publish #error").html("")
    else
      $("#publish #error").html("Bad JSON")
    false
  self = 
    set_input: (data) ->
      $("#publish #data").val(data)
    get_input: (data) ->
      data = $("#publish #data").val()
      try
        JSON.parse(data)
      catch error
        null

dashboard = ->
  port = 9292
  client = new Faye.Client "http://localhost:#{port}/faye",
    timeout: 60
  console.log(client)

  activity_logger = activity_log()

  incoming_handler = (message, callback) ->
    if message.channel == "/meta/connect"
      msg = "connection status #{message.successful}"
      $("#connection").html(msg)
      # console.log(message)
      activity_logger.show_message(message, "meta")
    callback(message) 

  client.addExtension
    incoming: incoming_handler

  publisher = publish(client, activity_logger)
  publisher.set_input("{}")

  set_up_subscribe_form(client, activity_logger)


jQuery(document).ready ->
  dashboard()
