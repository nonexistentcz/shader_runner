import { GLCanvas } from "./canvas";
import { initBalls } from "./example/shapes/entry";
import { Runner } from "./runner";
import { rectangle, ring } from "./shapes";
import { uniform1f, uniform2fv } from "./uniform";
import { vec3, vec4 } from "./utils/vector";

const runner = new Runner();
const uMouse = uniform2fv("u_Mouse", [0, 0]);
const uResolution = uniform2fv("u_Resolution", [0, 0]);
const uTime = uniform1f("u_Time", 0);
const NONEX = vec4([0.66, 0.12, 0.28, 1]);
const ringObj = ring(0.5, 0.4, 200).setCenter(vec3([-1, -1, 0]));
const rectObj = rectangle(0.5, 0.5).setCenter(vec3([-1, -1, -1]));

function adjustCanvas(canvas: GLCanvas) {
  canvas.adjustSizeAndViewport();
  uResolution.update([canvas.el.width, canvas.el.height]);
}

async function init() {
  const canvas = runner.getCanvas();
  await runner.init();
  runner.useUniform(uMouse);
  runner.useUniform(uResolution);
  runner.useUniform(uTime);
  runner.useShape(ringObj);
  runner.useShape(rectObj);
  adjustCanvas(canvas);
  runner.setClearColor(NONEX.get());
  runner.getCanvas().onResize((_, canvas) => adjustCanvas(canvas), false);
  canvas.el.tabIndex = 1;
  canvas.el.addEventListener("mousemove", async (ev) => {
    const [width, height] = uResolution.value;
    ringObj.setCenter(
      vec3([-1 + (ev.x / width) * 2, 1 - (ev.y / height) * 2, 0])
    );
    uMouse.update([ev.x, ev.y]);
  });
  animate();
}

function draw() {
  runner.clear();
  runner.draw();
}

function animate(time = 0) {
  draw();
  uTime.update(time);
  ringObj.theta = (Math.sin(time / 1000) + 1) * Math.PI;
  ringObj.updateBuffers();
  requestAnimationFrame(animate);
}

// init();
initBalls();
