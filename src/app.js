import * as PIXI from 'pixi.js'
import * as io from 'socket.io-client'

var app = new PIXI.Application()
document.body.appendChild(app.view)
app.loader.add(['assets/p/basketball.png', 'assets/p/bowling.png']).load(setup)
var socket

var balls = {}

function setup () {
  console.log('assets loaded')
  socket = io('localhost:8000')
  app.stage.interactive = true
  app.stage.hitArea = new PIXI.Rectangle(0, 0, 800, 600)
  app.stage.on('click', (e) => {
    socket.emit('add', e.data.global)
  })
  var users_online = new PIXI.Text('Users: 0', { fill: 0xffffff})
  app.stage.addChild(users_online)
  socket.on('users', (users) => {
    users_online.text = "Users: " + users
  })
  socket.on('clear', () => {
    Object.keys(balls).forEach(key => {
      app.stage.removeChild(balls[key].sprite)
    })
    balls = {}
  })
  socket.on('updates', (data) => {
    data.forEach(ball => {
      if (!balls.hasOwnProperty(ball.id)) {
        balls[ball.id] = ball
        balls[ball.id].sprite = new PIXI.Sprite(app.loader.resources['assets/p/' + ball.type + '.png'].texture)
        balls[ball.id].sprite.anchor.set(0.5)
        balls[ball.id].sprite.scale.set(0.04)
        app.stage.addChild(ball.sprite)
      }
      balls[ball.id].sprite.x = ball.position.x
      balls[ball.id].sprite.y = ball.position.y
      balls[ball.id].sprite.rotation = ball.angle
    })
  })
}