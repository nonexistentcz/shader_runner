import { TextureTarget, uniform1i } from "../../gl";
import {
  MinFilter,
  TexImage2DTarget,
  TextureInternalFormat,
  TextureIntSizes,
} from "../../gl/texture/types";
import { rectangle3D } from "../../render/shape3d";
import { NONEX } from "../common";
import { GLRunner } from "../runner";
import { GLRunnerProgram3D } from "../runner/types";

const runner = new GLRunner().setClearColor(NONEX.get());

export default async function initTexture() {
  const uTexture = uniform1i("u_Texture", 0);
  const program = await runner.createRunnerProgram3D((builder) =>
    builder.fragmentUrl("/shader/post_effect.frag").uniform(uTexture)
  );
  program.use().useShape(rectangle3D(1, 1));
  await runner
    .setActiveTexture(uTexture.value)
    .createTexture(TextureTarget.Texture2D)
    .bind()
    .minFilter(MinFilter.Linear)
    .fetchTexImg2D("/img/boat.png", TexImage2DTarget.Tex2D, 0, (builder) =>
      builder.setTextureDetails(
        TextureInternalFormat.RGB,
        TextureIntSizes.UnsignedByte
      )
    );

  requestAnimationFrame(() => animate(program));
}

function animate(program: GLRunnerProgram3D) {
  runner.clear();
  program.draw();
  requestAnimationFrame(() => animate(program));
}
