import { ShaderType } from "./enums";
import { GLShader } from "./shader";
import { GLUniform, GLUniformValue } from "./uniform";

export class GLProgram {
  private fragmentShader: GLShader | null = null;
  private vertexShader: GLShader | null = null;

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

  getAttribLocation(name: string) {
    return new AttribLocation(
      this.gl,
      this.gl.getAttribLocation(this.program, name)
    );
  }

  private assignShader(shaderType: ShaderType, value: GLShader | null) {
    if (shaderType === ShaderType.Fragment) {
      this.fragmentShader = value;
      return;
    }
    if (shaderType === ShaderType.Vertex) {
      this.vertexShader = value;
      return;
    }
  }

  getShaderByType(shaderType: ShaderType) {
    if (shaderType === ShaderType.Fragment) return this.fragmentShader;
    if (shaderType === ShaderType.Vertex) return this.vertexShader;
  }

  detachShader(shader: GLShader) {
    this.gl.detachShader(this.program, shader.getShader());
    this.assignShader(shader.getType(), null);
    return this;
  }

  attachShader(shader: GLShader) {
    this.gl.attachShader(this.program, shader.getShader());
    this.assignShader(shader.getType(), shader);
    return this;
  }

  attachNewShader(shader: GLShader) {
    const attachedShader = this.getShaderByType(shader.getType());
    if (attachedShader) this.detachShader(attachedShader);
    this.attachShader(shader);
    return this;
  }

  useUniform<T>(uniform: GLUniformValue<T>) {
    return new GLUniform(this.gl, this.program, uniform);
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
    return this;
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
