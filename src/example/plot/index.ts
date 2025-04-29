import { Runner, toClipCoords } from "../runner";
import { line } from "../../shapes";
import { vec2 } from "../../utils/vector";
import { BOUNDING_BOX, NONEX } from "../common";

type Line = ReturnType<typeof line>;

const runner = new Runner();
let gShapes: Line[] | undefined;
let precision = 200;

function usePlot(shapes: Line[]) {
  if (gShapes) gShapes.forEach((shape) => runner.removeShape(shape));
  gShapes = shapes;
  runner.use(shapes);
}

function initPlot(fn: (x: number) => number) {
  const shapes = Array.from({ length: precision }, (_, i) =>
    line(
      toClipCoords(vec2([i / precision, fn(i / precision)])),
      toClipCoords(vec2([(i + 1) / precision, fn((i + 1) / precision)])),
      0.01
    )
  );
  usePlot(shapes);
}

export default async function init(fn: (x: number) => number) {
  await runner.init();
  runner.use([BOUNDING_BOX]);
  window.addEventListener("keydown", (ev) => {
    if (ev.key === "ArrowUp") {
      precision += 1;
      initPlot(fn);
    }
    if (ev.key === "ArrowDown") {
      precision -= 1;
      initPlot(fn);
    }
  });
  runner.setClearColor(NONEX.get());
  initPlot(fn);
  animate();
}

function animate(time = 0) {
  runner.clear();
  runner.draw(time);
  requestAnimationFrame(animate);
}
