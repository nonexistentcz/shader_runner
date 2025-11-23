import { getCanvas, GLCanvas, uniform4x4 } from "../../gl";
import { GL2Wrapper } from "../../gl/wrapper";
import { Vec2, Vec4Array } from "../../utils/vector";
import { BufferType, FramebufferType } from "../../gl/web-gl-enums";
import { GLProgram } from "../../gl";
import { uniform1f, uniform2fv } from "../../gl";
import { GLShape } from "../../render/shapes";
import { Matrix4x4 } from "../../utils";
import { ProgramBuilder } from "./program-builder";

export function toClipCoords(vec: Vec2) {
  return new Vec2([vec.x * 2 - 1, vec.y * 2 - 1]);
}

type UIEventHandler = (coords: Vec2, e: UIEvent) => unknown;

type RunnerShape<T> = {
  shape: GLShape;
  props?: T;
};

type BuilderFunction = (builder: ProgramBuilder) => ProgramBuilder;
type BeforeDraw<TProps> = (props?: TProps) => void;

export class Runner<TProps> {
  private gl: GL2Wrapper;
  private canvas: GLCanvas;
  private program: GLProgram | null = null;
  private shapes: RunnerShape<TProps>[] = [];
  private uTransform = uniform4x4("u_Transform", Matrix4x4.unit());
  private uResolution = uniform2fv("u_Resolution", [0, 0]);
  private uMouse = uniform2fv("u_Mouse", [0, 0]);
  private uTime = uniform1f("u_Time", 0);
  private mouseMoveHandlers: Array<UIEventHandler> = [];
  private beforeDraw?: BeforeDraw<TProps>;

  constructor(canvasId?: string) {
    this.canvas = getCanvas(canvasId);
    this.gl = this.canvas.getGl();
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

  use(values: Array<GLProgram | GLShape>) {
    values.forEach((value) => {
      if (value instanceof GLShape) this.useShape(value);
      else if (value instanceof GLProgram) this.useProgram(value);
    });
    return this;
  }

  useProgram(program: GLProgram) {
    this.program = program;
    return this.gl.useProgram(program);
  }

  useShape(shape: GLShape, props?: TProps) {
    shape.bind({
      vertex: this.gl.createBuffer(BufferType.Vertex),
      index: this.gl.createBuffer(BufferType.Index),
    });

    this.shapes.push({ shape, props });
    return this;
  }

  prepareFramebuffer(framebufferType = FramebufferType.FrameBuffer) {
    return this.gl.createFramebuffer(framebufferType);
  }

  useBeforeDraw(beforeDraw: BeforeDraw<TProps>) {
    this.beforeDraw = beforeDraw;
    return this;
  }

  removeShape(shape: GLShape) {
    if (shape.vertexBuffer) this.gl.deleteBuffer(shape.vertexBuffer);
    if (shape.indexBuffer) this.gl.deleteBuffer(shape.indexBuffer);
    const index = this.shapes.findIndex((glShape) => glShape.shape === shape);
    if (index >= 0) this.shapes.splice(index, 1);
    return this;
  }

  onMouseMove(fn: UIEventHandler) {
    this.mouseMoveHandlers.push(fn);
  }

  adjustSizeAndViewport() {
    this.getCanvas();
    this.canvas.adjustSizeAndViewport();
    this.uResolution.update([this.canvas.el.width, this.canvas.el.height]);
  }

  createProgram(buildProgram: BuilderFunction) {
    return buildProgram(new ProgramBuilder()).build(this.gl);
  }

  async init(buildProgram: BuilderFunction = (builder) => builder) {
    const program = await this.createProgram(buildProgram);

    this.useProgram(program);
    program.useUniforms([
      this.uTransform,
      this.uMouse,
      this.uResolution,
      this.uTime,
    ]);

    this.adjustSizeAndViewport();
    this.canvas.onResize(() => this.adjustSizeAndViewport());
    this.canvas.el.addEventListener("mousemove", (e) => {
      const res = new Vec2(this.uResolution.value);
      const uv = new Vec2([e.x, e.y]).divideElements(res);
      const coords = toClipCoords(new Vec2([uv.x, 1 - uv.y]));
      const aspectRatio = res.x / res.y;
      const mouseCoords = new Vec2([coords.x * aspectRatio, coords.y]).divide(
        0.9
      );
      this.uMouse.update(mouseCoords.get());
      this.mouseMoveHandlers.forEach((handler) => handler(mouseCoords, e));
    });

    return program;
  }

  setClearColor(color: Vec4Array) {
    this.gl.setClearColor(color);
    return this;
  }

  clear() {
    this.gl.clear();
    return this;
  }

  draw(time = 0) {
    this.uTime.update(time);
    this.shapes.forEach(this.drawShape, this);
    return this;
  }

  drawShapes(shapes: RunnerShape<TProps>[], time = 0) {
    this.uTime.update(time);
    shapes.forEach(this.drawShape, this);
  }

  private drawShape({ shape, props }: RunnerShape<TProps>) {
    this.uTransform.update(
      Matrix4x4.rotation(...shape.rotation.get()).translate(
        ...shape.center.get()
      )
    );

    if (this.beforeDraw) {
      this.beforeDraw(props);
    }

    this.gl.withBufferBind(
      () => {
        if (!this.program) {
          throw new Error("A program must be attached in order to draw");
        }
        this.program
          .getAttribLocation("a_position")
          .enable()

          .setPointer(3, WebGL2RenderingContext.FLOAT);
        this.gl.drawShape(shape);
      },
      shape.indexBuffer,
      shape.vertexBuffer
    );
  }
}
