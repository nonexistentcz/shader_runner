import { GL2Wrapper, GLProgram, GLShader } from "../../gl";
import { GLShape } from "../../render";
import { Vec2 } from "../../utils";
import { GLRunnerProgramBuilder } from "./gl-runner-program-builder";

export type GLRunnerBeforeShapeDraw<TShape> = (
  shape: TShape,
  glShape: GLShape
) => void;
export type GLRunnerBeforeDraw = (time: number) => void;
export type GLRegisterFunction = (program: GLProgram) => void;

export type GLRunnerShaderGetter = (gl: GL2Wrapper) => Promise<GLShader>;
export type GLShapeGetter<TShape> = (shape: TShape) => GLShape;

export type BuilderFunction<TShape> = (
  builder: GLRunnerProgramBuilder<GLShape>
) => GLRunnerProgramBuilder<TShape>;

export type GLUIEventHandler = (coords: Vec2, e: UIEvent) => unknown;

export type GLRunnerShape<TProps> = TProps & {
  shape: GLShape;
};
