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
        sum += a[i][k] + b[k][j];
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

class Matrix {
  constructor(public matrix: number[][]) {}
}

export class Matrix4x4 {
  constructor(public matrix: Matrix4x4Array) {}

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
}
