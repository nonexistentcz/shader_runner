import { getCanvas, GLCanvas } from "./canvas";
import { GL2 } from "./gl";
import { vec4 } from "./utils/vector";
import { BufferType, ShaderType } from "./enums";
import { GLBuffer } from "./buffer";
import { GLProgram } from "./program";
import { GLShader } from "./shader";

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

export class Runner {
  private gl: GL2;
  private canvas: GLCanvas;
  private program: GLProgram;
  private shaders = new Map<string, GLShader>();
  private buffers: Buffers;

  constructor() {
    this.canvas = getCanvas();
    this.gl = this.canvas.getGl();
    this.program = this.gl.createProgram();
    this.buffers = this.initBuffers();
  }

  getCanvas() {
    return this.canvas;
  }

  bindShader(shader: GLShader) {
    this.program.attachShader(shader);
  }

  async loadShader(name: string, shaderType: ShaderType) {
    const storedShader = this.shaders.get(name);
    if (storedShader) this.program.attachNewShader(storedShader);
    const shader = await this.gl.createShader(shaderType).fetchSource(name);
    this.shaders.set(name, shader);
    this.program.attachNewShader(shader.compile());
  }

  prepareProgram() {
    this.gl.useProgram(this.program.link().validate());
    this.withBind(() =>
      this.program
        .getAttribLocation("a_position")
        .enable()
        .setPointer(3, WebGL2RenderingContext.FLOAT, false, 0, 0)
    );
  }

  initBuffers(): Buffers {
    const vert = this.gl
      .createBuffer(BufferType.Vertex)
      .setDataWithBind(VERTEX_BUFFER_TEMP);
    const frag = this.gl
      .createBuffer(BufferType.Index)
      .setDataWithBind(INDEX_BUFFER_TEMP);
    return {
      vert,
      frag,
    };
  }

  withBind<T>(fn: () => T) {
    this.gl.withBufferBind(fn, this.buffers.frag, this.buffers.vert);
    return this;
  }

  async init() {
    await this.loadShader("/shader/main.frag", ShaderType.Fragment);
    await this.loadShader("/shader/main.vert", ShaderType.Vertex);
    this.prepareProgram();
    this.canvas.adjustSizeAndViewport();
    this.gl.viewportFromCanvas();
  }

  clear(time: number) {
    this.gl.setClearColor(getClearColor(time));
    this.gl.clear();
  }

  draw() {
    this.withBind(() => {
      this.gl.gl.drawElements(
        this.gl.gl.TRIANGLE_FAN,
        INDEX_BUFFER_TEMP.length,
        this.gl.gl.UNSIGNED_SHORT,
        0
      );
    });
  }
}
