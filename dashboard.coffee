activity_log = ->
  show_message: (message, type) ->
    msg = JSON.stringify message 
    tr = $("<tr>")
    td = $("<td>#{type}<br />#{msg}</td>")
    console.log(td)
    tr.append(td)
    $("table#log").append(tr)

publish = (client, activity_logger) ->
  # singleton
  console.log("attaching click")
  $('#publish #submit').click ->
    console.log "hitting submit button"
    data = self.get_input()
    if data?
      channel = $("#publish #channel").val()
      client.publish channel, data
      activity_logger.show_message(data, 'outgoing')
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
