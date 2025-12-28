import { circle, GLShape, line } from "../../render/shapes";
import { cubicBezier } from "../../utils";
import { vec3 } from "../../utils";
import { BOUNDING_BOX, NONEX } from "../common";
import { GLRunner } from "../runner";
import { GLRunnerProgram } from "../runner/gl-runner-program";

const runner = new GLRunner();
const points = [
  circle(0.004, 20).setCenter(vec3([-0.8, -0.8, 0])),
  circle(0.004, 20).setCenter(vec3([0.8, -0.8, 0])),
  circle(0.004, 20).setCenter(vec3([-0.8, 0.8, 0])),
  circle(0.004, 20).setCenter(vec3([0.8, 0.8, 0])),
];
let lines: GLShape[] | undefined = undefined;

let selected: number = -1;
const DISTANCE = 0.2;
const SEGMENT_COUNT = 40;

function cubic(t: number) {
  return cubicBezier(
    points[0].center.toVec2(),
    points[1].center.toVec2(),
    points[2].center.toVec2(),
    points[3].center.toVec2(),
    t
  );
}

const pointLines = [
  line(points[0].center.toVec2(), points[1].center.toVec2(), 0.001),
  line(points[2].center.toVec2(), points[3].center.toVec2(), 0.001),
];

function createCubicArray() {
  return Array.from({ length: SEGMENT_COUNT }, (_, i) => [
    circle(0.004, 5).setCenter(cubic(i / SEGMENT_COUNT).toVec3()),
    line(cubic(i / SEGMENT_COUNT), cubic((i + 1) / SEGMENT_COUNT), 0.002),
  ]).flat();
}

function updateLines(program: GLRunnerProgram) {
  if (lines) lines.forEach((lineObj) => program.removeShape(lineObj));
  lines = createCubicArray();
  program.useShapes(lines);
}

export default async function init() {
  const program = await runner.createRunnerProgram((builder) =>
    builder.useTime()
  );
  program.use().useShape(BOUNDING_BOX).useShapes(points).useShapes(pointLines);
  runner.setClearColor(NONEX.get());
  runner.onMouseMove((coords) => {
    if (selected === -1) return;
    points[selected].setCenter(coords.toVec3());
    const selectedLine = pointLines[Math.floor(selected / 2)];
    if (selected % 2 === 1) {
      selectedLine.setEnd(coords);
    } else {
      selectedLine.setStart(coords);
    }
    selectedLine.updateBuffers();
    updateLines(program);
  });
  const canvasEl = runner.getCanvas().el;
  canvasEl.addEventListener("mousedown", () => {
    selected = points.findIndex(
      (point) => point.center.toVec2().distanceTo(runner.mouse) < DISTANCE
    );
  });
  updateLines(program);
  canvasEl.addEventListener("mouseup", () => (selected = -1));
  runner.onMouseMove(() => {
    if (selected) updateLines(program);
  });
  draw(program);
}

function draw(program: GLRunnerProgram, time = 0) {
  runner.clear();
  program.draw(time);
  requestAnimationFrame((time) => draw(program, time));
}
