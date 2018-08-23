var express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)


var fps = 1000 / 60
var users_iter = 1
var users = {}


function rnd(min, max) {
  return Math.random() * (max - min) + min
}

function getUserId () {
  return '#' + users_iter++
}

io.on('connect', (socket) => {
  console.log('connected')
  socket.on('disconnect', () => { 
    console.log('disconnected')
    delete users[socket.user_id]
    io.emit('user_delete', socket.user_id)
  })
  socket.user_id = getUserId()
  var user = {
    id: socket.user_id,
    color: '0x' + Math.floor(Math.random() * 16777215).toString(16),
    position: {
      x: rnd(50, 750),
      y: rnd(50, 550)
    },
    keys: {
      up: false,
      down: false,
      left: false,
      right: false
    }
  }
  users[socket.user_id] = user
  socket.on('key_pressed', ({user_id, key}) => {
    users[user_id].keys[key] = true
  })
  socket.on('key_unpressed', ({user_id, key}) => {
    users[user_id].keys[key] = false
  })  
  socket.emit('welcome', user)
})

http.listen(3030, ()=> {
  console.log('Server started')
  setInterval(gameLoop, fps)
})

function gameLoop() {
  calculate()
  sendUpdates()
}

var speed = 3
function calculate () {
  Object.keys(users).forEach(user_id => {
    var user = users[user_id]
    if (user.keys.up) user.position.y -= speed
    if (user.keys.down) user.position.y += speed
    if (user.keys.left) user.position.x -= speed
    if (user.keys.right) user.position.x += speed
  })
}

function sendUpdates () {
  io.emit('updates', users)
}

