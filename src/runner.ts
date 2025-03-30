import { getCanvas, GLCanvas } from "./canvas";
import { GL2 } from "./gl";
import { Vec4Array } from "./utils/vector";
import { BufferType, ShaderType } from "./enums";
import { GLProgram } from "./program";
import { GLShader } from "./shader";
import { GLUniformValue, uniform3fv } from "./uniform";
import { GLShape } from "./shapes";

export class Runner {
  private gl: GL2;
  private canvas: GLCanvas;
  private program: GLProgram;
  private shaders = new Map<string, GLShader>();
  private shapes: GLShape[] = [];
  // TODO: implement with matrices
  private uShapePos = uniform3fv("u_ShapePos", [0, 0, 0]);

  constructor(canvasId?: string) {
    this.canvas = getCanvas(canvasId);
    this.gl = this.canvas.getGl();
    this.program = this.gl.createProgram();
  }

  getCanvas() {
    return this.canvas;
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

  async init() {
    await this.loadShader("/shader/main.frag", ShaderType.Fragment);
    await this.loadShader("/shader/main.vert", ShaderType.Vertex);
    this.prepareProgram();
    this.canvas.adjustSizeAndViewport();
    this.gl.viewportFromCanvas();
    this.useUniform(this.uShapePos);
  }

  setClearColor(color: Vec4Array) {
    this.gl.setClearColor(color);
    return this;
  }

  clear() {
    this.gl.clear();
  }

  draw() {
    this.shapes.forEach((shape) => {
      this.uShapePos.update(shape.center);
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
