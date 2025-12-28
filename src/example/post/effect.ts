import { rectangle } from "../../render";
import { GLRunner } from "../runner";
import { PostRoutine } from "./types";

const shape = rectangle(1, 1);

export async function initPost(runner: GLRunner) {
  const program = await runner.createProgram((builder) =>
    builder.fragmentUrl("/shader/post.frag")
  );
  program.useShape(shape);
  return { program };
}

export function drawPost(scene: PostRoutine) {
  scene.program.use().draw();
}
