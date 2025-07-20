import { outline } from "../../render";
import { NONEX } from "../common";
import { Runner } from "../runner";

const runner = new Runner();
const shape = outline([], 0.1, false);

export default async function init() {
  runner.init();
  runner.useShape(shape);
  runner.setClearColor(NONEX.get());
  runner.getCanvas().el.addEventListener("click", () => {
    shape.pushVertex(runner.mouse);
    shape.updateBuffers();
  });
  animate();
}

function animate(time = 0) {
  runner.draw(time);
  runner.clear();
  requestAnimationFrame(animate);
}
