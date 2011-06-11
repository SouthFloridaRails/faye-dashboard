activity_log = ->
  show_message: (msg) ->
    console.log("yo", msg)
    tr = $("<tr>")
    td = $("<td>#{msg}</td>")
    console.log(td)
    tr.append(td)
    $("table#log").append(tr)

publish = (client) ->
  # singleton
  console.log("attaching click")
  $('#publish #submit').click ->
    console.log "hitting submit button"
    data = self.get_input()
    if data?
      client.publish '/email/new', 
        data
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
  
  publisher = publish(client)
  publisher.set_input("{}")

  subscribe_callback = (message) ->
    console.log("got message", message)
    msg = JSON.stringify message 
    activity_logger.show_message(msg)

  client.subscribe '/email/new', subscribe_callback

  console.log("prepping timeout")

jQuery(document).ready ->
  dashboard()
