import { uniform1f, uniform2fv, uniform3fv, uniform4fv } from "../../gl";
import { GLRunner } from "../runner";
import { drawPost, initPost } from "./post";
import { createNoiseSeed } from "./seed";
import { createPosterShapes, PosterShape } from "./shapes";

const runner = new GLRunner();
const uColor = uniform4fv("u_Color", [0, 0, 0, 0]);
const uForeground = uniform3fv("u_Foreground", [0, 0, 0]);
const uGradient = uniform1f("u_Gradient", 0);
const uShapeCenter = uniform2fv("u_ShapeCenter", [0, 0]);
const uShapeRadius = uniform1f("u_ShapeRadius", 1);
const seed = createNoiseSeed();

export default async function init() {
  const program = await runner.createRunnerProgram2D((program) =>
    program
      .useCustomShape((shape: PosterShape) => shape.shape)
      .fragmentUrl("/shader/dither.frag")
      .uniform(uColor)
      .uniform(uForeground)
      .uniform(uGradient)
      .uniform(uShapeCenter)
      .uniform(uShapeRadius)
      .uniform(seed.uniform)
      .useBeforeDraw(seed.tick)
      .useBeforeShapeDraw(({ shape, color, foreground }) => {
        uColor.update(color ? [...color, 1] : [0, 0, 0, 0]);
        uForeground.update(foreground ?? [0, 0, 0]);
        uGradient.update(foreground ? 1 : 0);
        uShapeCenter.update(shape.transform.center.get());
        uShapeRadius.update(shape.boundingRadius);
      }),
  );
  program.use();

  const { shapes, resize } = createPosterShapes(runner.resolution);
  program.useShapes(shapes);

  runner.onResize(resize);
  runner.setClearColor([0, 0, 0, 0]).enableAlphaBlending();
  const post = await initPost(runner);
  draw();

  function draw(time = 0) {
    program.use();
    post.framebuffer.withBind(() => {
      runner.clear();
      program.draw(time);
    });
    drawPost(post, runner, time);
    requestAnimationFrame(draw);
  }
}
