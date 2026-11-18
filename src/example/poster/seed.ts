import { uniform2fv } from "../../gl";
import { Vec2Array } from "../../utils";

/** How long a noise pattern is held before it is re-rolled */
export const NOISE_INTERVAL_SECONDS = 0.1;

function randomSeed(): Vec2Array {
  // pixel offset for the noise hashes, small enough for mediump precision
  return [Math.random() * 1000, Math.random() * 1000];
}

/**
 * `u_Seed` uniform for one program, call `tick` in its before-draw hook so the
 * update happens while that program is in use
 */
export function createNoiseSeed() {
  const uniform = uniform2fv("u_Seed", randomSeed());
  let lastStep = 0;
  return {
    uniform,
    tick(time: number) {
      const step = Math.floor(time / (NOISE_INTERVAL_SECONDS * 1000));
      if (step === lastStep) return;
      lastStep = step;
      uniform.update(randomSeed());
    },
  };
}
