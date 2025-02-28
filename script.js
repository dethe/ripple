/* global Ring createCanvas createCapture translate VIDEO scale line stroke noStroke random windowWidth windowHeight ceil floor 
   createGraphics width height second RADIUS PIE ellipse ellipseMode drawingContext background dist image key resizeCanvas beginClip arc TWO_PI endClip frameCount round frameRate max min fill text push pop */

let capture;
let min_buffer = 30;
let buffer_size = 120;
let new_buffer = 120;
let max_buffer = 300;
// let circle_buffer = 45;
const buffer = new Ring(max_buffer);
let vwidth = 0;
let vheight = 0;
let renderer;
let captureRatio = 0;
let initialized = false;
let maxRadius = 0;

function setup() {
  renderer = createCanvas(windowWidth, windowHeight);
  maxRadius = dist(0, 0, width / 2, height / 2);
  capture = createCapture(VIDEO, { flipped: false }, videoInitialized);
  capture.hide();
  ellipseMode(RADIUS);
}

function videoInitialized(stream) {
  initialized = true;
  let settings = stream.getVideoTracks()[0].getSettings();
  vwidth = settings.width;
  vheight = settings.height;
  captureRatio = vheight / vwidth;
  for (let i = 0; i < max_buffer; i++) {
    buffer.push(createGraphics(vwidth, vheight));
  }
  reset();
}

function reset() {
  let newWidth = windowHeight / captureRatio;
  resizeCanvas(newWidth, windowHeight);
}

document.addEventListener(
  "fullscreenchange",
  function () {
    reset();
  },
  false
);

function staticlines() {
  for (let y = 0; y < height; y++) {
    line(0, y, width, y);
    stroke(random(256));
  }
}

class Horizontal {
  draw() {
    // draw slices left to right
    let slice = width / buffer_size;
    let vslice = vwidth / buffer_size;
    buffer.forEach((img, idx) => {
      image(
        img,
        floor(idx * slice),
        0,
        ceil(slice),
        height,
        floor(idx * vslice),
        0,
        ceil(vslice),
        vheight
      );
    }, buffer_size);
  }
}

class Vertical {
  draw() {
    let slice = height / buffer_size;
    let vslice = vheight / buffer_size;
    buffer.forEach((img, idx) => {
      image(
        img,
        0,
        floor(idx * slice),
        width,
        ceil(slice),
        0,
        floor(idx * vslice),
        vwidth,
        ceil(vslice)
      );
    }, buffer_size);
  }
}

class CircleExpanding {
  draw() {
    let sliceRadius = floor(maxRadius / buffer_size);
    buffer.forEach((img, idx) => {
      push();
      beginClip();
      ellipse(width / 2, height / 2, maxRadius - sliceRadius * idx);
      endClip();
      image(img, 0, 0, width, height, 0, 0, vwidth, vheight);
      pop();
    }, buffer_size);
  }
}

class CircleContracting {
  draw() {
    let sliceRadius = floor(maxRadius / buffer_size);
    buffer.forEachRev((img, idx) => {
      push();
      beginClip();
      ellipse(width / 2, height / 2, maxRadius - sliceRadius * idx);
      endClip();
      image(img, 0, 0, width, height, 0, 0, vwidth, vheight);
      pop();
    }, buffer_size);
  }
}

class CircleRotating {
  draw() {
    let sliceAngle = TWO_PI / buffer_size;
    let offset = (TWO_PI / 60) * second();
    buffer.forEach((img, idx) => {
      push();
      beginClip();
      arc(width/2, height/2, maxRadius, maxRadius, sliceAngle * -(idx + 1) - offset - 0.01,sliceAngle * -idx - offset, PIE);
      endClip();
      image(img, 0, 0, width, height, 0, 0, vwidth, vheight);
      pop();
    }, buffer_size);
  }
}

let tools = new Ring([
  new Horizontal(),
  new Vertical(),
  new CircleExpanding(),
  new CircleContracting(),
  new CircleRotating(),
]);

function checkBufferSize() {
  // support changing how many slices are used, for performance tweaking
  if (new_buffer !== buffer_size) {
    buffer_size = new_buffer;
    reset();
  }
}

function captureFrame() {
  // first buffer becomes last
  buffer.rotate().image(capture, 0, 0);
}

function mirroredDraw(tool) {
  // mirror
  push();
  scale(-1, 1);
  translate(-width, 0);
  tool.draw();
  pop();
}

function draw() {
  checkBufferSize();
  // is video stream initialized?
  if (!initialized) {
    background(0);
    staticlines();
    return;
  }
  captureFrame();
  background(255);
  mirroredDraw(tools.curr());
}

function windowResized() {
  reset();
}

function keyTyped() {
  switch (key) {
    case "f":
      renderer.canvas.requestFullscreen();
      break;
    case "a":
      tools.prev();
      break;
    case "d":
      tools.next();
      break;
    case "s":
      new_buffer = max(buffer_size - 30, min_buffer);
      break;
    case "w":
      new_buffer = min(buffer_size + 30, max_buffer);
      break;
    case "1":
      tools.idx = 0;
      break;
    case "2":
      tools.idx = 1;
      break;
    case "3":
      tools.idx = 2;
      break;
    case "4":
      tools.idx = 3;
      break;
    case "5":
      tools.idx = 4;
      break;
  }
  return false;
}
