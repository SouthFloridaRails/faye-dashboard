dashboard = ->
  console.log("starting dashboard")
  $("#dashboard").html("hello world")
  console.log("after setting html")

  client = new Faye.Client 'http://localhost:8000/faye',
    timeout: 40

  console.log(client)
  client.publish '/email/new',
    text: 'New email has arrived!'
    inboxSize: 34
  console.log("after publishing")

jQuery(document).ready ->
  dashboard()
