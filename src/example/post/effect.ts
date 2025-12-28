import { uniform1i } from "../../gl";
import { GLTexture } from "../../gl/texture";
import { rectangle } from "../../render";
import { GLRunner } from "../runner";
import { PostRoutine } from "./types";

const shape = rectangle(4, 4);
const uTexture = uniform1i("u_Texture", 0);

export async function initPost(runner: GLRunner) {
  runner.setActiveTexture(uTexture.value);
  const program = await runner.createRunnerProgram((builder) =>
    builder.fragmentUrl("/shader/post_effect.frag").uniform(uTexture)
  );
  program.useShape(shape);
  return { program };
}

export function drawPost(
  scene: PostRoutine,
  runner: GLRunner,
  texture: GLTexture
) {
  runner.clear();
  runner.setActiveTexture(uTexture.value);
  texture.bind();
  scene.program.use().draw();
  texture.unbind();
}
