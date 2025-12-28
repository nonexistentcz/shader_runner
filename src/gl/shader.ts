import { ShaderType } from ".";
import { GLShaderSource } from "../transformer";

type TransformFn = (source: GLShaderSource) => GLShaderSource;

export class GLShader {
  constructor(
    private gl: WebGL2RenderingContext,
    private shader: WebGLShader,
    private type: ShaderType
  ) {}

  delete() {
    this.gl.deleteShader(this.shader);
  }

  getShader() {
    return this.shader;
  }

  getType() {
    return this.type;
  }

  async fetchSource(path: string, transformFn?: TransformFn) {
    const res = await fetch(path);
    if (!res.ok) throw "failed fetching shader source";
    return this.setSource(await res.text(), transformFn);
  }

  setSource(source: string, transformFn?: TransformFn): this {
    if (transformFn) {
      const sourceObj = new GLShaderSource();
      this.gl.shaderSource(this.shader, transformFn(sourceObj).resolve(source));
      return this;
    }
    this.gl.shaderSource(this.shader, source);
    return this;
  }

  compile() {
    const { gl, shader } = this;
    gl.compileShader(this.shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
      throw gl.getShaderInfoLog(shader);
    }
    return this;
  }
}
