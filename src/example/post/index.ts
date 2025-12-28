import { NONEX } from "../common";
import { GLRunner } from "../runner";
import { drawPost, initPost } from "./effect";
import { drawScene, initScene } from "./scene";
import { RunnerRoutines } from "./types";

export const runner = new GLRunner().setClearColor(NONEX.get());

export default async function init() {
  const scene = await initScene(runner);
  const post = await initPost(runner);
  animate({ scene, post });
}

function animate(routines: RunnerRoutines, time = 0) {
  runner.clear();
  drawScene(time, runner, routines.scene);
  drawPost(routines.post);

  requestAnimationFrame((time) => animate(routines, time));
}
