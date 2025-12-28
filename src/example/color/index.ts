import { GLRunner } from "../runner";
import { rectangle } from "../../render/shapes";
import { vec3, Vec3, Vec3Array } from "../../utils/vector";
import {
  collideBallWall,
  createShape,
  handleCollisionBallBall,
  randomMapped,
} from "../shapes/shape";
import { uniform3fv } from "../../gl";
import convert from "color-convert";
import { GLRunnerShape } from "../runner/types";
import { GLRunnerProgram } from "../runner/gl-runner-program";

const runner = new GLRunner().setClearColor([1, 1, 1, 1]);
const defaultColor = getRandomPastelColor();
const uColor = uniform3fv("u_Color", defaultColor.get());

function getRandomPastelColor() {
  return vec3(
    convert.lch
      .rgb(70, 30, randomMapped(180, 360))
      .map((val) => val / 255) as Vec3Array
  );
}

const shapes = Array.from(
  { length: 20 },
  () => [createShape(), getRandomPastelColor()] as const
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
    ball.obj.setCenter(
      ball.obj.center.toVec2().add(ball.speed.multiply(0.5)).toVec3()
    );
  });
}

export default async function init() {
  const program = await runner.createRunnerProgram((builder) =>
    builder
      .fragmentUrl("/shader/color.frag")
      .uniform(uColor)
      .useCustomShape(
        (glShape: GLRunnerShape<{ color: Vec3 }>) => glShape.shape
      )
      .useBeforeShapeDraw(({ color }) => uColor.update(color.get()))
  );
  program.use();
  shapes.forEach(([shape, color]) =>
    program.useShape({ shape: shape.obj, color })
  );

  program.useShape({ shape: rectangle(2.2, 2.2, 0.1), color: defaultColor });

  draw(program);
}

function draw(
  program: GLRunnerProgram<GLRunnerShape<{ color: Vec3 }>>,
  time = 0
) {
  update();
  runner.clear();
  program.draw(time);
  requestAnimationFrame((time) => draw(program, time));
}
