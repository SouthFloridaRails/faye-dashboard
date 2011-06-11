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
    client.publish '/email/new', 
      data
    false
  self = 
    set_input: (data) ->
      $("#publish #data").val(data)
    get_input: (data) ->
      $("#publish #data").val()

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
  which = 0
  second_publish = ->
    client.publish '/email/new',
      text: 'FROM BROWSER'
      which: which
    which += 1
    if which < 5
      setTimeout(second_publish, 1000)
  setTimeout(second_publish, 1000)

jQuery(document).ready ->
  dashboard()
