import { getCanvas } from "./canvas";
import { GLShaderSource } from "./shaderSource";
import { uniform3f } from "./uniform";

function texturePass(fn: any, options?: any) {}
function drawPass(fn: any, options?: any) {}
function effectPass(fn: any, options?: any) {}
function effectChannel(fn: any): any {}

const canvas = getCanvas();

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
    .texture2D("texMyTexture", texture, false)
    .uniform(uColor)
    .mvp([]);
});

const blur = effectPass("effects.frag", {
  entry: "gaussianBlur",
  transform: (shader: GLShaderSource) => shader.use((v) => v),
});

const channel = effectChannel([main, blur]);

canvas.draw(channel);

// pass:uniform(uniform: (gl: WebGL2RenderingContext, name) => )
