import { getCanvas } from "./canvas";
import { GL2 } from "./gl";
import { vec4 } from "./utils/vector";
import fragShader from "./shader/main.frag";
import vertShader from "./shader/main.vert";
import { BufferType, EnableFlags, ShaderType } from "./enums";
import { GLBuffer } from "./buffer";

type Buffers = {
  frag: GLBuffer;
  vert: GLBuffer;
};

const x = -0.5;
const y = -0.5;
const height = 1;
const width = 1;

const NONEX = vec4([0.66, 0.12, 0.28, 1]);
function getClearColor(frame: number) {
  return NONEX.map((col) => col * (Math.sin(frame / 400) / 2 + 0.5)).get();
}

const VERTEX_BUFFER_TEMP = new Float32Array([
  x,
  y,
  0,
  x + width,
  y,
  0,
  x + width,
  y + height,
  0,
  x,
  y + height,
  0,
]);

const INDEX_BUFFER_TEMP = new Uint16Array([0, 1, 2, 3]);

function run() {
  const { gl, buffers } = init();
  requestAnimationFrame(main(buffers, gl));
}

function init() {
  const canvas = getCanvas().onResize(() => {
    canvas.adjustSizeAndViewport();
    gl.viewportFromCanvas();
  });
  const gl = canvas.getGl();
  const program = initProgram(gl);
  const buffers = initBuffers(gl);
  gl.withBufferBind(
    () =>
      program
        .getAttribLocation("a_position")
        .enable()
        .setPointer(3, WebGL2RenderingContext.FLOAT, false, 0, 0),
    buffers.frag,
    buffers.vert
  );
  gl.enable(EnableFlags.DepthTest);
  gl.viewportFromCanvas();
  return { buffers, gl };
}

function initBuffers(gl: GL2): Buffers {
  const vert = gl
    .createBuffer(BufferType.Vertex)
    .setDataWithBind(VERTEX_BUFFER_TEMP);
  const frag = gl
    .createBuffer(BufferType.Index)
    .setDataWithBind(INDEX_BUFFER_TEMP);
  return {
    vert,
    frag,
  };
}

function initProgram(gl: GL2) {
  return gl
    .createProgram()
    .attachShader(
      gl.createShader(ShaderType.Fragment).setSource(fragShader).compile()
    )
    .attachShader(
      gl.createShader(ShaderType.Vertex).setSource(vertShader).compile()
    )
    .link()
    .validate()
    .use();
}

function main(buffers: Buffers, gl: GL2) {
  return (time: number) => {
    const { frag, vert } = buffers;
    gl.withBufferBind(
      () => {
        gl.setClearColor(getClearColor(time)).clear();
        gl.gl.drawElements(
          gl.gl.TRIANGLE_FAN,
          INDEX_BUFFER_TEMP.length,
          gl.gl.UNSIGNED_SHORT,
          0
        );
        requestAnimationFrame(main(buffers, gl));
      },
      frag,
      vert
    );
  };
}

run();
