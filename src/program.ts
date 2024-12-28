import { GLShader } from "./shader";

export class GLProgram {
  getProgram() {
    return this.program;
  }

  constructor(
    private gl: WebGL2RenderingContext,
    private program: WebGLProgram
  ) {}

  link() {
    this.gl.linkProgram(this.program);
    return this;
  }

  validate() {
    const { gl, program } = this;
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
      throw gl.getProgramInfoLog(program);
    }
    return this;
  }

  use() {
    const { gl, program } = this;
    gl.useProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
      gl.deleteProgram(program);
      throw gl.getProgramInfoLog(program);
    }
    return this;
  }

  getAttribLocation(name: string) {
    return new AttribLocation(
      this.gl,
      this.gl.getAttribLocation(this.program, name)
    );
  }

  attachShader(shader: WebGLShader | GLShader) {
    if (shader instanceof GLShader) {
      this.gl.attachShader(this.program, shader.getShader());
    } else {
      this.gl.attachShader(this.program, shader);
    }
    return this;
  }
}

class AttribLocation {
  constructor(public gl: WebGL2RenderingContext, public location: GLint) {}

  enable() {
    this.gl.enableVertexAttribArray(this.location);
    return this;
  }

  disable() {
    this.gl.disableVertexAttribArray(this.location);
  }

  setPointer(
    size: GLint,
    type: GLenum,
    normalized: GLboolean,
    stride: GLsizei,
    offset: GLintptr
  ) {
    this.gl.vertexAttribPointer(
      this.location,
      size,
      type,
      normalized,
      stride,
      offset
    );
    return this;
  }
}
