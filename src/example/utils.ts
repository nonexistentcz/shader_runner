import convert from "color-convert";
import { vec3, Vec3Array } from "../utils";
import { randomMapped } from "./shapes/shape";

/** muted color from an LCH hue (0-360), lightness and chroma */
export function getPastelColor(hue: number, lightness = 70, chroma = 30) {
  return convert.lch
    .rgb(lightness, chroma, hue)
    .map((val) => val / 255) as Vec3Array;
}

export function getRandomPastelColor() {
  return vec3(getPastelColor(randomMapped(180, 360)));
}
