import { GLCanvas } from "../../canvas";
import { Runner } from "../../runner";
import { rectangle } from "../../shapes";
import { uniform1f, uniform2fv } from "../../uniform";
import { vec4 } from "../../utils/vector";
import { createShape, handleCollisionBallBall, collideBallWall } from "./shape";

export type Shape = ReturnType<typeof createShape>;

export const SHAPE_SIZE = 0.05;

const runner = new Runner();
const box = rectangle(6, 6, 2);
const uMouse = uniform2fv("u_Mouse", [0, 0]);
const uTime = uniform1f("u_Time", 0);

// Uniforms
const uResolution = uniform2fv("u_Resolution", [0, 0]);
const shapes: Shape[] = [];

function update() {
  shapes.forEach((ball) => {
    shapes.forEach((ballInner) => {
      if (ball === ballInner) return;
      handleCollisionBallBall(ball, ballInner);
    });
    collideBallWall(ball);
  });
  shapes.forEach((ball) => {
    ball.obj.setCenter(ball.obj.center.toVec2().add(ball.speed).toVec3());
  });
}

window.addEventListener("keydown", (ev) => {
  if (ev.key === "ArrowUp") {
    const ball = createShape();
    runner.useShape(ball.obj);
    shapes.push(ball);
  }
  if (ev.key === "ArrowDown") {
    const obj = shapes.pop()?.obj;
    if (!obj) return;
    runner.removeShape(obj);
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
  runner.useShape(box);
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
