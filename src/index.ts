import { GLCanvas } from "./canvas";
import { Runner } from "./runner";
import { uniform2fv } from "./uniform";
import { vec4 } from "./utils/vector";

const runner = new Runner();
const uMouse = uniform2fv("u_Mouse", [0, 0]);
const uResolution = uniform2fv("u_Resolution", [0, 0]);
const NONEX = vec4([0.66, 0.12, 0.28, 1]);

function adjustCanvas(canvas: GLCanvas) {
  canvas.adjustSizeAndViewport();
  uResolution.update([canvas.el.width, canvas.el.height]);
}

async function main() {
  const canvas = runner.getCanvas();
  await runner.init();
  runner.bindUniform(uMouse);
  runner.bindUniform(uResolution);
  adjustCanvas(canvas);
  runner.setClearColor(NONEX.get());
  runner.getCanvas().onResize((_, canvas) => adjustCanvas(canvas), true);
  canvas.el.tabIndex = 1;
  canvas.el.addEventListener("mousemove", async (ev) => {
    uMouse.update([ev.x, ev.y]);
  });
  animate();
}

function draw() {
  runner.clear();
  runner.draw();
}

function animate() {
  draw();
  requestAnimationFrame(animate);
}

main();
