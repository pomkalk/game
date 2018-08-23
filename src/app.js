import 'phaser'
import * as io from 'socket.io-client'

var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {preload, create, update}
}

var game = new Phaser.Game(config)
var balls = []
function preload () {
  this.load.image('circle', 'assets/red-circle.png')
}

function create () {
  var ball = this.add.sprite(300, 100, 'circle').setScale(0.5)
  ball.radius = 28
  ball.vx = 0
  ball.vy = 0
  balls.push(ball)

  this.input.on('pointerdown', (function (pointer) {
    var ball = this.add.sprite(pointer.x, pointer.y, 'circle').setScale(0.5)
    ball.radius = 28
    ball.vx = 0
    ball.vy = 0
    balls.push(ball)
  }).bind(this))
}

function calculate () {
  balls.forEach(ball => {
    //gravity
    ball.vy += 0.15

    ball.y += ball.vy
    ball.x += ball.vx
  })
}

function collision () {

  balls.forEach(ball => {
    //bottom
    if (ball.y + ball.radius >= 600) {
      ball.y = 600 - ball.radius
      ball.vy = -ball.vy * 0.6
      ball.vx *= .98
    }

    if (ball.x + ball.radius >= 800) {
      ball.x = 800 - ball.radius
      ball.vx = -ball.vx * 0.9
    }

    if (ball.x - ball.radius <= 0) {
      ball.x = 0 + ball.radius
      ball.vx = -ball.vx * 0.9
    }
  })

  for (var i=0; i<balls.length-1; i++) {
    for (var j=i+1; j<balls.length; j++) {
      var s = balls[i]
      var t = balls[j]

      var a = Math.abs(s.x - t.x)
      var b = Math.abs(s.y - t.y)
      var c = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2))
      if (c <= s.radius + t.radius) {
        var cx = (s.x + t.x) / 2
        var cy = (s.y + t.y) / 2
        
        var svx = t.vx
        var svy = t.vy

        var tvx = s.vx
        var tvy = s.vy

        s.vx = svx
        s.vy = svy
        t.vx = tvx
        t.vy = tvy
      }
    }
  }
} 

function friction () {
  balls.forEach(ball => {
    ball.vx *= 0.998
    ball.vy *= 0.998
  })
}

function update () {
  calculate.call(this)
  collision.call(this)
  friction.call(this)
}
