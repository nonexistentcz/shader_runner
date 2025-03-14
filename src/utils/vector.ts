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
