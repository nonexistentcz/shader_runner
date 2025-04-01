import { Buffers, GLBuffer } from "./buffer";
import { vec3, Vec3, Vec3Array } from "./utils/vector";

export enum DrawType {
  Points = WebGL2RenderingContext.POINTS,
  LineStrip = WebGL2RenderingContext.LINE_STRIP,
  LineLoop = WebGL2RenderingContext.LINE_LOOP,
  Lines = WebGL2RenderingContext.LINES,
  TriangleStrip = WebGL2RenderingContext.TRIANGLE_STRIP,
  TriangleFan = WebGL2RenderingContext.TRIANGLE_FAN,
  Triangles = WebGL2RenderingContext.TRIANGLES,
}

interface Shape {
  // TODO: implement using matrices
  center: Vec3;
  drawType: DrawType;

  get vertexCount(): number;
  get vertexBuffer(): GLBuffer | undefined;
  get indexBuffer(): GLBuffer | undefined;

  getVertexData(): number[];
}

export class GLShape implements Shape {
  protected _vertexBuffer?: GLBuffer;
  protected _indexBuffer?: GLBuffer;
  public drawType = DrawType.Triangles;
  public _vertexCount = 0;
  public center: Vec3 = vec3([0, 0, 0]);

  get vertexBuffer() {
    return this._vertexBuffer;
  }

  get indexBuffer() {
    return this._indexBuffer;
  }

  get vertexCount() {
    return this._vertexCount;
  }

  setCenter(pos: Vec3) {
    this.center = pos;
    return this;
  }

  bind({ index, vertex }: Buffers) {
    this._vertexBuffer = vertex;
    this._indexBuffer = index;
    this.updateBuffers();
    return this;
  }

  updateBuffers() {
    const vertices = this.getVertexData();
    this._vertexBuffer?.setDataWithBind(new Float32Array(vertices));
    this._indexBuffer?.setDataWithBind(
      new Uint16Array(Array.from({ length: vertices.length / 3 }, (_, i) => i))
    );
    this._vertexCount = vertices.length / 3;
    return this;
  }

  getVertexData(): number[] {
    return [];
  }
}

class Rectangle extends GLShape {
  public drawType = DrawType.TriangleFan;
  constructor(public width: number, public height: number) {
    super();
  }

  getVertexData(): number[] {
    const x1 = -this.width / 2;
    const x2 = this.width / 2;
    const y1 = -this.height / 2;
    const y2 = this.height / 2;
    return [x1, y1, 0, x2, y1, 0, x2, y2, 0, x1, y2, 0];
  }
}

export function rectangle(width: number, height: number) {
  return new Rectangle(width, height);
}

class Circle extends GLShape {
  public drawType = DrawType.TriangleFan;
  constructor(
    public radius: number,
    public theta: number,
    public precision: number
  ) {
    super();
  }

  getVertexData(): number[] {
    return Array.from({ length: this.precision }, (_, i) => {
      const angle = (i / this.precision) * this.theta;
      return [Math.cos(angle) * this.radius, Math.sin(angle) * this.radius, 0];
    }).flat();
  }
}

export function circle(radius: number, precision: number): Shape {
  return new Circle(radius, 2 * Math.PI, precision);
}

class Ring extends GLShape {
  public drawType = DrawType.TriangleStrip;
  constructor(
    public radius: number,
    public radiusInner: number,
    public theta: number,
    public precision: number
  ) {
    super();
  }

  getVertexData(): number[] {
    return Array.from({ length: this.precision }, (_, i) => {
      const angle = (i / (this.precision - 1)) * this.theta;
      return [
        Math.cos(angle) * this.radius,
        Math.sin(angle) * this.radius,
        0,
        Math.cos(angle) * this.radiusInner,
        Math.sin(angle) * this.radiusInner,
        0,
      ];
    }).flat();
  }
}

export function ring(radius: number, radiusInner: number, precision: number) {
  return new Ring(radius, radiusInner, 2 * Math.PI, precision);
}
