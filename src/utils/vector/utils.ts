import { Dir, SwizzleString } from "./";

export const swizzleIndices = {
  x: 0,
  y: 1,
  z: 2,
  a: 3,
  r: 0,
  g: 1,
  b: 2,
} as const;

export function handleSwizzle(swizzleStr: SwizzleString) {
  if (swizzleStr.length === 1) return swizzleIndices[swizzleStr as Dir];
  return [...swizzleStr].map((dir) => swizzleIndices[dir as Dir]);
}

export function radians(deg: number) {
  return (180 / Math.PI) * deg;
}

export function degrees(rad: number) {
  return (rad / Math.PI) * 180;
}
