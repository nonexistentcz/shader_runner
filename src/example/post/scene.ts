import convert from "color-convert";
import { TextureTarget, uniform3fv } from "../../gl";
import { TexImage2DTarget } from "../../gl/texture/types";
import { Vec3Array } from "../../utils";
import { randomMapped } from "../shapes/shape";
import { SceneRoutine } from "./types";
import { GLRunner } from "../runner";
import { GLRunnerShape2D } from "../runner/types";
import { rectangle2D } from "../../render/shape2d";

const uColor = uniform3fv(
  "u_Color",
  convert.lch
    .rgb(70, 30, randomMapped(180, 360))
    .map((val) => val / 255) as Vec3Array,
);
const shape = rectangle2D(0.5, 0.5, 0.2);

export async function initScene(runner: GLRunner) {
  const program = await runner.createRunnerProgram2D((builder) =>
    builder
      .useCustomShape(
        (shape: GLRunnerShape2D<{ color: Vec3Array }>) => shape.shape,
      )
      .fragmentUrl("/shader/color.frag")
      .uniform(uColor)
      .useBeforeShapeDraw((shape) => uColor.update(shape.color))
      .useTime(),
  );
  runner.onResize((resolution) => {
    shape.setSize(resolution);
    shape.transform.center = resolution.divide(2);
  }, true);

  program.useShape({ shape, color: uColor.value });
  const texture = runner
    .createTexture(TextureTarget.Texture2D)
    .bind()
    .texParamenteri(
      WebGL2RenderingContext.TEXTURE_MIN_FILTER,
      WebGL2RenderingContext.NEAREST,
    )
    .texImage2D(TexImage2DTarget.Tex2D, 0, (builder) =>
      builder.useSourceData({
        dimensions: runner.resolution,
        source: null,
      }),
    );
  const framebuffer = runner
    .prepareFramebuffer()
    .bind()
    .texture2D(texture, 0, 0)
    .unbind();
  return { program, texture, framebuffer };
}

export function drawScene(time: number, runner: GLRunner, scene: SceneRoutine) {
  scene.program.use();
  scene.framebuffer.withBind(() => {
    shape.transform.angle = time / 500;
    scene.texture.bind();
    runner.clear();
    scene.program.draw(time);
    scene.texture.unbind();
  });
}
