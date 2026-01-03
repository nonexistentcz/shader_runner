import { handleSwizzle, Vec3Union } from ".";
import {
  Vec3Array,
  MapFn,
  Vec2Array,
  Vec4Array,
  SwizzleString,
  SwizzleStringVec2,
  SwizzleStringVec3,
  SwizzleStringVec4,
} from ".";
import { Vec2 } from ".";

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

export function vec3(vector: Vec3Union) {
  if (vector instanceof Vec3) return vector;
  return new Vec3(vector);
}

export function resolveVec3(vec: Vec3Union) {
  return vec instanceof Vec3 ? vec.get() : vec;
}
