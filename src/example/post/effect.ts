import { uniform1i } from "../../gl";
import { GLTexture } from "../../gl/texture";
import { rectangle2D } from "../../render/shape2d";
import { GLRunner } from "../runner";
import { PostRoutine } from "./types";

const uTexture = uniform1i("u_Texture", 0);
const shape = rectangle2D(4, 4);

export async function initPost(runner: GLRunner) {
  runner.setActiveTexture(uTexture.value);
  const program = await runner.createRunnerProgram2D((builder) =>
    builder.fragmentUrl("/shader/post_effect.frag").uniform(uTexture),
  );
  runner.onResize((resolution) => {
    shape.setSize(resolution);
    shape.transform.center = resolution.divide(2);
  }, true);
  program.useShape(shape);
  return { program };
}

export function drawPost(
  scene: PostRoutine,
  runner: GLRunner,
  texture: GLTexture,
) {
  runner.clear();
  runner.setActiveTexture(uTexture.value);
  texture.bind();
  scene.program.use().draw();
  texture.unbind();
}
