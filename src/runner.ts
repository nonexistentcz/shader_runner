import { getCanvas, GLCanvas } from "./canvas";
import { GL2 } from "./gl";
import { vec4, Vec4Array } from "./utils/vector";
import { BufferType, ShaderType } from "./enums";
import { GLBuffer } from "./buffer";
import { GLProgram } from "./program";
import { GLShader } from "./shader";
import { GLUniformValue } from "./uniform";

type Buffers = {
  frag: GLBuffer;
  vert: GLBuffer;
};

const x = -1;
const y = -1;
const height = 2;
const width = 2;

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

  constructor(canvasId?: string) {
    this.canvas = getCanvas(canvasId);
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

  bindUniform<T>(uniform: GLUniformValue<T>) {
    return this.program.useUniform(uniform);
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

  setClearColor(color: Vec4Array) {
    this.gl.setClearColor(color);
    return this;
  }

  clear() {
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
