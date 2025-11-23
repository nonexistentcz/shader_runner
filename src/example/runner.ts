import { getCanvas, GLCanvas, uniform4x4 } from "../gl";
import { GL2Wrapper } from "../gl/wrapper";
import { Vec2, Vec3, Vec4Array } from "../utils/vector";
import { BufferType, ShaderType } from "../gl/web-gl-enums";
import { GLProgram } from "../gl";
import { GLShader } from "../gl";
import { GLUniformValue, uniform1f, uniform2fv } from "../gl";
import { GLShape } from "../render/shapes";
import { Matrix4x4 } from "../utils";

export function toClipCoords(vec: Vec2) {
  return new Vec2([vec.x * 2 - 1, vec.y * 2 - 1]);
}

type UIEventHandler = (coords: Vec2, e: UIEvent) => unknown;

type RunnerShape<T> = {
  shape: GLShape;
  props?: T;
};

type BeforeDraw<TProps> = (props?: TProps) => void;

export class Runner<TProps> {
  private gl: GL2Wrapper;
  private canvas: GLCanvas;
  private program: GLProgram;
  private shaders = new Map<string, GLShader>();
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
    return this;
  }

  useShader(shader: GLShader) {
    this.program.attachShader(shader);
    return this;
  }

  useUniform<T>(uniform: GLUniformValue<T>) {
    return this.program.useUniform(uniform);
  }

  useShape(shape: GLShape, props?: TProps) {
    shape.bind({
      vertex: this.gl.createBuffer(BufferType.Vertex),
      index: this.gl.createBuffer(BufferType.Index),
    });

    this.shapes.push({ shape, props });
    return this;
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
    this.use([this.uTransform, this.uMouse, this.uResolution, this.uTime]);
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
        this.program
          .getAttribLocation("a_position")
          .enable()
          .setPointer(3, WebGL2RenderingContext.FLOAT, false, 0, 0);
        this.gl.gl.drawElements(
          shape.drawType,
          shape.vertexCount,
          this.gl.gl.UNSIGNED_SHORT,
          0
        );
      },
      shape.indexBuffer,
      shape.vertexBuffer
    );
  }
}
