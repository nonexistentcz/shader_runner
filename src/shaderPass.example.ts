import { ShaderType } from "./enums";
import { uniform3f } from "./uniform";

function texturePass(fn: any) {}
function drawPass(fn: any) {}

// texturePass, drawPass
const texture = texturePass((pass: any) => {
  return pass
    .fragShader("main.frag")
    .fragShader("main.vert")
    .uniform(uniform3f("u_Color", [1, 1, 1]));
});

const uColor = uniform3f("u_Color", [1, 1, 1]);

const main = drawPass((pass: any) => {
  return pass
    .fragShader("main.frag")
    .vertShader("main.vert")
    .texture(texture, false)
    .uniform(uColor)
    .mvp([]);
});

// pass:uniform(uniform: (gl: WebGL2RenderingContext, name) => )
