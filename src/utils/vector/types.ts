import { Vec3 } from ".";
import { swizzleIndices } from "./utils";

export type Vec2Array = [number, number];
export type Vec3Array = [number, number, number];
export type Vec4Array = [number, number, number, number];

export type MapFn = (value: number, index: number, array: number[]) => number;

export type Dir = keyof typeof swizzleIndices;

export type SwizzleStringVec4 = `${Dir}${Dir}${Dir}${Dir}`;
export type SwizzleStringVec3 = `${Dir}${Dir}${Dir}`;
export type SwizzleStringVec2 = `${Dir}${Dir}`;

export type SwizzleString =
  | Dir
  | SwizzleStringVec2
  | SwizzleStringVec3
  | SwizzleStringVec4;

export type Vec3Union = Vec3 | Vec3Array;
