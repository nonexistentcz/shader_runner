import { Vec4Array } from "./vector";

type Matrix4x4Array = [Vec4Array, Vec4Array, Vec4Array, Vec4Array];

export function transpose(matrix: Matrix4x4Array) {
  return Array.from({ length: matrix[0].length }, (_, i) =>
    Array.from({ length: matrix.length }, (_, j) => matrix[j][i])
  ) as Matrix4x4Array;
}

export function multiply(a: number[][], b: number[][]) {
  if (a[0].length !== b.length) {
    throw new Error("cannot multiply matricies where n1 != m2");
  }
  return Array.from({ length: a.length }, (_, i) =>
    Array.from({ length: b[0].length }, (_, j) => {
      let sum = 0;
      for (let k = 0; k < a[0].length; k++) {
        sum += a[i][k] * b[k][j];
      }
      return sum;
    })
  );
}

export function unitMatrix(m: number, n: number) {
  return Array.from({ length: m }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  );
}

export function rotateX(angle: number): Matrix4x4Array {
  // prettier-ignore
  return [
    [1, 0, 0, 0],
    [0, Math.cos(angle), -Math.sin(angle), 0],
    [0, Math.sin(angle),  Math.cos(angle), 0],
    [0, 0, 0, 1],
  ];
}

export function rotateY(angle: number): Matrix4x4Array {
  // prettier-ignore
  return [
    [ Math.cos(angle), 0, Math.sin(angle), 0],
    [0, 1, 0, 0],
    [-Math.sin(angle), 0, Math.cos(angle), 0],
    [0, 0, 0, 1],
  ];
}

export function rotateZ(angle: number): Matrix4x4Array {
  // prettier-ignore
  return [
    [Math.cos(angle), -Math.sin(angle), 0, 0],
    [Math.sin(angle),  Math.cos(angle), 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
}

export function rotateXYZ(x: number, y: number, z: number): Matrix4x4Array {
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

export function translateXYZ(x: number, y: number, z: number): Matrix4x4Array {
  // prettier-ignore
  return [
    [1, 0, 0, x],
    [0, 1, 0, y],
    [0, 0, 1, z],
    [0, 0, 0, 1]
  ];
}

class Matrix {
  constructor(public matrix: number[][]) {}
}

export class Matrix4x4 {
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

  transpose() {
    this.matrix = transpose(this.matrix);
    return this;
  }

  toTransposed() {
    return new Matrix4x4(transpose(this.matrix));
  }

  multiply(other: Matrix4x4 | Matrix4x4Array) {
    if (other instanceof Matrix4x4) {
      this.matrix = multiply(this.matrix, other.matrix) as Matrix4x4Array;
    } else {
      this.matrix = multiply(this.matrix, other) as Matrix4x4Array;
    }
    return this;
  }

  toMultiplied(other: Matrix4x4 | Matrix4x4Array) {
    if (other instanceof Matrix4x4) {
      return new Matrix4x4(
        multiply(this.matrix, other.matrix) as Matrix4x4Array
      );
    }
    return new Matrix4x4(multiply(this.matrix, other) as Matrix4x4Array);
  }

  rotate(x: number, y: number, z: number) {
    return this.multiply(rotateXYZ(x, y, z));
  }

  toRotated(x: number, y: number, z: number) {
    return new Matrix4x4(
      multiply(this.matrix, rotateXYZ(x, y, z)) as Matrix4x4Array
    );
  }

  translate(x: number, y: number, z: number) {
    return this.multiply(translateXYZ(x, y, z));
  }

  toTranslated(x: number, y: number, z: number) {
    return new Matrix4x4(
      multiply(this.matrix, translateXYZ(x, y, z)) as Matrix4x4Array
    );
  }

  toFlat() {
    return this.matrix.flat();
  }
}
