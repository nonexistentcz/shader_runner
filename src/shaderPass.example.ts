import { getCanvas } from "./gl";
import { GLShaderSource } from "./transformer/shaderSource";
import { uniform3f } from "./gl";
import { unitMatrix } from "./utils/matrix/utils";

function empty(_fn: any, _options?: any) {}
const texturePass = empty;
const drawPass = empty;
const effectPass = empty;
const effectChannel = empty;

const canvas = getCanvas();

const texture = texturePass((pass: any) =>
  pass
    .fragShader("main.frag")
    .fragShader("main.vert")
    .uniform(uniform3f("u_Color", [1, 1, 1]))
);

const uColor = uniform3f("u_Color", [1, 1, 1]);

const main = drawPass((pass: any) =>
  pass
    .fragShader("main.frag")
    .vertShader("main.vert")
    .texture2D("texMyTexture", texture, false)
    .uniform(uColor)
    .mvp(unitMatrix(4, 4))
);

const blur = effectPass("effects.frag", {
  entryPoint: "gaussianBlur",
  transform: (shader: GLShaderSource) => shader.use((v) => v),
});

const channel = effectChannel([main, blur]);

canvas.draw(channel);

// pass:uniform(uniform: (gl: WebGL2RenderingContext, name) => )
