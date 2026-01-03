import { GLRunner, toClipCoords } from "../runner";
import { vec2 } from "../../utils/vector";
import { BOUNDING_BOX, NONEX } from "../common";
import { line3D } from "../../render/shape3d";
import { GLRunnerProgram3D } from "../runner/types";

type Line = ReturnType<typeof line3D>;

const runner = new GLRunner();
let gShapes: Line[] | undefined;
let precision = 200;

function usePlot(program: GLRunnerProgram3D, shapes: Line[]) {
  if (gShapes) gShapes.forEach((shape) => program.removeShape(shape));
  gShapes = shapes;
  program.useShapes(shapes);
}

function initPlot(program: GLRunnerProgram3D, fn: (x: number) => number) {
  const shapes = Array.from({ length: precision }, (_, i) =>
    line3D(
      toClipCoords(
        vec2([i / precision, fn(i / precision)])
          .multiply(0.8)
          .add(vec2([0.1, 0.1]))
      ),
      toClipCoords(
        vec2([(i + 1) / precision, fn((i + 1) / precision)])
          .multiply(0.8)
          .add(vec2([0.1, 0.1]))
      ),
      0.001
    )
  );
  usePlot(program, shapes);
}

export default async function init(fn: (x: number) => number) {
  const program = await runner.createRunnerProgram3D((builder) =>
    builder.useTime()
  );
  program.use().useShape(BOUNDING_BOX);
  window.addEventListener("keydown", (ev) => {
    if (ev.key === "ArrowUp") {
      precision += 1;
      initPlot(program, fn);
    }
    if (ev.key === "ArrowDown") {
      precision -= 1;
      initPlot(program, fn);
    }
  });
  runner.setClearColor(NONEX.get());
  initPlot(program, fn);
  animate(program);
}

function animate(program: GLRunnerProgram3D, time = 0) {
  runner.clear();
  program.draw(time);
  requestAnimationFrame((time) => animate(program, time));
}
