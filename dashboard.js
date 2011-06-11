(function() {
  var dashboard;
  dashboard = function() {
    console.log("starting dashboard");
    $("#dashboard").html("hello world");
    return console.log("after setting html");
  };
  jQuery(document).ready(function() {
    return dashboard();
  });
}).call(this);
