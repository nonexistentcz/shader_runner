import convert from "color-convert";
import { outline, polygon } from "../../render";
import { vec2, vec3, Vec3, Vec3Array } from "../../utils";
import { NONEX } from "../common";
import { Runner } from "../runner";
import { randomMapped } from "../shapes/shape";
import { uniform3fv } from "../../gl";

const runner = new Runner<{ color: Vec3 }>();
const shape = outline([[0, 0]], 0.1, false);
const poly = polygon([]);
const color = uniform3fv(
  "u_Color",
  convert.lch
    .rgb(70, 30, randomMapped(180, 360))
    .map((val) => val / 255) as Vec3Array
);

export default async function init() {
  await runner.init({ fragmentShaderUrl: "/shader/color.frag" });
  runner
    .useShape(shape, {
      color: vec3(
        convert.lch
          .rgb(70, 30, randomMapped(180, 360))
          .map((val) => val / 255) as Vec3Array
      ),
    })
    .useUniform(color);
  runner.setClearColor(NONEX.get());
  runner.onMouseMove((vec) => {
    shape.setVertex(shape.vertices.length - 1, vec);
    shape.updateBuffers();
  });
  runner.getCanvas().el.addEventListener("click", () => {
    shape.pushVertex(runner.mouse);
    shape.setVertex(shape.vertices.length - 1, runner.mouse);
    shape.updateBuffers();
  });

  runner.useBeforeDraw((props) => {
    if (!props) return;
    color.update(props.color.get());
  });
  animate();
}

function animate(time = 0) {
  runner.clear();
  runner.draw(time);
  requestAnimationFrame(animate);
}
