import { BufferType, ClearBuffer, EnableFlags, ShaderType } from "./enums";
import { GLProgram } from "./program";
import { GLShader } from "./shader";
import { GLBuffer } from "./buffer";
import { Vec4Array } from "./utils/vector";

export class GL2 {
  public gl: WebGL2RenderingContext;

  constructor(public canvas: HTMLCanvasElement) {
    const context = canvas.getContext("webgl2");
    if (!context) throw new Error("could not get webgl2 context");
    this.gl = context;
  }

  createProgram() {
    return new GLProgram(this.gl, this.gl.createProgram());
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
    return new GLShader(this.gl, shader);
  }

  createBuffer(bufferType: BufferType) {
    return new GLBuffer(this.gl, this.gl.createBuffer(), bufferType);
  }

  withBufferBind<T>(fn: () => T, ...buffers: GLBuffer[]) {
    buffers.forEach((buffer) => buffer.bind());
    fn();
    buffers.forEach((buffer) => buffer.unbind());
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
