import { getCanvas, GLCanvas } from "../canvas";
import { GL2 } from "../gl";
import { Vec2, Vec4Array } from "../utils/vector";
import { BufferType, ShaderType } from "../enums";
import { GLProgram } from "../program";
import { GLShader } from "../shader";
import { GLUniformValue, uniform1f, uniform2fv, uniform3fv } from "../uniform";
import { GLShape } from "../shapes";

export function toCoords(vec: Vec2) {
  return new Vec2([vec.x * 2 - 1, vec.y * 2 - 1]);
}

type UIEventHandler = (coords: Vec2, e: UIEvent) => unknown;

export class Runner {
  private gl: GL2;
  private canvas: GLCanvas;
  private program: GLProgram;
  private shaders = new Map<string, GLShader>();
  private shapes: GLShape[] = [];
  // TODO: implement with matrices
  private uShapePos = uniform3fv("u_ShapePos", [0, 0, 0]);
  private uResolution = uniform2fv("u_Resolution", [0, 0]);
  private uMouse = uniform2fv("u_Mouse", [0, 0]);
  private uTime = uniform1f("u_Time", 0);
  private mouseMoveHandlers: Array<UIEventHandler> = [];

  constructor(canvasId?: string) {
    this.canvas = getCanvas(canvasId);
    this.gl = this.canvas.getGl();
    this.program = this.gl.createProgram();
  }

  get resolution() {
    return new Vec2(this.uResolution.value);
  }

  get mouse() {
    return new Vec2(this.uMouse.value);
  }

  getCanvas() {
    return this.canvas;
  }

  use(values: Array<GLShader | GLUniformValue<any> | GLShape>) {
    values.forEach((value) => {
      if (value instanceof GLShader) this.useShader(value);
      else if (value instanceof GLUniformValue) this.useUniform(value);
      else if (value instanceof GLShape) this.useShape(value);
    });
  }

  useShader(shader: GLShader) {
    this.program.attachShader(shader);
  }

  useUniform<T>(uniform: GLUniformValue<T>) {
    return this.program.useUniform(uniform);
  }

  useShape(shape: GLShape) {
    shape.bind({
      vertex: this.gl.createBuffer(BufferType.Vertex),
      index: this.gl.createBuffer(BufferType.Index),
    });

    this.shapes.push(shape);
    return this;
  }

  removeShape(shape: GLShape) {
    if (shape.vertexBuffer) this.gl.deleteBuffer(shape.vertexBuffer);
    if (shape.indexBuffer) this.gl.deleteBuffer(shape.indexBuffer);
    const index = this.shapes.indexOf(shape);
    if (index >= 0) this.shapes.splice(index, 1);
    return this;
  }

  onMouseMove(fn: UIEventHandler) {
    this.mouseMoveHandlers.push(fn);
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
  }

  adjustSizeAndViewport() {
    this.getCanvas();
    this.canvas.adjustSizeAndViewport();
    this.uResolution.update([this.canvas.el.width, this.canvas.el.height]);
  }

  async init({
    fragmentShaderUrl = "/shader/main.frag",
    vertexShaderUrl = "/shader/main.vert",
  }: {
    fragmentShaderUrl?: string;
    vertexShaderUrl?: string;
  } = {}) {
    await this.loadShader(fragmentShaderUrl, ShaderType.Fragment);
    await this.loadShader(vertexShaderUrl, ShaderType.Vertex);
    this.prepareProgram();
    this.use([this.uShapePos, this.uMouse, this.uResolution, this.uTime]);
    this.adjustSizeAndViewport();
    this.canvas.onResize(() => this.adjustSizeAndViewport());
    this.canvas.el.addEventListener("mousemove", (e) => {
      const uv = new Vec2([e.x, e.y]).divideElements(
        new Vec2(this.uResolution.value)
      );
      const coords = toCoords(new Vec2([uv.x, 1 - uv.y]));
      this.uMouse.update(coords.get());
      this.mouseMoveHandlers.forEach((handler) => handler(coords, e));
    });
  }

  setClearColor(color: Vec4Array) {
    this.gl.setClearColor(color);
    return this;
  }

  clear() {
    this.gl.clear();
  }

  draw(time = 0) {
    this.uTime.update(time);
    this.shapes.forEach((shape) => {
      this.uShapePos.update(shape.center.get());
      this.gl.withBufferBind(
        () => {
          this.program
            .getAttribLocation("a_position")
            .enable()
            .setPointer(3, WebGL2RenderingContext.FLOAT, false, 0, 0);
          this.gl.gl.drawElements(
            shape.drawType,
            shape._vertexCount,
            this.gl.gl.UNSIGNED_SHORT,
            0
          );
        },
        shape.indexBuffer,
        shape.vertexBuffer
      );
    });
  }
}
