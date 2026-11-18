import { TextureTarget, uniform1f, uniform1i } from "../../gl";
import { GLTexture } from "../../gl/texture";
import { TexImage2DTarget } from "../../gl/texture/types";
import { rectangle2D } from "../../render/shape2d";
import { Vec2 } from "../../utils";
import { GLRunner } from "../runner";
import { createNoiseSeed } from "./seed";

const NOISE_AMPLITUDE = 0.25;

const uTexture = uniform1i("u_Texture", 0);
const uNoiseAmplitude = uniform1f("u_NoiseAmplitude", NOISE_AMPLITUDE);
const seed = createNoiseSeed();
const shape = rectangle2D(1, 1);

export type PostRoutine = Awaited<ReturnType<typeof initPost>>;

/** Full-screen grain pass, the scene is rendered into `framebuffer` first */
export async function initPost(runner: GLRunner) {
  runner.setActiveTexture(uTexture.value);
  const program = await runner.createRunnerProgram2D((builder) =>
    builder
      .fragmentUrl("/shader/grain_post.frag")
      .uniform(uTexture)
      .uniform(uNoiseAmplitude)
      .uniform(seed.uniform)
      .useBeforeDraw(seed.tick),
  );
  runner.onResize((resolution) => {
    shape.setSize(resolution).updateBuffers();
    shape.transform.setCenter(resolution.divide(2));
  }, true);
  program.useShape(shape);

  const texture = runner
    .createTexture(TextureTarget.Texture2D)
    .bind()
    .texParamenteri(
      WebGL2RenderingContext.TEXTURE_MIN_FILTER,
      WebGL2RenderingContext.NEAREST,
    );
  allocateTexture(texture, runner.resolution);
  texture.unbind();
  const framebuffer = runner
    .prepareFramebuffer()
    .bind()
    .texture2D(texture, 0, 0)
    .unbind();

  // the texture storage has a fixed size, reallocate it to match the canvas
  runner.onResize((resolution) => {
    texture.bind();
    allocateTexture(texture, resolution);
    texture.unbind();
  });
  return { program, texture, framebuffer };
}

function allocateTexture(texture: GLTexture, resolution: Vec2) {
  texture.texImage2D(TexImage2DTarget.Tex2D, 0, (builder) =>
    builder.useSourceData({ dimensions: resolution, source: null }),
  );
}

export function drawPost(post: PostRoutine, runner: GLRunner, time: number) {
  runner.clear();
  runner.setActiveTexture(uTexture.value);
  post.texture.bind();
  post.program.use().draw(time);
  post.texture.unbind();
}
