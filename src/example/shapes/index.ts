import { GLRunner } from "../runner";
import { createShape, handleCollisionBallBall, collideBallWall } from "./shape";
import { BOUNDING_BOX, NONEX } from "../common";
import { GLRunnerProgram3D } from "../runner/types";

export type Shape = ReturnType<typeof createShape>;

export const SHAPE_SIZE = 0.05;

const runner = new GLRunner().setClearColor(NONEX.get());

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
    ball.obj.transform.setCenter(
      ball.obj.transform.center.toVec2().add(ball.speed).toVec3()
    );
  });
}

export default async function init() {
  const program = await runner.createRunnerProgram3D((builder) =>
    builder.useTime()
  );
  program.use();
  program.useShape(BOUNDING_BOX);

  window.addEventListener("keydown", (ev) => {
    if (ev.key === "ArrowUp") {
      const ball = createShape();
      program.useShape(ball.obj);
      shapes.push(ball);
    }
    if (ev.key === "ArrowDown") {
      const obj = shapes.pop()?.obj;
      if (!obj) return;
      program.removeShape(obj);
    }
  });
  animate(program);
}

function animate(program: GLRunnerProgram3D, time = 0) {
  update();
  runner.clear();
  program.draw(time);
  requestAnimationFrame((time) => animate(program, time));
}
