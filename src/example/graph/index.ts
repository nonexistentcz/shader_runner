import { Runner } from "../runner";
import { line } from "../../shapes";
import { map } from "../../utils/ease";
import { vec2, vec4 } from "../../utils/vector";
import { randomMapped } from "../shapes/shape";

const NONEX = vec4([0.66, 0.12, 0.28, 1]);

type Line = ReturnType<typeof line>;

const runner = new Runner();
let gShapes: Line[] | undefined;
let arrCurr: number[] | undefined;
let arrNext: number[] | undefined;
let x = 0;
let timeLast = 0;

function getRandomArray(length: number) {
  return Array.from({ length }, () => randomMapped(-1, 1));
}

function getShapesFromArray(arr: number[]) {
  const length = arr.length;
  const lineWidth = 1 / length;
  return arr.map((height, index) => {
    const offset = (index / (length - 1)) * 2 - 1;
    return line(vec2([offset, -1]), vec2([offset, height]), lineWidth);
  });
}

function useGraph(shapes: Line[]) {
  if (gShapes) gShapes.forEach((shape) => runner.removeShape(shape));
  gShapes = shapes;
  shapes.forEach((shape) => runner.useShape(shape));
}

function updateGraph() {
  if (!gShapes) return;
  gShapes.forEach((item, i) => {
    item.x2.y = map(arrCurr![i], arrNext![i], x * x * (3 - 2 * x));
    item.updateBuffers();
  });
}

function createGraph() {
  const length = randomMapped(1, 40);
  arrCurr = getRandomArray(length);
  arrNext = getRandomArray(length);
}

function initGraph() {
  createGraph();
  const shapes = getShapesFromArray(arrCurr!);
  useGraph(shapes);
}

export default async function init() {
  const canvas = runner.getCanvas();
  await runner.init({ fragmentShaderUrl: "/shader/graph.frag" });
  canvas.el.addEventListener("click", initGraph);
  runner.setClearColor(NONEX.get());
  initGraph();
  animate();
}

function animate(time = 0) {
  x += (time - timeLast) / 1000;
  timeLast = time;
  if (x > 1) {
    x -= 1;
    arrCurr = arrNext!;
    arrNext = getRandomArray(arrCurr.length);
  }
  runner.clear();
  updateGraph();
  runner.draw(time);
  requestAnimationFrame(animate);
}
