import { circle, GLShape, line } from "../../shapes";
import { cubicBezier } from "../../utils/ease";
import { vec3 } from "../../utils/vector";
import { BOUNDING_BOX, NONEX } from "../common";
import { Runner } from "../runner";

const runner = new Runner();
const points = [
  circle(0.008, 20).setCenter(vec3([-0.8, -0.8, 0])),
  circle(0.008, 20).setCenter(vec3([0.8, -0.8, 0])),
  circle(0.008, 20).setCenter(vec3([-0.8, 0.8, 0])),
  circle(0.008, 20).setCenter(vec3([0.8, 0.8, 0])),
];
let lines: GLShape[] | undefined = undefined;

let selected: GLShape | undefined;
const DISTANCE = 0.2;

function cubic(t: number) {
  return cubicBezier(
    points[0].center.toVec2(),
    points[1].center.toVec2(),
    points[2].center.toVec2(),
    points[3].center.toVec2(),
    t
  );
}

function mix(t: number) {
  return points[0].center
    .toVec2()
    .multiply(t)
    .add(points[3].center.toVec2().multiply(1 - t));
}

function createCubicArray() {
  return Array.from({ length: 20 }, (_, i) => [
    circle(0.007, 5).setCenter(cubic(i / 20).toVec3()),
    line(cubic(i / 20), cubic((i + 1) / 20), 0.004),
  ]).flat();
}

function updateLines() {
  if (lines) lines.forEach((lineObj) => runner.removeShape(lineObj));
  lines = createCubicArray();
  runner.use(lines);
}

export default async function init() {
  await runner.init();
  runner.useShape(BOUNDING_BOX);
  runner.use(points);
  runner.setClearColor(NONEX.get());
  runner.onMouseMove((coords) => selected?.setCenter(coords.toVec3()));
  const canvasEl = runner.getCanvas().el;
  canvasEl.addEventListener("mousedown", () => {
    selected = points.find(
      (point) => point.center.toVec2().distanceTo(runner.mouse) < DISTANCE
    );
  });
  updateLines();
  canvasEl.addEventListener("mouseup", () => (selected = undefined));
  runner.onMouseMove(() => {
    if (selected) updateLines();
  });
  draw();
}

function draw(time = 0) {
  runner.clear();
  runner.draw(time);
  requestAnimationFrame(draw);
}
