import { GLBuffer } from "../gl";
import Matrix3x3 from "../utils/matrix/matrix3x3";
import Matrix4x4 from "../utils/matrix/matrix4x4";
import { GLShape } from "./shape";
import { Shape2DTransform } from "./shape2d";
import { Shape3DTransform } from "./shape3d";

export enum DrawType {
  Points = WebGL2RenderingContext.POINTS,
  LineStrip = WebGL2RenderingContext.LINE_STRIP,
  LineLoop = WebGL2RenderingContext.LINE_LOOP,
  Lines = WebGL2RenderingContext.LINES,
  TriangleStrip = WebGL2RenderingContext.TRIANGLE_STRIP,
  TriangleFan = WebGL2RenderingContext.TRIANGLE_FAN,
  Triangles = WebGL2RenderingContext.TRIANGLES,
}

export interface ShapeTransform<TMatrix> {
  getMatrix(): TMatrix;
}

export interface Shape<TMatrix, TTransform extends ShapeTransform<TMatrix>> {
  transform: TTransform;
  drawType: DrawType;

  get vertexCount(): number;
  get vertexBuffer(): GLBuffer | undefined;
  get indexBuffer(): GLBuffer | undefined;

  getVertexData(): number[];
}

export type Shape2D = GLShape<Matrix3x3, Shape2DTransform>;
export type Shape3D = GLShape<Matrix4x4, Shape3DTransform>;
