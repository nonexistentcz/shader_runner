import { Matrix3x3Array, Matrix4x4Array } from "./types";

export function multiply(a: Matrix3x3Array, b: Matrix3x3Array): Matrix3x3Array;
export function multiply(a: Matrix4x4Array, b: Matrix4x4Array): Matrix4x4Array;
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

export function transpose(matrix: Matrix3x3Array): Matrix3x3Array;
export function transpose(matrix: Matrix4x4Array): Matrix4x4Array;
export function transpose(matrix: number[][]) {
  return Array.from({ length: matrix[0].length }, (_, i) =>
    Array.from({ length: matrix.length }, (_, j) => matrix[j][i])
  );
}
