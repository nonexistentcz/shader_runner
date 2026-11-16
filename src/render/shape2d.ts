import { vec2, Vec2, Vec2Union } from "../utils";
import Matrix3x3 from "../utils/matrix/matrix3x3";
import {
  Rectangle,
  RectangleOutlined,
  Circle,
  Ring,
  Line,
  Polygon,
  Outline,
} from "./shape";
import { ShapeTransform } from "./types";

type InitOptions = {
  center?: Vec2Union;
  angle?: number;
};

export class Shape2DTransform implements ShapeTransform<Matrix3x3> {
  constructor(public center: Vec2, public angle: number) {}
  getMatrix() {
    return Matrix3x3.unit()
      .translate(...this.center.get())
      .rotate(this.angle);
  }

  static init(options: InitOptions = {}) {
    return new Shape2DTransform(
      vec2(options.center ?? [0, 0]),
      options.angle ?? 0
    );
  }

  setCenter(center: Vec2Union) {
    this.center = vec2(center);
    return this;
  }
}

export function rectangle2D(
  width: number,
  height: number,
  outlineWidth?: number,
  transform = Shape2DTransform.init()
): Rectangle<Matrix3x3, Shape2DTransform> {
  if (outlineWidth) {
    return new RectangleOutlined(transform, width, height, outlineWidth);
  }
  return new Rectangle(transform, width, height);
}

export function circle2D(
  radius: number,
  precision: number,
  transform = Shape2DTransform.init()
): Circle<Matrix3x3, Shape2DTransform> {
  return new Circle(transform, radius, 2 * Math.PI, precision);
}

export function ring2D(
  radius: number,
  radiusInner: number,
  precision: number,
  transform = Shape2DTransform.init()
): Ring<Matrix3x3, Shape2DTransform> {
  return new Ring(transform, radius, radiusInner, 2 * Math.PI, precision);
}

export function line2D(
  x1: Vec2Union,
  x2: Vec2Union,
  width: number,
  transform = Shape2DTransform.init()
): Line<Matrix3x3, Shape2DTransform> {
  return new Line(transform, vec2(x1), vec2(x2), width);
}

export function polygon2D(
  vertices: Vec2Union[],
  transform = Shape2DTransform.init(),
  loopEnd = false
): Polygon<Matrix3x3, Shape2DTransform> {
  return new Polygon(transform, vertices, loopEnd);
}

export function outline2D(
  vertices: Vec2Union[],
  width: number,
  loopEnd: boolean,
  transform = Shape2DTransform.init()
): Outline<Matrix3x3, Shape2DTransform> {
  return new Outline(transform, vertices, width, loopEnd);
}
