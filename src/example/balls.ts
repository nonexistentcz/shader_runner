import { GLCanvas } from "../canvas";
import { Runner } from "../runner";
import { ring } from "../shapes";
import { uniform1f, uniform2fv } from "../uniform";
import { radians, vec2, vec3, Vec3Array, vec4 } from "../utils/vector";

type Ball = ReturnType<typeof createBall>;

const BALL_RADIUS = 0.1;
let precision = 15;

const runner = new Runner();
const uMouse = uniform2fv("u_Mouse", [0, 0]);
const uTime = uniform1f("u_Time", 0);

// Uniforms
const uResolution = uniform2fv("u_Resolution", [0, 0]);
const balls: Ball[] = [];

function randomMapped(x1: number, x2: number) {
  const size = x2 - x1;
  const offset = x1;
  return Math.random() * size + offset;
}

function createBall() {
  const angle = Math.random() * 2 * Math.PI;
  const speed = Math.random() * BALL_RADIUS * 0.1 + 0.005;
  return {
    speed: vec2([Math.sin(angle) * speed, Math.cos(angle) * speed]),
    obj: ring(BALL_RADIUS, BALL_RADIUS * 0.9, precision).setCenter(
      vec3([randomMapped(0.3, 0.9), randomMapped(0.3, 0.9), 0])
    ),
  };
}

function collideBallWall(ball: Ball) {
  const [x, y] = ball.obj.center.get();
  ball.speed = vec2([
    ball.speed.x *
      (x < -1 + BALL_RADIUS / 2 || x > 1 - BALL_RADIUS / 2 ? -1 : 1),
    ball.speed.y *
      (y < -1 + BALL_RADIUS / 2 || y > 1 - BALL_RADIUS / 2 ? -1 : 1),
  ]);
}

function collideBallBall(a: Ball, b: Ball) {
  const diff = b.obj.center.toVec2().subtract(a.obj.center.toVec2());
  const magnitude = diff.magnitude();
  if (magnitude > 2 * BALL_RADIUS) return;
  const normalizedDiffB = diff.normalize();
  const normalizedDiffA = normalizedDiffB.multiply(-1);
  a.speed = normalizedDiffA
    .multiply(2 * a.speed.dot(normalizedDiffA))
    .subtract(a.speed);
  b.speed = normalizedDiffB
    .multiply(2 * a.speed.dot(normalizedDiffB))
    .subtract(a.speed);
  a.obj.center = a.obj.center.toVec2().add(a.speed).toVec3();
  b.obj.center = b.obj.center.toVec2().add(b.speed).toVec3();
}

function update() {
  balls.forEach((ball) => {
    balls.forEach((ballInner) => {
      if (ball === ballInner) return;
      collideBallBall(ball, ballInner);
    });
    collideBallWall(ball);
    ball.obj.setCenter(ball.obj.center.toVec2().add(ball.speed).toVec3());
  });
}

window.addEventListener("keydown", (ev) => {
  if (ev.key === "ArrowUp") {
    const ball = createBall();
    runner.useShape(ball.obj);
    balls.push(ball);
  }
  if (ev.key === "ArrowDown") {
    const ball = balls.pop();
    if (ball) {
      runner.removeShape(ball.obj);
    }
  }
  if (ev.key === "ArrowRight" || ev.key === "ArrowLeft") {
    precision += ev.key === "ArrowRight" ? 1 : -1;
    balls.forEach((ball) => {
      ball.obj.precision = precision;
      ball.obj.updateBuffers();
    });
  }
});

function adjustCanvas(canvas: GLCanvas) {
  canvas.adjustSizeAndViewport();
  uResolution.update([canvas.el.width, canvas.el.height]);
}

export async function initBalls() {
  const canvas = runner.getCanvas();
  await runner.init();
  adjustCanvas(canvas);
  runner.useUniform(uMouse);
  runner.useUniform(uResolution);
  runner.useUniform(uTime);
  runner.setClearColor(vec4([0.66, 0.12, 0.28, 1]).get());
  runner.getCanvas().onResize((_, canvas) => adjustCanvas(canvas), false);
  canvas.el.tabIndex = 1;
  canvas.el.addEventListener("mousemove", async (ev) => {
    uMouse.update([ev.x, ev.y]);
  });
  animate();
}

function draw() {
  runner.clear();
  runner.draw();
}

function animate(time = 0) {
  update();
  draw();
  uTime.update(time);
  requestAnimationFrame(animate);
}
