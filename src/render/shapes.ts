import { Buffers, GLBuffer } from "../gl/buffer";
import { clamp, mapVec } from "../utils/ease";
import { vec2, Vec2, Vec2Array, vec3, Vec3 } from "../utils/vector";

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

export function rectangle(
  width: number,
  height: number,
  outlineWidth?: number
) {
  if (outlineWidth) {
    return new RectangleOutlined(width, height, outlineWidth);
  }
  return new Rectangle(width, height);
}

class RectangleOutlined extends GLShape {
  constructor(
    public width: number,
    public height: number,
    public outlineWidth: number
  ) {
    super();
  }

  getVertexData(): number[] {
    const topLeft = new Vec2([-this.width / 2, -this.height / 2]);
    const bottomRight = new Vec2([this.width / 2, this.height / 2]);
    const topLeftOutline = topLeft.add(
      new Vec2([this.outlineWidth, this.outlineWidth])
    );
    const bottomRightOutline = bottomRight.subtract(
      new Vec2([this.outlineWidth, this.outlineWidth])
    );
    return [
      // 1
      topLeft.x,
      topLeft.y,
      0,
      topLeft.x,
      topLeftOutline.y,
      0,
      bottomRight.x,
      topLeftOutline.y,
      0,
      topLeft.x,
      topLeft.y,
      0,
      bottomRight.x,
      topLeftOutline.y,
      0,
      bottomRight.x,
      topLeft.y,
      0,
      // 2
      topLeft.x,
      topLeftOutline.y,
      0,
      topLeft.x,
      bottomRightOutline.y,
      0,
      topLeftOutline.x,
      bottomRightOutline.y,
      0,
      topLeft.x,
      topLeftOutline.y,
      0,
      topLeftOutline.x,
      bottomRightOutline.y,
      0,
      topLeftOutline.x,
      topLeftOutline.y,
      0,
      // 3
      topLeft.x,
      bottomRightOutline.y,
      0,
      topLeft.x,
      bottomRight.y,
      0,
      bottomRight.x,
      bottomRight.y,
      0,
      topLeft.x,
      bottomRightOutline.y,
      0,
      bottomRight.x,
      bottomRight.y,
      0,
      bottomRight.x,
      bottomRightOutline.y,
      0,
      // 4
      bottomRightOutline.x,
      topLeftOutline.y,
      0,
      bottomRightOutline.x,
      bottomRightOutline.y,
      0,
      bottomRight.x,
      bottomRightOutline.y,
      0,
      bottomRightOutline.x,
      topLeftOutline.y,
      0,
      bottomRight.x,
      bottomRightOutline.y,
      0,
      bottomRight.x,
      topLeftOutline.y,
      0,
    ];
  }
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

export function circle(radius: number, precision: number) {
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

class Line extends GLShape {
  drawType = DrawType.TriangleFan;
  constructor(public x1: Vec2, public x2: Vec2, public width: number) {
    super();
  }

  setStart(start: Vec2Array | Vec2) {
    this.x1 = vec2(start);
    return this;
  }

  setEnd(end: Vec2Array | Vec2) {
    this.x2 = vec2(end);
    return this;
  }

  getVector() {
    return this.x2.subtract(this.x1);
  }

  getVertexData(): number[] {
    const vec = this.x2.subtract(this.x1);
    const right = vec.rotate90().withMagnitude(this.width);
    const topLeft = this.x1.add(right);
    const bottomLeft = this.x1.subtract(right);
    const topRight = topLeft.add(vec);
    const bottomRight = bottomLeft.add(vec);

    return [
      topLeft.x,
      topLeft.y,
      0,
      bottomLeft.x,
      bottomLeft.y,
      0,
      bottomRight.x,
      bottomRight.y,
      0,
      topRight.x,
      topRight.y,
      0,
    ];
  }
}

export function line(x1: Vec2, x2: Vec2, width: number) {
  return new Line(x1, x2, width);
}

class Outline extends GLShape {
  public drawType: DrawType = DrawType.TriangleStrip;
  public vertices: Vec2[];
  constructor(
    _vertices: Array<Vec2 | Vec2Array>,
    public width: number,
    public loopEnd = false
  ) {
    super();
    this.vertices = _vertices.map(vec2);
  }

  setVertex(i: number, val: Vec2Array | Vec2) {
    this.vertices[i] = vec2(val);
    return this;
  }

  pushVertex(val: Vec2Array | Vec2) {
    this.vertices.push(vec2(val));
    return this;
  }

  private vertexAt(i: number) {
    if (!this.loopEnd) return this.vertices[clamp(i, 0, this.vertices.length)];
    const idx = i % this.vertices.length;
    return this.vertices.at(idx)!;
  }

  getVertexData() {
    return Array.from(
      {
        length: this.vertices.length + (this.loopEnd ? 1 : 0),
      },
      (_, i) => {
        const prev = this.vertexAt(i - 1)!;
        const cur = this.vertices[i];
        const next = this.vertexAt(i + 1);
        const next1 = cur.add(
          next.subtract(cur).setMagnitude(this.width).rotate90()
        );
        const next2 = next1.rotate180();
        const prev1 = prev.subtract(cur).setMagnitude(this.width).rotate90();
        const prev2 = prev1.rotate180();
        return [
          ...mapVec(prev1.get(), next1.get(), 0.5),
          ...mapVec(prev2.get(), next2.get(), 0.5),
        ];
      }
    ).flat();
  }
}

export function outline(vertices: Vec2Array[], loopEnd: boolean) {
  return new Outline(vertices, innerWidth, loopEnd);
}
