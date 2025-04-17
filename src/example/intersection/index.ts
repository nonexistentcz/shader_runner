import { Runner } from "../runner";
import { circle, line } from "../../shapes";
import { intersectionLineLine, vec2 } from "../../utils/vector";
import { BOUNDING_BOX, NONEX } from "../common";

const line1 = line(vec2([-0.5, -0.5]), vec2([0, -0.4]), 0.001);
const line2 = line(vec2([0, 0]), vec2([0, 0]), 0.001);
const intersection = circle(0.005, 20);

const runner = new Runner();

export default async function init() {
  await runner.init();
  runner.use([line1, line2, BOUNDING_BOX, intersection]);
  runner.setClearColor(NONEX.get());
  runner.onMouseMove((coords) => {
    line2.setEnd(coords).updateBuffers();
    intersection.setCenter(
      intersectionLineLine(
        line1.x1,
        line1.getVector(),
        line2.x1,
        line2.getVector()
      ).toVec3()
    );
  });
  draw();
}

function draw(time = 0) {
  runner.clear();
  runner.draw(time);
  requestAnimationFrame(draw);
}
