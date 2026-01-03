import { GLRunner } from "../runner";
import { intersectionLineLine, vec2 } from "../../utils/vector";
import { BOUNDING_BOX, NONEX } from "../common";
import { GLRunnerProgram3D } from "../runner/types";
import { circle3D, line3D } from "../../render/shape3d";

const line1 = line3D(vec2([-0.5, -0.5]), vec2([0, -0.4]), 0.001);
const line2 = line3D(vec2([0, 0]), vec2([0, 0]), 0.001);
const intersection = circle3D(0.005, 20);

const runner = new GLRunner();

export default async function init() {
  const program = await runner.createRunnerProgram3D((builder) =>
    builder.useTime(),
  );
  program.use().useShapes([line1, line2, BOUNDING_BOX, intersection]);
  runner.setClearColor(NONEX.get());
  runner.onMouseMove((coords) => {
    line2.setEnd(coords.clip).updateBuffers();
    intersection.transform.setCenter(
      intersectionLineLine(
        line1.x1,
        line1.getVector(),
        line2.x1,
        line2.getVector(),
      ).toVec3(),
    );
  });
  draw(program);
}

function draw(program: GLRunnerProgram3D, time = 0) {
  runner.clear();
  program.draw(time);
  requestAnimationFrame((time) => draw(program, time));
}
