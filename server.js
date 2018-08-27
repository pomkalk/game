var express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var Matter = require('matter-js')

app.use(express.static('./static'))

global.document = {
  createElement: function () {
    // Canvas
    return {
      getContext: function () {
        return {};
      }
    };
  }
};
global.window = {};

var engine = Matter.Engine.create()

var w1 = Matter.Bodies.rectangle(400, -25, 900, 50, {isStatic: true})
var w2 = Matter.Bodies.rectangle(400, 625, 900, 50, {isStatic: true})
var w3 = Matter.Bodies.rectangle(-25, 300, 50, 700, {isStatic: true})
var w4 = Matter.Bodies.rectangle(825, 300, 50, 700, {isStatic: true})


var balls = []

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

var ball_types = ['basketball', 'bowling']
Matter.World.add(engine.world, [w1, w2, w3, w4])
var users_online = 0
Matter.Events.on(engine, 'afterUpdate', () => {
  var data = []
  balls.forEach(body => {
    data.push({ id: '#' + body.id, position: body.position, angle: body.angle, type: body.label})
  })
  io.emit('updates', data)
})

io.on('connect', (socket) => {
  console.log('connected')
  users_online++
  io.emit('users', users_online)
  socket.on('disconnect', () => { 
    console.log('disconnected')
    users_online--
    io.emit('users', users_online)
  })
  socket.on('add', (pos) => {

    var ball = Matter.Bodies.circle(pos.x, pos.y, 30)
    ball.label = ball_types[randomIntFromInterval(0, 1)]
    ball.restitution = 0.7
    if (ball.label == 'bowling') {
      ball.mass = 5
      ball.restitution = 0.2
    }
    balls.push(ball)
    Matter.World.add(engine.world, [ball])

    if (balls.length > 100) {
      Matter.World.clear(engine.world, true)
      balls = []
      io.emit('clear')
    }
  })
})

http.listen(8000, ()=> {
  Matter.Engine.run(engine)
  //Matter.Engine.update(engine, 1000 / 60)
  console.log('Server started')
  // setInterval(()=> {
  //   Matter.World.clear(engine.world, true)
  //   balls = []
  //   io.emit('clear')
  // }, 5000)
})
