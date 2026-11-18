import {
  bevelLine,
  intersectionLineLine,
  vec2,
  Vec2,
  Vec2Union,
} from "../utils/vector";
import { Buffers, GLBuffer } from "../gl";
import { clamp } from "../utils";
import { DrawType, Shape, ShapeTransform } from "./types";

export class GLShape<
  TMatrix,
  TTransform extends ShapeTransform<TMatrix>,
> implements Shape<TMatrix, TTransform> {
  protected _vertexBuffer?: GLBuffer;
  protected _indexBuffer?: GLBuffer;
  public drawType = DrawType.Triangles;
  private _vertexCount = 0;
  private _boundingRadius = 0;

  constructor(public transform: TTransform) {}

  get vertexBuffer() {
    return this._vertexBuffer;
  }

  get indexBuffer() {
    return this._indexBuffer;
  }

  get vertexCount() {
    return this._vertexCount;
  }

  /** Distance from the shape origin to its farthest vertex */
  get boundingRadius() {
    return this._boundingRadius;
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
      new Uint16Array(Array.from({ length: vertices.length / 3 }, (_, i) => i)),
    );
    this._vertexCount = vertices.length / 3;
    this._boundingRadius = 0;
    for (let i = 0; i < vertices.length; i += 3) {
      this._boundingRadius = Math.max(
        this._boundingRadius,
        Math.hypot(vertices[i], vertices[i + 1], vertices[i + 2]),
      );
    }
    return this;
  }

  getVertexData(): number[] {
    return [];
  }
}

export class Rectangle<
  TMatrix,
  TTransform extends ShapeTransform<TMatrix>,
> extends GLShape<TMatrix, TTransform> {
  public drawType = DrawType.TriangleFan;
  constructor(
    transform: TTransform,
    public width: number,
    public height: number,
  ) {
    super(transform);
  }

  setSize(size: Vec2Union) {
    const _size = vec2(size);
    this.width = _size.x;
    this.height = _size.y;
    return this;
  }

  getVertexData(): number[] {
    const x1 = -this.width / 2;
    const x2 = this.width / 2;
    const y1 = -this.height / 2;
    const y2 = this.height / 2;
    return [x1, y1, 0, x2, y1, 0, x2, y2, 0, x1, y2, 0];
  }
}

export class RectangleOutlined<
  TMatrix,
  TTransform extends ShapeTransform<TMatrix>,
> extends GLShape<TMatrix, TTransform> {
  constructor(
    transform: TTransform,
    public width: number,
    public height: number,
    public outlineWidth: number,
  ) {
    super(transform);
  }

  setSize(size: Vec2Union) {
    const _size = vec2(size);
    this.width = _size.x;
    this.height = _size.y;
    return this;
  }

  getVertexData(): number[] {
    const topLeft = new Vec2([-this.width / 2, -this.height / 2]);
    const bottomRight = new Vec2([this.width / 2, this.height / 2]);
    const topLeftOutline = topLeft.add(
      new Vec2([this.outlineWidth, this.outlineWidth]),
    );
    const bottomRightOutline = bottomRight.subtract(
      new Vec2([this.outlineWidth, this.outlineWidth]),
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

export class Circle<
  TMatrix,
  TTransform extends ShapeTransform<TMatrix>,
> extends GLShape<TMatrix, TTransform> {
  public drawType = DrawType.TriangleFan;
  constructor(
    transform: TTransform,
    /** Radius of the circle in world units */
    public radius: number,
    /** Arc angle in radians (2π for a full circle) */
    public theta: number,
    /** Number of triangle segments used to approximate the circle */
    public precision: number,
  ) {
    super(transform);
  }

  getVertexData(): number[] {
    return Array.from({ length: this.precision }, (_, i) => {
      const angle = (i / this.precision) * this.theta;
      return [Math.cos(angle) * this.radius, Math.sin(angle) * this.radius, 0];
    }).flat();
  }
}

export class Ring<
  TMatrix,
  TTransform extends ShapeTransform<TMatrix>,
> extends GLShape<TMatrix, TTransform> {
  public drawType = DrawType.TriangleStrip;
  constructor(
    transform: TTransform,
    public radius: number,
    public radiusInner: number,
    public theta: number,
    public precision: number,
  ) {
    super(transform);
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

export class Line<
  TMatrix,
  TTransform extends ShapeTransform<TMatrix>,
> extends GLShape<TMatrix, TTransform> {
  drawType = DrawType.TriangleFan;
  constructor(
    transform: TTransform,
    public x1: Vec2,
    public x2: Vec2,
    public width: number,
  ) {
    super(transform);
  }

  setStart(start: Vec2Union) {
    this.x1 = vec2(start);
    return this;
  }

  setEnd(end: Vec2Union) {
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

export class Polygon<
  TMatrix,
  TTransform extends ShapeTransform<TMatrix>,
> extends GLShape<TMatrix, TTransform> {
  public drawType: DrawType = DrawType.TriangleFan;
  public vertices: Vec2[];

  constructor(
    transform: TTransform,
    _vertices: Vec2Union[],
    public loopEnd = false,
  ) {
    super(transform);
    this.vertices = _vertices.map(vec2);
  }

  setVertex(i: number, val: Vec2Union) {
    this.vertices[i] = vec2(val);
    return this;
  }

  pushVertex(val: Vec2Union) {
    this.vertices.push(vec2(val));
    return this;
  }

  private vertexAt(i: number) {
    if (!this.loopEnd)
      return this.vertices[clamp(i, 0, this.vertices.length - 1)];
    const idx = i % this.vertices.length;
    return this.vertices.at(idx)!;
  }

  getVertexData() {
    const data = Array.from(
      {
        length: this.vertices.length + (this.loopEnd ? 1 : 0),
      },
      (_, i) => this.vertexAt(i).toVec3().get(),
    ).flat();
    console.log(data);
    return data;
  }
}

export class Outline<
  TMatrix,
  TTransform extends ShapeTransform<TMatrix>,
> extends GLShape<TMatrix, TTransform> {
  public drawType: DrawType = DrawType.TriangleStrip;
  public vertices: Vec2[];
  constructor(
    transform: TTransform,
    _vertices: Array<Vec2Union>,
    public width: number,
    public loopEnd = false,
  ) {
    super(transform);
    this.vertices = _vertices.map(vec2);
  }

  setVertex(i: number, val: Vec2Union) {
    this.vertices[i] = vec2(val);
    return this;
  }

  pushVertex(val: Vec2Union) {
    this.vertices.push(vec2(val));
    return this;
  }

  private vertexAt(i: number) {
    if (!this.loopEnd)
      return this.vertices[clamp(i, 0, this.vertices.length - 1)];
    const idx = i % this.vertices.length;
    return this.vertices.at(idx)!;
  }

  getVertexData() {
    if (this.vertices.length <= 1) return [];

    return Array.from(
      {
        length: this.vertices.length + (this.loopEnd ? 1 : 0),
      },
      (_, i) => {
        const prev = this.vertexAt(i - 1);
        const cur = this.vertices[i];
        const next = this.vertexAt(i + 1);

        const prevDir = cur.subtract(prev);
        const [prevBevel1, prevBevel2] = bevelLine(prev, prevDir, this.width);
        const curDir = next.subtract(cur);
        const [curBevel1, curBevel2] = bevelLine(cur, curDir, this.width);

        const i1 = intersectionLineLine(
          prevBevel1,
          prevDir,
          curBevel1,
          curDir,
        ).toVec3();
        const i2 = intersectionLineLine(
          prevBevel2,
          prevDir,
          curBevel2,
          curDir,
        ).toVec3();
        return [...i1.get(), ...i2.get()];
      },
    ).flat();
  }
}
