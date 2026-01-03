import { vec2, Vec2Union, Vec3, vec3, Vec3Union } from "../utils";
import Matrix4x4 from "../utils/matrix/matrix4x4";
import {
  Circle,
  Line,
  Outline,
  Polygon,
  Rectangle,
  RectangleOutlined,
  Ring,
} from "./shape";
import { ShapeTransform } from "./types";

export class Shape3DTransform implements ShapeTransform<Matrix4x4> {
  constructor(public center: Vec3, public rotation: Vec3) {}
  getMatrix() {
    return Matrix4x4.unit()
      .rotate(...this.rotation.get())
      .translate(...this.center.get());
  }

  static init() {
    return new Shape3DTransform(vec3([0, 0, 0]), vec3([0, 0, 0]));
  }

  setCenter(center: Vec3Union) {
    vec3(center);
  }
}

export function rectangle3D(
  width: number,
  height: number,
  outlineWidth?: number
): Rectangle<Matrix4x4, Shape3DTransform> {
  if (outlineWidth) {
    return new RectangleOutlined(
      Shape3DTransform.init(),
      width,
      height,
      outlineWidth
    );
  }
  return new Rectangle(Shape3DTransform.init(), width, height);
}

export function circle3D(
  radius: number,
  precision: number
): Circle<Matrix4x4, Shape3DTransform> {
  return new Circle(Shape3DTransform.init(), radius, 2 * Math.PI, precision);
}

export function ring3D(
  radius: number,
  radiusInner: number,
  precision: number
): Ring<Matrix4x4, Shape3DTransform> {
  return new Ring(
    Shape3DTransform.init(),
    radius,
    radiusInner,
    2 * Math.PI,
    precision
  );
}

export function line3D(
  x1: Vec2Union,
  x2: Vec2Union,
  width: number
): Line<Matrix4x4, Shape3DTransform> {
  return new Line(Shape3DTransform.init(), vec2(x1), vec2(x2), width);
}

export function polygon3D(
  vertices: Vec2Union[],
  loopEnd = false
): Polygon<Matrix4x4, Shape3DTransform> {
  return new Polygon(Shape3DTransform.init(), vertices, loopEnd);
}

export function outline3D(
  vertices: Vec2Union[],
  width: number,
  loopEnd: boolean
): Outline<Matrix4x4, Shape3DTransform> {
  return new Outline(Shape3DTransform.init(), vertices, width, loopEnd);
}
