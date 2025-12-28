import {
  BufferType,
  ClearBuffer,
  EnableFlags,
  FramebufferTarget,
  ShaderType,
  TextureTarget,
} from "./web-gl-enums";
import { GLProgram } from "./program";
import { GLBuffer, GLShader } from ".";
import { Vec4Array } from "../utils/vector";
import { GLFramebuffer } from "./framebuffer";
import { GLTexture } from "./texture/texture";
import { GLShape } from "../render";

const TEXTURE_UNIT_LIMIT = 31;

export class GL2Wrapper {
  private static instance: GL2Wrapper | null = null;

  public gl: WebGL2RenderingContext;

  private constructor(public canvas: HTMLCanvasElement) {
    if (GL2Wrapper.instance) {
      throw new Error("gl can only be instantiated once");
    }

    const context = canvas.getContext("webgl2");
    if (!context) throw new Error("could not get webgl2 context");
    this.gl = context;
  }

  static getInstance(canvas: HTMLCanvasElement) {
    if (GL2Wrapper.instance) return GL2Wrapper.instance;
    return new GL2Wrapper(canvas);
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
    if (!shader) throw new Error("couldn't create shader");
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
    return this;
  }

  createFramebuffer(bufferType: FramebufferTarget) {
    return new GLFramebuffer(this.gl, this.gl.createFramebuffer(), bufferType);
  }

  deleteFramebuffer(framebuffer: GLFramebuffer) {
    this.gl.deleteFramebuffer(framebuffer.getBuffer());
    return this;
  }

  createTexture(textureType: TextureTarget) {
    return new GLTexture(this.gl, this.gl.createTexture(), textureType);
  }

  deleteTexture(framebuffer: GLFramebuffer) {
    this.gl.deleteTexture(framebuffer.getBuffer());
    return this;
  }

  setActiveTexture(textureUnit: number) {
    if (textureUnit < 0 || textureUnit > TEXTURE_UNIT_LIMIT)
      throw new Error(
        `${textureUnit} is not a valid texture unit, if not, update the limits`
      );

    // @ts-expect-error this could potentially break in the future
    this.gl.activeTexture(this.gl[`TEXTURE${textureUnit}`]);
    return this;
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

  drawShape(
    shape: GLShape,
    type: GLenum = this.gl.UNSIGNED_SHORT,
    offset: GLintptr = 0
  ) {
    this.gl.drawElements(shape.drawType, shape.vertexCount, type, offset);
    return this;
  }

  //-----------------------
  // Context functions
  //-----------------------
  enable(flag: EnableFlags) {
    this.setFlag(flag, true);
    return this;
  }

  disable(flag: EnableFlags) {
    this.setFlag(flag, false);
    return this;
  }

  setFlag(flag: EnableFlags, val: boolean) {
    if (val) {
      this.gl.enable(flag);
      return this;
    }
    this.gl.disable(flag);
    return this;
  }
}
