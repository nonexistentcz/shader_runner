import convert from "color-convert";
import { RectangleOutlined } from "../../render/shape";
import { circle2D, rectangle2D, Shape2DTransform } from "../../render/shape2d";
import { Vec2, Vec2Array, Vec3Array } from "../../utils";
import { GLRunnerShape2D } from "../runner/types";
import { randomMapped } from "../shapes/shape";
import { getPastelColor } from "../utils";

export type PosterShape = GLRunnerShape2D<{
  /** fill color, transparent when omitted */
  color?: Vec3Array;
  /** color of the dithered gradient, no gradient when omitted */
  foreground?: Vec3Array;
}>;

// hsl(hue 0-360, saturation 0-100, lightness 0-100)
// Pantone Black C (#2D2926)
const PANTONE_BLACK = convert.hsl
  .rgb(26, 8, 16)
  .map((val) => val / 255) as Vec3Array;
// random hues on every load, the accent stays darker to stand out
const PASTEL_ACCENT = getPastelColor(randomMapped(0, 360), 60, 40);
const BASE_HUE = randomMapped(0, 360);
const PASTEL_BASE = getPastelColor(BASE_HUE, 82, 22);
// hue at least 90° away from the background so the ball stays distinct
const PASTEL_BALL = getPastelColor(
  (BASE_HUE + randomMapped(90, 270)) % 360,
  75,
  30,
);
// relative to the shorter side of the screen
const FRAME_MARGIN = 0.05;
const FRAME_WIDTH = 0.01;
const CIRCLE_RADIUS = 0.3;
const RECTANGLE_SIZE: Vec2Array = [0.7, 0.18];
// offset of the rectangle center from the screen center, in px
const RECTANGLE_OFFSET: Vec2Array = [70, 250];

export function createPosterShapes(resolution: Vec2) {
  // sizes are set in resize
  const background = rectangle2D(0, 0);
  const frame = new RectangleOutlined(Shape2DTransform.init(), 0, 0, 0);
  const circle = circle2D(0, 128);
  const rectangle = rectangle2D(0, 0);

  const shapes: PosterShape[] = [
    { shape: background, color: PASTEL_BASE },
    { shape: frame, foreground: PANTONE_BLACK },
    { shape: rectangle, color: PASTEL_ACCENT, foreground: PANTONE_BLACK },
    {
      shape: circle,
      color: PASTEL_BALL,
      foreground: PANTONE_BLACK,
    },
  ];

  function resize(resolution: Vec2) {
    const minSide = Math.min(resolution.x, resolution.y);
    const center = resolution.divide(2);

    background.setSize(resolution).updateBuffers();
    background.transform.setCenter(center);

    frame.outlineWidth = minSide * FRAME_WIDTH;
    frame.setSize(getFrameSize(resolution)).updateBuffers();
    frame.transform.setCenter(center);

    circle.radius = minSide * CIRCLE_RADIUS;
    circle.updateBuffers();
    circle.transform.setCenter(center);

    rectangle
      .setSize(new Vec2(RECTANGLE_SIZE).multiply(minSide))
      .updateBuffers();
    rectangle.transform.setCenter(getRectangleCenter(resolution));
  }

  resize(resolution);
  return { shapes, resize };
}

function getFrameSize(resolution: Vec2): Vec2Array {
  const margin = Math.min(resolution.x, resolution.y) * FRAME_MARGIN * 2;
  return [resolution.x - margin, resolution.y - margin];
}

function getRectangleCenter(resolution: Vec2) {
  return resolution.divide(2).add(new Vec2(RECTANGLE_OFFSET));
}
