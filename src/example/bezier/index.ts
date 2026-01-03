import { circle3D, line3D } from "../../render/shape3d";
import { Shape3D } from "../../render/types";
import { cubicBezier, Vec3 } from "../../utils";
import { vec3 } from "../../utils";
import { BOUNDING_BOX, NONEX } from "../common";
import { GLRunner } from "../runner";
import { GLRunnerProgram3D } from "../runner/types";

const pointWithCenter = (center: Vec3) => {
  const point = circle3D(0.004, 20);
  point.transform.setCenter(center);
  return point;
};
const runner = new GLRunner();
const points = [
  pointWithCenter(vec3([-0.8, -0.8, 0])),
  pointWithCenter(vec3([0.8, -0.8, 0])),
  pointWithCenter(vec3([-0.8, 0.8, 0])),
  pointWithCenter(vec3([0.8, 0.8, 0])),
];
let lines: Shape3D[] | undefined = undefined;

let selected: number = -1;
const DISTANCE = 0.2;
const SEGMENT_COUNT = 40;

function cubic(t: number) {
  return cubicBezier(
    points[0].transform.center.toVec2(),
    points[1].transform.center.toVec2(),
    points[2].transform.center.toVec2(),
    points[3].transform.center.toVec2(),
    t,
  );
}

const pointLines = [
  line3D(
    points[0].transform.center.toVec2(),
    points[1].transform.center.toVec2(),
    0.001,
  ),
  line3D(
    points[2].transform.center.toVec2(),
    points[3].transform.center.toVec2(),
    0.001,
  ),
];

function createCubicArray() {
  return Array.from({ length: SEGMENT_COUNT }, (_, i) => {
    return [
      pointWithCenter(cubic(i / SEGMENT_COUNT).toVec3()),
      line3D(cubic(i / SEGMENT_COUNT), cubic((i + 1) / SEGMENT_COUNT), 0.002),
    ];
  }).flat();
}

function updateLines(program: GLRunnerProgram3D) {
  if (lines) lines.forEach((lineObj) => program.removeShape(lineObj));
  lines = createCubicArray();
  program.useShapes(lines);
}

export default async function init() {
  const program = await runner.createRunnerProgram3D((builder) =>
    builder.useTime(),
  );
  program.use().useShape(BOUNDING_BOX).useShapes(points).useShapes(pointLines);
  runner.setClearColor(NONEX.get());
  runner.onMouseMove(({ clip }) => {
    if (selected === -1) return;
    points[selected].transform.setCenter(clip.toVec3());
    const selectedLine = pointLines[Math.floor(selected / 2)];
    if (selected % 2 === 1) {
      selectedLine.setEnd(clip);
    } else {
      selectedLine.setStart(clip);
    }
    selectedLine.updateBuffers();
    updateLines(program);
  });
  const canvasEl = runner.getCanvas().el;
  canvasEl.addEventListener("mousedown", () => {
    selected = points.findIndex(
      (point) =>
        point.transform.center.toVec2().distanceTo(runner.mouse.clip) <
        DISTANCE,
    );
  });
  updateLines(program);
  canvasEl.addEventListener("mouseup", () => (selected = -1));
  runner.onMouseMove(() => {
    if (selected) updateLines(program);
  });
  draw(program);
}

function draw(program: GLRunnerProgram3D, time = 0) {
  runner.clear();
  program.draw(time);
  requestAnimationFrame((time) => draw(program, time));
}
