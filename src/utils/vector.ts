export type Vec2Array = [number, number];
export type Vec3Array = [number, number, number];
export type Vec4Array = [number, number, number, number];
type MapFn = (value: number, index: number, array: number[]) => number;
const swizzleIndices = {
  x: 0,
  y: 1,
  z: 2,
  a: 3,
  r: 0,
  g: 1,
  b: 2,
} as const;
type Dir = keyof typeof swizzleIndices;
type SwizzleStringVec4 = `${Dir}${Dir}${Dir}${Dir}`;
type SwizzleStringVec3 = `${Dir}${Dir}${Dir}`;
type SwizzleStringVec2 = `${Dir}${Dir}`;
type SwizzleString =
  | Dir
  | SwizzleStringVec2
  | SwizzleStringVec3
  | SwizzleStringVec4;

function handleSwizzle(swizzleStr: SwizzleString) {
  if (swizzleStr.length === 1) return swizzleIndices[swizzleStr as Dir];
  return [...swizzleStr].map((dir) => swizzleIndices[dir as Dir]);
}

export function radians(deg: number) {
  return (180 / Math.PI) * deg;
}

export function degrees(rad: number) {
  return (rad / Math.PI) * 180;
}

export class Vec4 {
  constructor(private val: Vec4Array) {}

  map(fn: MapFn, thisArg?: any) {
    return new Vec4(this.val.map(fn, thisArg) as Vec4Array);
  }

  get(): Vec4Array;
  //@ts-ignore
  get(swizzleStr: Dir): number;
  get(swizzleStr: SwizzleStringVec2): Vec2Array;
  get(swizzleStr: SwizzleStringVec3): Vec3Array;
  get(swizzleStr: SwizzleStringVec4): Vec4Array;
  get(swizzleStr?: SwizzleString) {
    if (!swizzleStr) return this.val;
    return handleSwizzle(swizzleStr);
  }
}

export function vec4(vector: Vec4Array) {
  return new Vec4(vector);
}

export class Vec3 {
  constructor(private val: Vec3Array) {}

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
  set z(val: number) {
    this.val[2] = val;
  }
  get z() {
    return this.val[2];
  }

  toVec2() {
    return new Vec2([this.val[0], this.val[1]]);
  }

  add(other: Vec3) {
    return new Vec3([this.x + other.x, this.y + other.y, this.z + other.z]);
  }

  multiply(scalar: number) {
    return new Vec3([this.x * scalar, this.y * scalar, this.z * scalar]);
  }

  multiplyElements(other: Vec3) {
    return new Vec3([this.x * other.x, this.y * other.y, this.z * other.z]);
  }

  divide(scalar: number) {
    return new Vec3([this.x / scalar, this.y / scalar, this.z / scalar]);
  }

  divideElements(other: Vec3) {
    return new Vec3([this.x / other.x, this.y / other.y, this.z / other.z]);
  }

  rotateX(angle: number) {
    return new Vec3([
      this.x,
      this.y * Math.cos(angle) - this.y * Math.sin(angle),
      this.y * Math.sin(angle) + this.z * Math.cos(angle),
    ]);
  }

  rotateY(angle: number) {
    return new Vec3([
      this.x * Math.cos(angle) + this.z * Math.sin(angle),
      this.y,
      -this.x * Math.sin(angle) + this.z * Math.cos(angle),
    ]);
  }

  rotateZ(angle: number) {
    return new Vec3([
      this.x * Math.cos(angle) - this.y * Math.sin(angle),
      this.x * Math.sin(angle) + this.y * Math.cos(angle),
      this.z,
    ]);
  }

  rotate(yaw: number, pitch: number, roll: number) {
    return new Vec3([
      this.x * Math.cos(pitch) * Math.cos(roll) +
        this.y *
          (Math.sin(yaw) * Math.sin(pitch) * Math.cos(roll) -
            Math.cos(yaw) * Math.sin(roll)) +
        this.z *
          (Math.cos(yaw) * Math.sin(pitch) * Math.cos(roll) +
            Math.sin(yaw) * Math.sin(roll)),
      this.x * Math.cos(pitch) * Math.sin(roll) +
        this.y *
          (Math.sin(yaw) * Math.sin(pitch) * Math.sin(roll) +
            Math.cos(yaw) * Math.cos(roll)) +
        this.z *
          (Math.cos(yaw) * Math.sin(pitch) * Math.sin(roll) -
            Math.sin(yaw) * Math.cos(roll)),
      -this.x * Math.sin(pitch) +
        this.y * Math.sin(yaw) * Math.cos(pitch) +
        this.z * Math.sin(yaw) * Math.cos(pitch),
    ]);
  }

  rotate90X() {
    return new Vec3([this.x, this.z, -this.y]);
  }

  rotate90Y() {
    return new Vec3([-this.z, this.y, this.x]);
  }

  rotate90Z() {
    return new Vec3([-this.y, this.x, this.z]);
  }

  map(fn: MapFn, thisArg: any) {
    return new Vec3(this.val.map(fn, thisArg) as Vec3Array);
  }

  get(): Vec3Array;
  //@ts-ignore
  get(swizzleStr: Dir): number;
  get(swizzleStr: SwizzleStringVec2): Vec2Array;
  get(swizzleStr: SwizzleStringVec3): Vec3Array;
  get(swizzleStr: SwizzleStringVec4): Vec4Array;
  get(swizzleStr?: SwizzleString) {
    if (!swizzleStr) return this.val;
    return handleSwizzle(swizzleStr);
  }
}

export function vec3(vector: Vec3Array) {
  return new Vec3(vector);
}

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

export function vec2(vector: Vec2Array | Vec2) {
  if (vector instanceof Vec2) return vector;
  return new Vec2(vector);
}

export function intersectionLineLine(
  aStart: Vec2Array | Vec2,
  aVec: Vec2Array | Vec2,
  bStart: Vec2Array | Vec2,
  bVec: Vec2Array | Vec2
) {
  const aStartV = vec2(aStart);
  const aVecV = vec2(aVec);
  const bVecV = vec2(bVec);
  const x = vec2(bStart).subtract(aStartV);
  const cross = aVecV.cross(bVecV);
  const t = x.cross(bVecV) / cross;
  return aStartV.add(aVecV.multiply(t));
}
