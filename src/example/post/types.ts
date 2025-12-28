import { initPost } from "./effect";
import { initScene } from "./scene";

export type SceneRoutine = Awaited<ReturnType<typeof initScene>>;
export type PostRoutine = Awaited<ReturnType<typeof initPost>>;

export type RunnerRoutines = {
  scene: SceneRoutine;
  post: PostRoutine;
};
