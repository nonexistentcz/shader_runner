import { GL2Wrapper, GLProgram, GLShader } from "../../gl";
import { GLShape } from "../../render";
import { Shape2DTransform } from "../../render/shape2d";
import { Shape3DTransform } from "../../render/shape3d";
import { Shape2D, Shape3D, ShapeTransform } from "../../render/types";
import { Vec2 } from "../../utils";
import Matrix3x3 from "../../utils/matrix/matrix3x3";
import Matrix4x4 from "../../utils/matrix/matrix4x4";
import { GLRunnerProgram } from "./gl-runner-program";
import { GLRunnerProgramBuilder } from "./gl-runner-program-builder";

export type GLRunnerBeforeShapeDraw<
  TShape,
  TMatrix,
  TTransform extends ShapeTransform<TMatrix>,
> = (shape: TShape, glShape: GLShape<TMatrix, TTransform>) => void;
export type GLRunnerBeforeDraw = (time: number) => void;
export type GLRegisterFunction = (program: GLProgram) => void;

export type GLRunnerShaderGetter = (gl: GL2Wrapper) => Promise<GLShader>;
export type GLShapeGetter<
  TShape,
  TMatrix,
  TTransform extends ShapeTransform<TMatrix>,
> = (shape: TShape) => GLShape<TMatrix, TTransform>;

export type BuilderFunction<
  TShape,
  TMatrix,
  TTransform extends ShapeTransform<TMatrix>,
> = (
  builder: GLRunnerProgramBuilder<
    GLShape<TMatrix, TTransform>,
    TMatrix,
    TTransform
  >,
) => GLRunnerProgramBuilder<TShape, TMatrix, TTransform>;

export type GLUIEventHandler = (coords: Vec2, e: UIEvent) => unknown;

export type GLMouseCoords = { clip: Vec2; screen: Vec2 };
export type GLUIMouseEventHandler = (
  coords: GLMouseCoords,
  e: UIEvent,
) => unknown;

export type GLRunnerProgram3D<TShape = Shape3D> = GLRunnerProgram<
  TShape,
  Matrix4x4,
  Shape3DTransform
>;

export type GLRunnerProgram2D<TShape = Shape2D> = GLRunnerProgram<
  TShape,
  Matrix3x3,
  Shape2DTransform
>;

export type GLRunnerShape3D<TProps> = TProps & {
  shape: Shape3D;
};

export type GLRunnerShape2D<TProps> = TProps & {
  shape: Shape2D;
};
