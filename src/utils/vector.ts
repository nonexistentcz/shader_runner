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

export function radians(degrees: number) {
  return (180 / Math.PI) * degrees;
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

  toVec2() {
    return new Vec2([this.val[0], this.val[1]]);
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

  angle() {
    return Math.atan2(this.x, this.y);
  }

  angleTo(other: Vec2) {
    return Math.atan2(other.x - this.x, other.y - this.y);
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

  multiply(val: number) {
    return new Vec2([this.x * val, this.y * val]);
  }

  divide(val: number) {
    return new Vec2([this.x / val, this.y / val]);
  }

  magnitude() {
    const [x, y] = this.val;
    return Math.sqrt(x * x + y * y);
  }

  setMagnitude(val: number) {
    const magnitude = this.magnitude();
    this.x = (this.x / magnitude) * val;
    this.y = (this.y / magnitude) * val;
  }

  withMagnitude(val: number) {
    const magnitude = this.magnitude();
    return new Vec2([(this.x / magnitude) * val, (this.y / magnitude) * val]);
  }

  dot(other: Vec2) {
    return this.x * other.x + this.y * other.y;
  }

  normalize() {
    return this.withMagnitude(1);
  }

  get() {
    return this.val;
  }
}

export function vec2(vector: Vec2Array) {
  return new Vec2(vector);
}
