dashboard = ->
  client = new Faye.Client 'http://localhost:8000/faye',
    timeout: 60

  console.log('subscribing')

  subscribe_callback = (message) ->
    console.log("got message", message)
    msg = JSON.stringify message 
    $("#dashboard").append(msg)

  client.subscribe '/email/new', subscribe_callback

  console.log("prepping timeout")
  which = 0
  second_publish = ->
    console.log "second publish"
    client.publish '/email/new',
      text: 'FROM BROWSER'
      which: which
    which += 1
    if which < 5
      setTimeout(second_publish, 1000)
  setTimeout(second_publish, 1000)

jQuery(document).ready ->
  dashboard()
