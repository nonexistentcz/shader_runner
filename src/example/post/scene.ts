import convert from "color-convert";
import { TextureTarget, uniform3fv } from "../../gl";
import { TexImage2DTarget } from "../../gl/texture/types";
import { rectangle } from "../../render";
import { Vec3Array } from "../../utils";
import { randomMapped } from "../shapes/shape";
import { SceneRoutine } from "./types";
import { GLRunner } from "../runner";
import { GLRunnerShape } from "../runner/types";

const uColor = uniform3fv(
  "u_Color",
  convert.lch
    .rgb(70, 30, randomMapped(180, 360))
    .map((val) => val / 255) as Vec3Array
);
const shape = rectangle(0.5, 0.5, 0.2);

export async function initScene(runner: GLRunner) {
  const program = await runner.createRunnerProgram((builder) =>
    builder
      .useCustomShape(
        (shape: GLRunnerShape<{ color: Vec3Array }>) => shape.shape
      )
      .fragmentUrl("/shader/color.frag")
      .uniform(uColor)
      .useBeforeShapeDraw((shape) => uColor.update(shape.color))
  );
  program.useShape({ shape, color: uColor.value });
  const texture = runner
    .createTexture(TextureTarget.Texture2D)
    .bind()
    .texImage2D(TexImage2DTarget.Tex2D, 0, (builder) =>
      builder.useSourceData({
        dimensions: runner.resolution,
        source: null,
      })
    );
  const framebuffer = runner
    .prepareFramebuffer()
    .bind()
    .texture2D(texture, 0, 0);
  return { program, texture, framebuffer };
}

export function drawScene(time: number, runner: GLRunner, scene: SceneRoutine) {
  scene.program.use();
  scene.framebuffer.bind();
  shape.rotation.rotateZ(time / 1000);
  runner.clear();
  scene.program.draw();
  scene.framebuffer.unbind();
}
