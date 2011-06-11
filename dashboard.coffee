dashboard = ->
  console.log("starting dashboard")
  $("#dashboard").html("hello world")
  console.log("after setting html")

jQuery(document).ready ->
  dashboard()
