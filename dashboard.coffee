activity_log = ->
  which_msg = 0
  show_message: (message, type, channel = null) ->
    which_msg += 1
    tr = $('<tr valign="top">')
    parent_data = null
    if message.__parent_data__
        parent_data = message.__parent_data__
        message.__parent_data__ = undefined
        channel = parent_data.channel

    td = $("<td>")
    td.append(channel)
    tr.append(td)
    # return if which_msg > 500
    msg = JSON.stringify message, null, 4
    td = $("<td>(#{which_msg}) #{type}</td>")
    tr.append(td)
    td = $("<td><pre>#{msg}</pre></td>")
    tr.append(td)
    if parent_data
      msg = JSON.stringify parent_data, null, 4
      td = $("<td><pre>#{msg}</pre></td>")
      tr.append(td)

    $("table#log").prepend(tr)
    which_msg

set_up_subscribe_form = (client, activity_logger) ->
  which_subscription = 0
  on_subcribe = (evt) ->
    evt.preventDefault()
    which_subscription += 1
    channel = $("#subscribe #subscribe_channel").val()
    subscribe_callback = (message) ->
      console.log("got message", message)
      activity_logger.show_message(message, 'incoming')
    console.log("subscribing", channel)
    subscription = client.subscribe channel, subscribe_callback
    tr = $('<tr valign="top">')
    td = $("<td id=subscription#{which_subscription}>")
    td.append(which_subscription)
    tr.append(td)
    td = $("<td>#{channel}</td>")
    tr.append(td)
    form = $("<form id='cancel_subscribe'>")
    button = $("<input type='submit' value='cancel' />")
    form.append(button)
    td = $("<td>")
    td.append(form)
    tr.append(td)
    cancel = (subscription, tr) ->
      (evt) ->
        evt.preventDefault()
        subscription.cancel()
        tr.hide()
    form.submit(cancel(subscription, tr))
    $("#subscriptions table").prepend(tr)

  $('form#subscribe').submit(on_subcribe)

publish = (client, activity_logger) ->
  # singleton
  $('form#publish').submit ->
    console.log "hitting submit button"
    data = self.get_input()
    if data?
      channel = $("#publish #channel").val()
      which_msg = activity_logger.show_message(data, 'outgoing', channel)
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
  port = 9292 # XXX: hard coded
  try
    url = "http://localhost:#{port}/faye"
    $("#connection").prepend(url + "<br />")
    client = new Faye.Client url,
      timeout: 60
  catch error
    alert("Faye does not appear to be running")
    throw error
  console.log(client)

  activity_logger = activity_log()

  incoming_handler = (message, callback) ->
    if message.channel == "/meta/connect"
      msg = "connection status #{message.successful}"
      $("#connection").html(msg)
      # activity_logger.show_message(message, "meta")
    else
      if message.data
        extras = {}
        for key of message
          if key != 'data'
            extras[key] = message[key]
        message.data.__parent_data__ = extras

    console.log(message)
    callback(message) 

  client.addExtension({incoming: incoming_handler})

  publisher = publish(client, activity_logger)
  publisher.set_input("{}")

  set_up_subscribe_form(client, activity_logger)


jQuery(document).ready ->
  dashboard()
