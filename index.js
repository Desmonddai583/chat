var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var usernames = [];
var socket_ids = {};

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendFile('/index.html');
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    var sub = msg.substr(1).split(':');

    if(msg[0] === "@" && usernames.indexOf(sub[0]) >= 0) {
      msg = sub[1];
      io.to(socket_ids[sub[0]]).emit('chat message', {
        msg: msg,
        username: socket.username,
        isPrivate: true        
      });
    } else {
      socket.broadcast.emit('chat message', {
        msg: msg,
        username: socket.username
      });      
    }
  });

  socket.on('disconnect', function () {
    if(socket.username) {
      usernames.splice(usernames.indexOf(socket.username), 1);
      delete socket_ids[socket.username];

      socket.broadcast.emit('user disconnect', {
        username: socket.username,
        usersNum: usernames.length,
        users: usernames
      });      
    }
  });

  socket.on('user typing', function () {
    socket.broadcast.emit('user typing', {
      username: socket.username,
    });
  });

  socket.on('user stop typing', function () {
    socket.broadcast.emit('user stop typing');
  });

  socket.on('new user', function (username) {
    socket.username = username;
    usernames.push(username);
    socket_ids[username] = socket.id;

    socket.emit('user login', {
      username: socket.username,
      usersNum: usernames.length,
      users: usernames
    });

    socket.broadcast.emit('user connect', {
      username: socket.username,
      usersNum: usernames.length,
      users: usernames
    });
  });
});

http.listen(5000, function(){
  console.log('listening on *:5000');
});
