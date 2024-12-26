import { getCanvas } from "./canvas";
import { ClearBuffer } from "./enums";
import { vec4 } from "./utils/vector";

const NONEX = vec4([0.66, 0.12, 0.28, 1]);
let frame = 0;
function getClearColor(frame: number) {
  return NONEX.map((col) => col * (Math.sin(frame / 400) / 2 + 0.5));
}

function init() {
  const canvas = getCanvas();
  const gl = canvas.getGl();
  gl.setClearColor([0.66, 0.12, 0.28, 1]).clear(ClearBuffer.Color);

  requestAnimationFrame(main);
}

function main() {
  getCanvas().getGl().setClearColor(getClearColor(frame++).get()).clear();
  requestAnimationFrame(main);
}

init();
