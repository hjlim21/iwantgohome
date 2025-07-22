// 종횡비를 고정하고 싶을 경우: 아래 두 변수를 0이 아닌 원하는 종, 횡 비율값으로 설정.
// 종횡비를 고정하고 싶지 않을 경우: 아래 두 변수 중 어느 하나라도 0으로 설정.
const aspectW = 4;
const aspectH = 3;
// html에서 클래스명이 container-canvas인 첫 엘리먼트: 컨테이너 가져오기.
const container = document.body.querySelector('.container-canvas');
// 필요에 따라 이하에 변수 생성.
let video;
let handPose;
let hands = [];
let drawing = [];
let removeButton;
let colorButtons = [];
let currentColor = 'white';
let bgImage;

function preload() {
  handPose = ml5.handPose({ flipped: true });
}

function setup() {
  // 컨테이너의 현재 위치, 크기 등의 정보 가져와서 객체구조분해할당을 통해 너비, 높이 정보를 변수로 추출.
  const { width: containerW, height: containerH } =
    container.getBoundingClientRect();
  // 종횡비가 설정되지 않은 경우:
  // 컨테이너의 크기와 일치하도록 캔버스를 생성하고, 컨테이너의 자녀로 설정.
  if (aspectW === 0 || aspectH === 0) {
    createCanvas(containerW, containerH).parent(container);
  }
  // 컨테이너의 가로 비율이 설정한 종횡비의 가로 비율보다 클 경우:
  // 컨테이너의 세로길이에 맞춰 종횡비대로 캔버스를 생성하고, 컨테이너의 자녀로 설정.
  else if (containerW / containerH > aspectW / aspectH) {
    createCanvas((containerH * aspectW) / aspectH, containerH).parent(
      container
    );
  }
  // 컨테이너의 가로 비율이 설정한 종횡비의 가로 비율보다 작거나 같을 경우:
  // 컨테이너의 가로길이에 맞춰 종횡비대로 캔버스를 생성하고, 컨테이너의 자녀로 설정.
  else {
    createCanvas(containerW, (containerW * aspectH) / aspectW).parent(
      container
    );
  }
  init();

  // createCanvas를 제외한 나머지 구문을 여기 혹은 init()에 작성.
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  handPose.detectStart(video, gotHands);

  removeButton = createButton('Remove');
  removeButton.position(20, 20);
  removeButton.mousePressed(clearDrawing);

  createColorButton('GREEN', '#33FF00', 100, 20);
  createColorButton('BLUE', '#0033FF', 177, 20);
  createColorButton('PINK', '#FF0099', 242, 20);
  createColorButton('BLACK', '#000000', 303, 20);
}

// windowResized()에서 setup()에 준하는 구문을 실행해야할 경우를 대비해 init이라는 명칭의 함수를 만들어 둠.
function init() {}

function createColorButton(label, color, x, y) {
  let button = createButton(label);
  button.position(x, y);
  button.style('background-color', color);
  button.style('color', 'white');
  button.mousePressed(() => setColor(color));
  colorButtons.push(button);
}

function setColor(color) {
  currentColor = color;
}

function draw() {
  background('white');
  image(video, 0, 0, width, height); // 비디오를 캔버스 크기에 맞춰 그림
  scale(-1, 1);
  video.size(640, 480);
  video.hide();

  if (hands.length > 0) {
    let index = hands[0].keypoints[8];
    let scaledX = map(index.x, 0, video.width, 0, width); // x 좌표 스케일링
    let scaledY = map(index.y, 0, video.height, 0, height); // y 좌표 스케일링

    noFill();
    stroke(0, 255, 0);
    strokeWeight(1);
    text('Finger', scaledX, scaledY); // 스케일된 좌표 사용
    textSize(20);
  }

  for (let idx = 0; idx < hands.length; idx++) {
    let indexFinger = hands[idx].keypoints[8];
    if (indexFinger) {
      let scaledX = map(indexFinger.x, 0, video.width, 0, width);
      let scaledY = map(indexFinger.y, 0, video.height, 0, height);
      drawing.push({ x: scaledX, y: scaledY, color: currentColor });
    }
  }

  strokeWeight(10);
  noFill();
  beginShape();
  for (let idx = 0; idx < drawing.length; idx++) {
    stroke(drawing[idx].color);
    vertex(drawing[idx].x, drawing[idx].y); // 스케일된 좌표로 그리기
  }
  endShape();

  fill(255);
  stroke(0);
  strokeWeight(10);
  textAlign(CENTER);
  textSize(30);
  text('Home Sweet Home', width / 2, height - 20);
}

function gotHands(results) {
  hands = results;
}

function clearDrawing() {
  drawing = [];
}

function windowResized() {
  // 컨테이너의 현재 위치, 크기 등의 정보 가져와서 객체구조분해할당을 통해 너비, 높이 정보를 변수로 추출.
  const { width: containerW, height: containerH } =
    container.getBoundingClientRect();
  // 종횡비가 설정되지 않은 경우:
  // 컨테이너의 크기와 일치하도록 캔버스 크기를 조정.
  if (aspectW === 0 || aspectH === 0) {
    resizeCanvas(containerW, containerH);
  }
  // 컨테이너의 가로 비율이 설정한 종횡비의 가로 비율보다 클 경우:
  // 컨테이너의 세로길이에 맞춰 종횡비대로 캔버스 크기를 조정.
  else if (containerW / containerH > aspectW / aspectH) {
    resizeCanvas((containerH * aspectW) / aspectH, containerH);
  }
  // 컨테이너의 가로 비율이 설정한 종횡비의 가로 비율보다 작거나 같을 경우:
  // 컨테이너의 가로길이에 맞춰 종횡비대로 캔버스 크기를 조정.
  else {
    resizeCanvas(containerW, (containerW * aspectH) / aspectW);
  }
  // 위 과정을 통해 캔버스 크기가 조정된 경우, 다시 처음부터 그려야할 수도 있다.
  // 이런 경우 setup()의 일부 구문을 init()에 작성해서 여기서 실행하는게 편리하다.
  init();
}
