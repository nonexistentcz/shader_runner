import { Shape2D } from "../../render/types";
import { Matrix3x3Array, Matrix3x3Union } from "./types";
import { multiply, transpose } from "./utils";

function rotate(angle: number): Matrix3x3Array {
  // prettier-ignore
  return [
    [Math.cos(angle), -Math.sin(angle), 0],
    [Math.sin(angle),  Math.cos(angle), 0],
    [              0,                0, 1],
  ];
}

function translate(x: number, y: number): Matrix3x3Array {
  // prettier-ignore
  return [
    [1, 0, x],
    [0, 1, y],
    [0, 0, 1],
  ];
}

export default class Matrix3x3 {
  constructor(public matrix: Matrix3x3Array) {}

  static unit() {
    return new Matrix3x3([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]);
  }

  static rotation(angle: number) {
    return new Matrix3x3(rotate(angle));
  }

  static translated(x: number, y: number) {
    return new Matrix3x3(translate(x, y));
  }

  static fromShape2D(shape: Shape2D) {
    return Matrix3x3.rotation(shape.transform.angle).translate(
      ...shape.transform.center.get()
    );
  }

  transpose() {
    this.matrix = transpose(this.matrix);
    return this;
  }

  toTransposed() {
    return new Matrix3x3(transpose(this.matrix));
  }

  multiply(other: Matrix3x3Union) {
    this.matrix = multiply(this.matrix, getMatrix3x3Array(other));
    return this;
  }

  toMultiplied(other: Matrix3x3Union) {
    return new Matrix3x3(multiply(this.matrix, getMatrix3x3Array(other)));
  }

  rotate(angle: number) {
    return this.multiply(rotate(angle));
  }

  toRotated(angle: number) {
    return new Matrix3x3(multiply(this.matrix, rotate(angle)));
  }

  translate(x: number, y: number) {
    return this.multiply(translate(x, y));
  }

  toTranslated(x: number, y: number) {
    return new Matrix3x3(multiply(this.matrix, translate(x, y)));
  }

  toFlat() {
    return this.matrix.flat();
  }
}

export function matrix3x3(matrix: Matrix3x3Union) {
  if (matrix instanceof Matrix3x3) return matrix;
  return new Matrix3x3(matrix);
}

export function getMatrix3x3Array(matrix: Matrix3x3Union) {
  if (matrix instanceof Matrix3x3) return matrix.matrix;
  return matrix;
}
