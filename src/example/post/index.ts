import { rectangle } from "../../render";
import { vec3 } from "../../utils";
import { NONEX } from "../common";
import { Runner } from "../runner";

const runner = new Runner();
const shape = rectangle(0.5, 0.5, 0.2);

export default async function init() {
  await runner.init();
  const framebuffer = runner.prepareFramebuffer().bind();
  runner.useShape(shape);
  runner.setClearColor(NONEX.get());
  animate();
}

function animate(time = 0) {
  runner.clear();
  shape.rotation = shape.rotation.add(vec3([0, 0, 0.01]));

  runner.draw(time);
  requestAnimationFrame(animate);
}
