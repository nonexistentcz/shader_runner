import { GLShaderSource } from "./shaderSource";

export class GLShader {
  constructor(
    private gl: WebGL2RenderingContext,
    private shader: WebGLShader
  ) {}

  getShader() {
    return this.shader;
  }

  async fetchSource(path: string) {
    const res = await fetch(path);
    if (!res.ok || !res.body) throw "failed fetching shader source";
    return this.setSource(await res.text());
  }

  setSource(
    source: string,
    transformFn?: (source: GLShaderSource) => GLShaderSource
  ): this {
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

  delete() {
    this.gl.deleteShader(this.shader);
  }
}
