import { Vec2 } from "./vector";

export function clamp(t: number, floor = 0, ceil = 1) {
  return Math.min(Math.max(t, floor), ceil);
}

export function map(p1: number, p2: number, t: number) {
  return p1 + (p2 - p1) * t;
}

export function steps(count: number, t: number) {
  return Math.floor(t * count) / count;
}

export function mapVec(p1: number[], p2: number[], t: number) {
  return Array.from({ length: Math.min(p1.length, p2.length) }, (_, i) =>
    map(t, p1[i], p2[i])
  );
}

export function smoothstep(p1: number, p2: number, t: number) {
  const mappedX = clamp((t - p1) / (p2 - p1));
  return mappedX * mappedX * (3 - 2 * mappedX);
}

export function smoothstepVec(p1: number[], p2: number[], t: number) {
  const smoothstepX = smoothstep(0, 1, t);
  return Array.from({ length: Math.min(p1.length, p2.length) }, (_, i) =>
    map(smoothstepX, p1[i], p2[i])
  );
}

export function cubicBezier(p1: Vec2, p2: Vec2, p3: Vec2, p4: Vec2, t: number) {
  let sub = 1 - t;
  return p1
    .multiply(sub * sub * sub)
    .add(p2.multiply(3 * sub * sub * t))
    .add(p3.multiply(3 * sub * t * t))
    .add(p4.multiply(t * t * t));
}
