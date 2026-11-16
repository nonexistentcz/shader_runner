import { uniform3fv } from "../../gl";
import { circle2D } from "../../render/shape2d";
import { Vec3 } from "../../utils";
import { GLRunner } from "../runner";
import { GLRunnerShape2D } from "../runner/types";
import { getRandomPastelColor } from "../utils";

const runner = new GLRunner();
const mouseShape = circle2D(50, 3);
const uColor = uniform3fv("u_Color", getRandomPastelColor().get());

export default async function init() {
  const program = await runner.createRunnerProgram2D((program) =>
    program
      .useCustomShape((shape: GLRunnerShape2D<{ color: Vec3 }>) => shape.shape)
      .fragmentUrl("/shader/noise.frag")
      .uniform(uColor)
      .useBeforeShapeDraw(({ color }) => uColor.update(color.get())),
  );
  program.use();
  program.useShape({ shape: mouseShape, color: getRandomPastelColor() });
  runner.onMouseMove(({ screen }) => mouseShape.transform.setCenter(screen));

  draw();
  runner.setClearColor([0, 0, 0, 0]);

  function draw(time = 0) {
    mouseShape.transform.angle = time / 500;
    runner.clear();
    program.draw();
    requestAnimationFrame(draw);
  }
}
