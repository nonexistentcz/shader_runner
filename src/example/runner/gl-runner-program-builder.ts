import { GL2Wrapper, GLUniformValue, ShaderType, uniform1f } from "../../gl";
import { GLShape } from "../../render";
import { GLRunnerProgram } from "./gl-runner-program";
import {
  GLRegisterFunction,
  GLRunnerBeforeDraw,
  GLRunnerBeforeShapeDraw,
  GLRunnerShaderGetter,
  GLShapeGetter,
} from "./types";

function getFragDefault(gl: GL2Wrapper) {
  return gl.createShader(ShaderType.Fragment).fetchSource("/shader/main.frag");
}

function getVertDefault(gl: GL2Wrapper) {
  return gl.createShader(ShaderType.Vertex).fetchSource("/shader/main.vert");
}

export class GLRunnerProgramBuilder<TShape> {
  static create() {
    return new GLRunnerProgramBuilder<GLShape>((shape) => shape);
  }

  private constructor(
    private getShape: GLShapeGetter<TShape>,
    private getFrag: GLRunnerShaderGetter = getFragDefault,
    private getVert: GLRunnerShaderGetter = getVertDefault,
    private beforeDrawFunctions: GLRunnerBeforeDraw[] = [],
    private registerFunctions: GLRegisterFunction[] = [],
    private beforeShapeDrawFunctions: GLRunnerBeforeShapeDraw<TShape>[] = []
  ) {}

  fragment(sourceString: string) {
    this.getFrag = (gl) =>
      Promise.resolve(
        gl.createShader(ShaderType.Fragment).setSource(sourceString)
      );
  }

  vertex(sourceString: string) {
    this.getVert = (gl) =>
      Promise.resolve(
        gl.createShader(ShaderType.Vertex).setSource(sourceString)
      );
  }

  fragmentUrl(url: string) {
    this.getFrag = (gl) =>
      gl.createShader(ShaderType.Fragment).fetchSource(url);
    return this;
  }

  vertexUrl(url: string) {
    this.getVert = (gl) => gl.createShader(ShaderType.Vertex).fetchSource(url);
    return this;
  }

  uniform<TUniform>(uniform: GLUniformValue<TUniform>) {
    this.registerFunctions.push((program) => {
      return program.useUniform(uniform);
    });
    return this;
  }

  useBeforeShapeDraw(beforeDraw: GLRunnerBeforeShapeDraw<TShape>) {
    this.beforeShapeDrawFunctions.push(beforeDraw);
    return this;
  }

  useBeforeDraw(beforeDraw: GLRunnerBeforeDraw) {
    this.beforeDrawFunctions.push(beforeDraw);
    return this;
  }

  useCustomShape<TCustomShape>(getShape: GLShapeGetter<TCustomShape>) {
    if (this.beforeShapeDrawFunctions.length > 0) {
      console.warn(
        "GLRunnerProgramBuilder: beforeShapeDraw functions assigned before shape is defined, the functions will be discarded"
      );
    }

    return new GLRunnerProgramBuilder(
      getShape,
      this.getFrag,
      this.getVert,
      this.beforeDrawFunctions,
      this.registerFunctions
    );
  }

  useTime() {
    const uTime = uniform1f("u_Time", 0);
    this.uniform(uTime);
    return this.useBeforeDraw((time) => uTime.update(time));
  }

  async build(gl: GL2Wrapper) {
    if (!this.getFrag)
      throw new Error("No fragment shader attached when building program");
    if (!this.getVert)
      throw new Error("No fragment shader attached when building program");
    const frag = (await this.getFrag(gl)).compile();
    const vert = (await this.getVert(gl)).compile();

    const program = gl
      .createProgram()
      .attachShader(frag)
      .attachShader(vert)
      .link()
      .validate();

    return new GLRunnerProgram(
      gl,
      program,
      this.getShape,
      this.registerFunctions,
      this.beforeShapeDrawFunctions,
      this.beforeDrawFunctions
    );
  }
}
