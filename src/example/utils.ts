import convert from "color-convert";
import { vec3, Vec3Array } from "../utils";
import { randomMapped } from "./shapes/shape";

export function getRandomPastelColor() {
  return vec3(
    convert.lch
      .rgb(70, 30, randomMapped(180, 360))
      .map((val) => val / 255) as Vec3Array,
  );
}
