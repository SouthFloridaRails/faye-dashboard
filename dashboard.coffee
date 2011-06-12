activity_log = ->
  which_msg = 0
  show_message: (message, type) ->
    which_msg += 1
    msg = JSON.stringify message 
    tr = $("<tr>")
    td = $("<td id=#{type}#{which_msg}>#{type}<br />#{msg}</td>")
    console.log(td)
    tr.append(td)
    $("table#log").append(tr)
    which_msg

set_up_echo = (client, channel, which_msg) ->
  subscribe_callback = (message) ->
    console.log("got echo", which_msg)
    $("#outgoing#{which_msg}").css("background", "#44FF44")
    subscription.cancel()

  subscription = client.subscribe channel, subscribe_callback

publish = (client, activity_logger) ->
  # singleton
  console.log("attaching click")
  $('#publish #submit').click ->
    console.log "hitting submit button"
    data = self.get_input()
    if data?
      channel = $("#publish #channel").val()
      which_msg = activity_logger.show_message(data, 'outgoing')
      console.log("showing", which_msg)
      set_up_echo(client, channel, which_msg)
      $("#publish #error").html("")
      console.log("publishing", channel, data)
      client.publish channel, data
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
  client = new Faye.Client 'http://localhost:8000/faye',
    timeout: 60

  console.log('subscribing')

  activity_logger = activity_log()
  
  publisher = publish(client, activity_logger)
  publisher.set_input("{}")

  subscribe_callback = (message) ->
    console.log("got message", message)
    activity_logger.show_message(message, 'incoming')

  client.subscribe '/email/new', subscribe_callback

  console.log("prepping timeout")

jQuery(document).ready ->
  dashboard()
