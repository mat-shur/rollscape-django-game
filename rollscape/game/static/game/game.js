const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

const screenWidth = canvas.width;
const screenHeight = canvas.height;

const elements_size = screenWidth / 20;
const enemy_color = '#FF6961';
const friendly_color = '#AADD77';

let shapes = {};
let shapeIndex = 0;
const shapeGenerateSpeed = 400;

let dude;

let score = 0;

let moveLeft = false;
let moveRight = true;

let stopped = false;
let left = false;
let moved = false;


document.addEventListener('keydown', (e) => {
  if (left) return;
  if (stopped) return;
  if (!moved) moved = true;

  if (e.code === 'ControlLeft') {
    moveLeft = !moveLeft;
    moveRight = !moveRight;
  }
});


document.addEventListener('visibilitychange', (e) => {
  if (document.visibilityState === 'visible') {
    if (left) left = false;
    console.log('not left', left);
  } else {
    if (!left) left = true;
    console.log('left', left);
  }
});


class Shape {
  constructor(posX) {
    this.targetX = dude.position.x;
    this.targetY = canvas.height + (canvas.height / 10);

    this.width = elements_size * 2;
    this.height = elements_size * 2;

    this.position = {
      x: posX,
      y: -this.height
    };

    this.rotationSpeed = Math.random() * 0.1 - 0.05;
    this.angle = this.rotationSpeed;

    this.velocity = Math.random() + elements_size / 4;

    this.collectable = Math.random() < 0.9 ? true : false;
    this.color = this.collectable ? enemy_color : friendly_color;

    this.index = shapeIndex;
    shapes[shapeIndex++] = this;
  }

  checkEdge() {
    if (this.position.y >= screenHeight) {
      delete shapes[this.index];
    }
  }

  updatePosition() {
    const dx = this.targetX - (this.position.x + this.width / 2);
    const dy = this.targetY - (this.position.y + this.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    const vx = Math.cos(angle) * this.velocity;
    const vy = Math.sin(angle) * this.velocity;

    this.position.x += vx;
    this.position.y += vy;

    this.checkEdge();
  }

  draw() {
    ctx.save();
    ctx.translate(this.position.x + this.width / 2, this.position.y + this.height / 2);
    this.angle += this.rotationSpeed;
    ctx.rotate(this.angle);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();
  }

  update() {
    this.updatePosition();
    this.draw();
  }
}


class Dude {
  constructor() {
    this.radius = elements_size;

    this.position = {
      x: canvas.width / 2,
      y: canvas.height / 1.2
    };

    this.velocity = {
      x: 0,
      y: 0,
    };

    this.color = friendly_color;
  }

  checkCollisions() {
    const collision = (circle, rectangle) => {
      const cx = circle.position.x;
      const cy = circle.position.y;
      const cr = circle.radius;

      const rx = rectangle.position.x + rectangle.width / 2;
      const ry = rectangle.position.y + rectangle.height / 2;
      const rw = rectangle.width;
      const rh = rectangle.height;

      const angle = rectangle.angle;

      const unrotatedCircleX = Math.cos(-angle) * (cx - rx) - Math.sin(-angle) * (cy - ry) + rx;
      const unrotatedCircleY = Math.sin(-angle) * (cx - rx) + Math.cos(-angle) * (cy - ry) + ry;

      const closestX = Math.min(Math.max(unrotatedCircleX, rx - rw / 2), rx + rw / 2);
      const closestY = Math.min(Math.max(unrotatedCircleY, ry - rh / 2), ry + rh / 2);

      const dx = unrotatedCircleX - closestX;
      const dy = unrotatedCircleY - closestY;

      const distance = Math.sqrt(dx * dx + dy * dy);

      return distance <= cr;
    };

    for (const i in shapes) {
      if (collision(this, shapes[i])) {
        if (shapes[i].color === friendly_color) {
          score += 1;
          delete shapes[i];
        } else {
          stopped = true;
          sendScoreToDatabase();
        }
      }
    }
  }

  updatePosition() {
    if ((this.position.x + this.radius) > (canvas.width - (canvas.width / 10))) {
      moveRight = false;
      moveLeft = true;
    } else if ((this.position.x - this.radius) < canvas.width / 10) {
      moveRight = true;
      moveLeft = false;
    }

    if (moveRight) {
      this.position.x += elements_size / 5;
    } else if (moveLeft) {
      this.position.x -= elements_size / 5;
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.checkCollisions();
    this.updatePosition();
    this.draw();
  }
}


function newGame() {
  for (const i in shapes) {
    delete shapes[i];
  }

  dude = new Dude();
  shapes = {};

  score = 0;
}


function shapeGenerate() {
  if (left) return;
  if (stopped) return;

  new Shape(Math.random() * canvas.offsetWidth, 40, 40);
}


function Updater() {
  if (left) return;
  if (stopped) return;

  ctx.clearRect(0, 0, screenWidth, screenHeight);

  ctx.beginPath();
  ctx.roundRect(canvas.width / 10, canvas.height / 1.2 - elements_size, canvas.width - (canvas.width / 5), elements_size * 2, elements_size);
  ctx.fillStyle = "#BFBFBF22";
  ctx.fill();

  ctx.font = canvas.height / 3 + "px serif";
  ctx.textBaseline = 'middle';
  ctx.textAlign = "center";
  ctx.fillText(score, canvas.width / 2, canvas.height / 2);

  if (!moved) {
    ctx.font = canvas.height / 30 + "px serif";
    ctx.textBaseline = 'middle';
    ctx.textAlign = "center";
    ctx.fillText("'Left Ctrl' to swap direction", canvas.width / 2, canvas.height / 1.04);
  }

  for (const i in shapes) {
    shapes[i].update();
  }

  dude.update();
}


function restartGame() {
  newGame();
  stopped = false;
}


function sendScoreToDatabase() {
  $.ajax({
    url: "/game/u",
    type: 'POST',
    headers: {'X-CSRFToken': csrf_token},
    dataType: 'html',
    data: {'score': score},
    success: function(response) {
      $('#award_body').html(response);
    },
    error: function(xhr, status, error) {
      // handle error
    }
  });
}


newGame();

setInterval(Updater, 10);
setInterval(shapeGenerate, shapeGenerateSpeed);
