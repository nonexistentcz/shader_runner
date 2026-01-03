import { Vec3Array, Vec2Array, MapFn, degrees, Vec3, Vec2Union } from ".";

export class Vec2 {
  static fromVec3(vec: Vec3 | Vec3Array) {
    const [x, y] = "get" in vec ? vec.get() : vec;
    return new Vec2([x, y]);
  }
  constructor(private val: Vec2Array) {}

  toVec3() {
    return new Vec3([this.x, this.y, 0]);
  }

  set x(val: number) {
    this.val[0] = val;
  }
  get x() {
    return this.val[0];
  }
  set y(val: number) {
    this.val[1] = val;
  }
  get y() {
    return this.val[1];
  }

  map(fn: MapFn, thisArg: any) {
    return new Vec2(this.val.map(fn, thisArg) as Vec2Array);
  }

  rotate(angle: number) {
    return new Vec2([
      this.x * Math.cos(angle) - this.y * Math.sin(angle),
      this.x * Math.sin(angle) + this.y * Math.cos(angle),
    ]);
  }

  rotate90() {
    return new Vec2([this.y, -this.x]);
  }

  rotate180() {
    return new Vec2([-this.x, -this.y]);
  }

  rotate270() {
    return new Vec2([-this.y, -this.x]);
  }

  angle() {
    return Math.atan2(this.y, this.x);
  }

  degrees() {
    return degrees(this.angle());
  }

  radians() {
    return this.angle();
  }

  angleTo(other: Vec2) {
    return Math.atan2(other.y - this.y, other.x - this.x);
  }

  distanceTo(other: Vec2) {
    return other.subtract(this).magnitude();
  }

  setAngle(angle: number) {
    return this.rotate(this.angle() - angle);
  }

  add(other: Vec2) {
    return new Vec2([this.x + other.x, this.y + other.y]);
  }

  subtract(other: Vec2) {
    return new Vec2([this.x - other.x, this.y - other.y]);
  }

  multiply(scalar: number) {
    return new Vec2([this.x * scalar, this.y * scalar]);
  }

  multiplyElements(other: Vec2) {
    return new Vec2([this.x * other.x, this.y * other.y]);
  }

  divide(scalar: number) {
    return new Vec2([this.x / scalar, this.y / scalar]);
  }

  divideElements(other: Vec2) {
    return new Vec2([this.x / other.x, this.y / other.y]);
  }

  magnitude() {
    const [x, y] = this.val;
    return Math.sqrt(x * x + y * y);
  }

  setMagnitude(val: number) {
    const magnitude = this.magnitude();
    this.x = (this.x / magnitude) * val;
    this.y = (this.y / magnitude) * val;
    return this;
  }

  withMagnitude(val: number) {
    const magnitude = this.magnitude();
    return new Vec2([(this.x / magnitude) * val, (this.y / magnitude) * val]);
  }

  dot(other: Vec2) {
    return this.x * other.x + this.y * other.y;
  }

  cross(other: Vec2) {
    return this.x * other.y - this.y * other.x;
  }

  normalize() {
    return this.withMagnitude(1);
  }

  get() {
    return this.val;
  }
}

export function vec2(vector: Vec2Union) {
  if (vector instanceof Vec2) return vector;
  return new Vec2(vector);
}

export function intersectionLineLine(
  aStart: Vec2Union,
  aVec: Vec2Union,
  bStart: Vec2Union,
  bVec: Vec2Union
) {
  const _aStart = vec2(aStart);
  const _aVec = vec2(aVec);
  const _bVec = vec2(bVec);

  const x = vec2(bStart).subtract(_aStart);
  const cross = _aVec.cross(_bVec);
  const t = x.cross(_bVec) / cross;

  return _aStart.add(_aVec.multiply(t));
}

export function bevelLine(start: Vec2Union, vec: Vec2Union, offset: number) {
  const _start = vec2(start);
  const _vec = vec2(vec);
  const bevel = vec2(_vec).rotate90().setMagnitude(offset);
  return [_start.add(bevel), _start.subtract(bevel)];
}
