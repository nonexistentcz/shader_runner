import { BufferType, ClearBuffer, EnableFlags, ShaderType } from "./enums";
import { GLProgram } from "./program";
import { GLShader } from "./shader";
import { GLBuffer } from "./buffer";
import { Vec4Array } from "./utils/vector";

export class GL2 {
  private static instance: GL2 | null = null;

  public gl: WebGL2RenderingContext;

  private constructor(public canvas: HTMLCanvasElement) {
    if (GL2.instance) {
      throw new Error("gl can only be instantiated once");
    }

    const context = canvas.getContext("webgl2");
    if (!context) throw new Error("could not get webgl2 context");
    this.gl = context;
  }

  static getInstance(canvas: HTMLCanvasElement) {
    if (GL2.instance) return GL2.instance;
    return new GL2(canvas);
  }

  createProgram() {
    return new GLProgram(this.gl, this.gl.createProgram());
  }

  useProgram(program: GLProgram | WebGLProgram) {
    this.gl.useProgram(
      program instanceof GLProgram ? program.getProgram() : program
    );
    return this;
  }

  viewport(x: number, y: number, width: number, height: number) {
    this.gl.viewport(x, y, width, height);
    return this;
  }

  viewportFromCanvas() {
    const { canvas } = this;
    this.gl.viewport(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    return this;
  }

  createShader(shaderType: ShaderType) {
    const shader = this.gl.createShader(shaderType);
    if (!shader) throw "couldn't create shader";
    return new GLShader(this.gl, shader, shaderType);
  }

  createBuffer(bufferType: BufferType) {
    return new GLBuffer(this.gl, this.gl.createBuffer(), bufferType);
  }

  deleteBuffer(buffer: GLBuffer) {
    this.gl.deleteBuffer(buffer.getBuffer());
    return this;
  }

  withBufferBind<T>(fn: () => T, ...buffers: Array<GLBuffer | undefined>) {
    buffers.forEach((buffer) => buffer?.bind());
    fn();
    buffers.forEach((buffer) => buffer?.unbind());
  }

  setClearColor([r, g, b, a]: Vec4Array) {
    this.gl.clearColor(r, g, b, a);
    return this;
  }

  public clear(buffer: ClearBuffer | number = ClearBuffer.Color) {
    this.gl.clear(buffer);
    return this;
  }

  getError() {
    return this.gl.getError();
  }

  //-----------------------
  // Context functions
  //-----------------------
  enable(flag: EnableFlags) {
    this.setFlag(flag, true);
  }

  disable(flag: EnableFlags) {
    this.setFlag(flag, false);
  }

  setFlag(flag: EnableFlags, val: boolean) {
    if (val) {
      this.gl.enable(flag);
      return;
    }
    this.gl.disable(flag);
  }
}
