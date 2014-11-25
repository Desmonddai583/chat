$(function() {
  var socket = io();
  var typing = false;

  $(".usernameInput").keydown(function (event) {
    if (event.which === 13) {
      var username = $(".usernameInput").val();
      $(".login").fadeOut();
      $(".chat").show();
      socket.emit('new user', username);
    }
  });

  function refreshUserlist(data) {
    $('#users').text("");
    data.users.forEach(function(user) {
      $('#users').append($('<li>').attr("id", user).text(user));
    });
    $('#users > li').map(function() {
      $(this).click(function() {
        var username = $(this).text();
        $('#m').text('');
        $('#m').val('@' + username + ":");
        $('#m').focus();
      });
    });
  }

  function timeoutFunction() {
    typing = false;
    socket.emit("user stop typing");
  }

  $("#m").on('input', function() {
    if(typing === false) {
      typing = true
      socket.emit("user typing");
      timeout = setTimeout(timeoutFunction, 5000);
    } else {
      clearTimeout(timeout);
      timeout = setTimeout(timeoutFunction, 5000);
    }
  });

  $('#message-form').submit(function(){
    socket.emit('chat message', $('#m').val());
    $('#messages').append($('<li>').attr('class', "self-message").text(socket.username + ": " + $('#m').val()));
    $('#m').val('');
    return false;
  });

  socket.on('chat message', function(data){
    var privateMessage = "";
    if($('#typing')) {
      $('#typing').remove();
    }
    if(data.isPrivate) {
      privateMessage = "(Private Message)";
    }
    $('#messages').append($('<li>').text(data.username + ": " + data.msg + privateMessage));
  });

  socket.on('user typing', function(data){
    $('#messages').append($('<li id="typing">').text(data.username + " is typing ..."));
  });

  socket.on('user stop typing', function(username){
    $('#typing').remove();
  });

  socket.on('user login', function(data){
    $('#messages').append($('<li>').text("Welcome " + data.username + ", there are " + data.usersNum + " users online."));
    refreshUserlist(data);
  });

  socket.on('user connect', function(data){
    $('#messages').append($('<li>').text(data.username + " joined the chat, there are " + data.usersNum + " users online."));
    refreshUserlist(data);
  });

  socket.on('user disconnect', function(data){
    $('#messages').append($('<li>').text(data.username + " left, there are " + data.usersNum + " users online."));
    $('li[id="' + data.username + '"]').remove();
  });
});