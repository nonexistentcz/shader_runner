import { getCanvas } from "./canvas";
import { GL2 } from "./gl";
import { vec4 } from "./utils/vector";
import fragShader from "./shader/main.frag";
import vertShader from "./shader/main.vert";
import { BufferType, EnableFlags, ShaderType } from "./enums";
import { GLProgram } from "./program";
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
  x + width,
  y,
  x + width,
  y + height,
  x,
  y + height,
]);

const INDEX_BUFFER_TEMP = new Uint16Array([0, 1, 2, 3]);

function run() {
  const { gl, buffers } = init();
  requestAnimationFrame(main(buffers, gl));
}

function init() {
  const canvas = getCanvas().onResize((canvas) => {
    gl.viewport(0, 0, canvas.el.offsetWidth, canvas.el.offsetHeight);
  });
  const gl = canvas.getGl();
  var buffers = initBuffers(gl);
  const program = initProgram(gl);
  bindCoordinates(program, (fn) =>
    gl.withBufferBind(fn, buffers.frag, buffers.vert)
  );
  gl.enable(EnableFlags.DepthTest);
  gl.setClearColor(getClearColor(0));
  gl.viewport(0, 0, canvas.el.offsetWidth, canvas.el.offsetHeight);
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

function bindCoordinates(
  program: GLProgram,
  withBind: (fn: () => void) => void
) {
  withBind(() => {
    program
      .getAttribLocation("a_position")
      .enable()
      .setPointer(2, WebGL2RenderingContext.FLOAT, false, 0, 0);
  });
}

function main(buffers: Buffers, gl: GL2) {
  return (time: number) => {
    const { frag, vert } = buffers;
    gl.withBufferBind(
      () => {
        gl.setClearColor(getClearColor(time)).clear();
        gl.gl.drawElements(gl.gl.TRIANGLE_STRIP, 4, gl.gl.UNSIGNED_SHORT, 0);
        requestAnimationFrame(main(buffers, gl));
      },
      frag,
      vert
    );
  };
}

run();
