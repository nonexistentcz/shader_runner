import { GLShape } from "../../render";
import { Shape3D } from "../../render/types";
import { Matrix4x4Array, Matrix4x4Union } from "./types";
import { multiply, transpose } from "./utils";

function rotateX(angle: number): Matrix4x4Array {
  // prettier-ignore
  return [
    [1, 0, 0, 0],
    [0, Math.cos(angle), -Math.sin(angle), 0],
    [0, Math.sin(angle),  Math.cos(angle), 0],
    [0, 0, 0, 1],
  ];
}

function rotateY(angle: number): Matrix4x4Array {
  // prettier-ignore
  return [
    [ Math.cos(angle), 0, Math.sin(angle), 0],
    [0, 1, 0, 0],
    [-Math.sin(angle), 0, Math.cos(angle), 0],
    [0, 0, 0, 1],
  ];
}

function rotateZ(angle: number): Matrix4x4Array {
  // prettier-ignore
  return [
    [Math.cos(angle), -Math.sin(angle), 0, 0],
    [Math.sin(angle),  Math.cos(angle), 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
}

function rotateXYZ(x: number, y: number, z: number): Matrix4x4Array {
  const cx = Math.cos(x);
  const sx = Math.sin(x);
  const cy = Math.cos(y);
  const sy = Math.sin(y);
  const cz = Math.cos(z);
  const sz = Math.sin(z);

  // Combined rotation matrix in ZYX order: R = Rx * Ry * Rz
  // prettier-ignore
  return [
    [ cy * cz,                               -cy * sz,       sy, 0],
    [ sx * sy * cz + cx * sz, -sx * sy * sz + cx * cz, -sx * cy, 0],
    [-cx * sy * cz + sx * sz,  cx * sy * sz + sx * cz,  cx * cy, 0],
    [0, 0, 0, 1],
  ];
}

function translateXYZ(x: number, y: number, z: number): Matrix4x4Array {
  // prettier-ignore
  return [
    [1, 0, 0, x],
    [0, 1, 0, y],
    [0, 0, 1, z],
    [0, 0, 0, 1]
  ];
}

export default class Matrix4x4 {
  constructor(public matrix: Matrix4x4Array) {}

  static unit() {
    return new Matrix4x4([
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ]);
  }

  static rotation(x: number, y: number, z: number) {
    return new Matrix4x4(rotateXYZ(x, y, z));
  }

  static translated(x: number, y: number, z: number) {
    return new Matrix4x4(translateXYZ(x, y, z));
  }

  static fromShape3D(shape: Shape3D) {
    return Matrix4x4.rotation(...shape.transform.rotation.get()).translate(
      ...shape.transform.center.get()
    );
  }

  transpose() {
    this.matrix = transpose(this.matrix);
    return this;
  }

  toTransposed() {
    return new Matrix4x4(transpose(this.matrix));
  }

  multiply(other: Matrix4x4Union) {
    this.matrix = multiply(this.matrix, getMatrix4x4Array(other));
    return this;
  }

  toMultiplied(other: Matrix4x4 | Matrix4x4Array) {
    return new Matrix4x4(multiply(this.matrix, getMatrix4x4Array(other)));
  }

  rotate(x: number, y: number, z: number) {
    return this.multiply(rotateXYZ(x, y, z));
  }

  rotateX(angle: number) {
    return this.multiply(rotateX(angle));
  }

  rotateY(angle: number) {
    return this.multiply(rotateY(angle));
  }

  rotateZ(angle: number) {
    return this.multiply(rotateZ(angle));
  }

  toRotated(x: number, y: number, z: number) {
    return new Matrix4x4(multiply(this.matrix, rotateXYZ(x, y, z)));
  }

  translate(x: number, y: number, z: number) {
    return this.multiply(translateXYZ(x, y, z));
  }

  toTranslated(x: number, y: number, z: number) {
    return new Matrix4x4(multiply(this.matrix, translateXYZ(x, y, z)));
  }

  toFlat() {
    return this.matrix.flat();
  }
}

export function matrix4x4(matrix: Matrix4x4Union) {
  if (matrix instanceof Matrix4x4) return matrix;
  return new Matrix4x4(matrix);
}

export function getMatrix4x4Array(matrix: Matrix4x4Union) {
  if (matrix instanceof Matrix4x4) return matrix.matrix;
  return matrix;
}
