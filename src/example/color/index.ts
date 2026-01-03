import { GLRunner } from "../runner";
import { Vec3 } from "../../utils/vector";
import {
  collideBallWall,
  createShape,
  handleCollisionBallBall,
} from "../shapes/shape";
import { uniform3fv } from "../../gl";
import { GLRunnerProgram3D, GLRunnerShape3D } from "../runner/types";
import { rectangle3D } from "../../render/shape3d";
import { getRandomPastelColor } from "../utils";

const runner = new GLRunner().setClearColor([1, 1, 1, 1]);
const defaultColor = getRandomPastelColor();
const uColor = uniform3fv("u_Color", defaultColor.get());

const shapes = Array.from(
  { length: 20 },
  () => [createShape(), getRandomPastelColor()] as const,
);

function update() {
  shapes.forEach(([ball]) => {
    shapes.forEach(([ballInner]) => {
      if (ball === ballInner) return;
      handleCollisionBallBall(ball, ballInner);
    });
    collideBallWall(ball);
  });
  shapes.forEach(([ball]) => {
    ball.obj.transform.setCenter(
      ball.obj.transform.center.toVec2().add(ball.speed.multiply(0.5)).toVec3(),
    );
  });
}

export default async function init() {
  const program = await runner.createRunnerProgram3D((builder) =>
    builder
      .fragmentUrl("/shader/color.frag")
      .uniform(uColor)
      .useCustomShape(
        (glShape: GLRunnerShape3D<{ color: Vec3 }>) => glShape.shape,
      )
      .useBeforeShapeDraw(({ color }) => uColor.update(color.get())),
  );
  program.use();
  shapes.forEach(([shape, color]) =>
    program.useShape({ shape: shape.obj, color }),
  );

  program.useShape({ shape: rectangle3D(2.2, 2.2, 0.1), color: defaultColor });

  draw(program);
}

function draw(
  program: GLRunnerProgram3D<GLRunnerShape3D<{ color: Vec3 }>>,
  time = 0,
) {
  update();
  runner.clear();
  program.draw(time);
  requestAnimationFrame((time) => draw(program, time));
}
