import { Runner } from "../runner";
import { createShape, handleCollisionBallBall, collideBallWall } from "./shape";
import { BOUNDING_BOX, NONEX } from "../common";

export type Shape = ReturnType<typeof createShape>;

export const SHAPE_SIZE = 0.05;

const runner = new Runner();

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

export default async function init() {
  await runner.init();
  runner.use([BOUNDING_BOX]);
  runner.setClearColor(NONEX.get());
  animate();
}

function animate(time = 0) {
  update();
  runner.clear();
  runner.draw(time);
  requestAnimationFrame(animate);
}
