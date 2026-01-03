import { BufferType, GL2Wrapper, GLProgram } from "../../gl";
import { GLScene } from "../../render/scene";
import { ShapeTransform } from "../../render/types";
import {
  GLRegisterFunction,
  GLRunnerBeforeDraw,
  GLRunnerBeforeShapeDraw,
  GLShapeGetter,
} from "./types";

export class GLRunnerProgram<
  TShape,
  TMatrix,
  TTransform extends ShapeTransform<TMatrix>
> {
  private shapes: TShape[] = [];

  constructor(
    private gl: GL2Wrapper,
    private program: GLProgram,
    private _getShape: GLShapeGetter<TShape, TMatrix, TTransform>,
    private _registerFn: GLRegisterFunction[],
    private _beforeShapeDraw: GLRunnerBeforeShapeDraw<
      TShape,
      TMatrix,
      TTransform
    >[],
    private _beforeDraw: GLRunnerBeforeDraw[]
  ) {}

  use() {
    this.gl.useProgram(this.program);

    this._registerFn.forEach((fn) => fn(this.program));
    this._registerFn = [];

    return this;
  }

  useShape(shape: TShape) {
    const _shape = this._getShape(shape);
    _shape.bind({
      vertex: this.gl.createBuffer(BufferType.Vertex),
      index: this.gl.createBuffer(BufferType.Index),
    });

    this.shapes.push(shape);
    return this;
  }

  createScene() {
    return new GLScene<TShape>();
  }

  useShapes(shapes: TShape[]) {
    shapes.forEach(this.useShape, this);
    return this;
  }

  removeShape(shape: TShape) {
    const _shape = this._getShape(shape);
    if (_shape.vertexBuffer) this.gl.deleteBuffer(_shape.vertexBuffer);
    if (_shape.indexBuffer) this.gl.deleteBuffer(_shape.indexBuffer);

    const index = this.shapes.findIndex((glShape) => glShape === shape);
    if (index >= 0) this.shapes.splice(index, 1);
    return this;
  }

  getShapes() {
    return this.shapes;
  }

  beforeShapeDraw(shape: TShape) {
    this._beforeShapeDraw.forEach((fn) => fn(shape, this._getShape(shape)));
  }

  beforeDraw(time: number) {
    this._beforeDraw.forEach((fn) => fn(time));
  }

  draw(time = 0) {
    this.beforeDraw(time);

    this.shapes.forEach(this.drawShape, this);
  }

  drawScene(scene: GLScene<TShape>, time = 0) {
    this.beforeDraw(time);
    scene.shapes.forEach(this.drawShape, this);
  }

  drawShapes(shapes: TShape[], time = 0) {
    this.beforeDraw(time);
    shapes.forEach(this.drawShape, this);
  }

  private drawShape(shape: TShape) {
    this.beforeShapeDraw(shape);
    const _shape = this._getShape(shape);
    this.gl.withBufferBind(
      () => {
        if (!this.program) {
          throw new Error("A program must be attached in order to draw");
        }
        this.program
          .getAttribLocation("a_position")
          .enable()

          .setPointer(3, WebGL2RenderingContext.FLOAT);
        this.gl.drawShape(_shape);
      },
      _shape.indexBuffer,
      _shape.vertexBuffer
    );
  }
}
