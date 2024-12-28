export class GLShader {
  constructor(
    private gl: WebGL2RenderingContext,
    private shader: WebGLShader
  ) {}

  getShader() {
    return this.shader;
  }

  setSource(source: string) {
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
