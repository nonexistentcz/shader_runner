import {
  Vec4Array,
  MapFn,
  SwizzleStringVec2,
  Vec2Array,
  SwizzleStringVec3,
  Vec3Array,
  SwizzleStringVec4,
  SwizzleString,
} from "./types";
import { handleSwizzle } from "./utils";

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

export type Vec4Union = Vec4 | Vec4Array;
export function resolveVec4(vec: Vec4Union) {
  return vec instanceof Vec4 ? vec.get() : vec;
}
