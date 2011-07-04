activity_log = ->
  which_msg = 0
  show_message: (message, type, channel = null) ->
    which_msg += 1
    
    log_row = ->
      tr = $('<tr valign="top">')
      $("table#log").prepend(tr)
      tr
    
    show_channel = (channel) ->
      td = $("<td>")
      td.append(channel)
      tr.append(td)

    show_which_msg = ->
      td = $("<td>(#{which_msg}) #{type}</td>")
      tr.append(td)
      
    show_json = (message) ->
      msg = JSON.stringify message, null, 4
      td = $("<td><pre>#{msg}</pre></td>")
      tr.append(td)

    metadata = null
    if message.metadata
        metadata = message.metadata
        message = message.payload
        channel = metadata.channel
              
    tr = log_row()
    show_channel(channel)
    show_which_msg()
      
    show_json(message)
    if metadata
      show_json(metadata)

    which_msg

set_up_subscribe_form = (client, activity_logger) ->
  which_subscription = 0
  on_subcribe = (evt) ->
    evt.preventDefault()
    which_subscription += 1
    channel = $("#subscribe #subscribe_channel").val()
    subscribe_callback = (message) ->
      activity_logger.show_message(message, 'incoming')
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
    data = self.get_input()
    if data?
      channel = $("#publish #channel").val()
      which_msg = activity_logger.show_message(data, 'outgoing', channel)
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

  activity_logger = activity_log()

  incoming_handler = (message, callback) ->
    # return callback(message)
    if message.channel == "/meta/connect"
      msg = "connection status #{message.successful}"
      $("#connection").html(msg)
      callback(message)
    else if message.channel.match(/\/meta.*/)
      # This is ugly, I wish meta messages were
      # covered under a different extension.
      callback(message)
    else
      if message.data
        metadata = {}
        for key of message
          if key != 'data'
            metadata[key] = message[key]
        message.data =
          payload: message.data
          metadata: metadata
      callback(message) 

  client.addExtension({incoming: incoming_handler})

  publisher = publish(client, activity_logger)
  publisher.set_input("{}")

  set_up_subscribe_form(client, activity_logger)


jQuery(document).ready ->
  dashboard()
