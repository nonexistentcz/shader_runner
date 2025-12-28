import convert from "color-convert";
import { outline } from "../../render";
import { vec3, Vec3, Vec3Array } from "../../utils";
import { NONEX } from "../common";
import { GLRunner } from "../runner";
import { randomMapped } from "../shapes/shape";
import { uniform3fv } from "../../gl";
import { GLRunnerProgram } from "../runner/gl-runner-program";
import { GLRunnerShape } from "../runner/types";

const runner = new GLRunner().setClearColor(NONEX.get());
const shape = outline([[0, 0]], 0.1, false);
const uColor = uniform3fv(
  "u_Color",
  convert.lch
    .rgb(70, 30, randomMapped(180, 360))
    .map((val) => val / 255) as Vec3Array
);

export default async function init() {
  const program = await runner.createRunnerProgram((builder) =>
    builder
      .useCustomShape((shape: GLRunnerShape<{ color: Vec3 }>) => shape.shape)
      .fragmentUrl("/shader/color.frag")
      .uniform(uColor)
      .useBeforeShapeDraw(({ color }) => {
        uColor.update(color.get());
      })
  );

  program.use().useShape({
    shape,
    color: vec3(
      convert.lch
        .rgb(70, 30, randomMapped(180, 360))
        .map((val) => val / 255) as Vec3Array
    ),
  });
  runner.onMouseMove((vec) => {
    shape.setVertex(shape.vertices.length - 1, vec);
    shape.updateBuffers();
  });
  runner.getCanvas().el.addEventListener("click", () => {
    shape.pushVertex(runner.mouse);
    shape.setVertex(shape.vertices.length - 1, runner.mouse);
    shape.updateBuffers();
  });
  animate(program);
}

function animate(
  program: GLRunnerProgram<GLRunnerShape<{ color: Vec3 }>>,
  time = 0
) {
  runner.clear();
  program.draw(time);
  requestAnimationFrame((time) => animate(program, time));
}
