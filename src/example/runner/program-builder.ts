import { GL2Wrapper, GLShader, GLUniformValue, ShaderType } from "../../gl";

type ShaderGetter = (gl: GL2Wrapper) => Promise<GLShader>;

function getFragDefault(gl: GL2Wrapper) {
  return gl.createShader(ShaderType.Fragment).fetchSource("/shader/main.frag");
}

function getVertDefault(gl: GL2Wrapper) {
  return gl.createShader(ShaderType.Vertex).fetchSource("/shader/main.vert");
}

export class ProgramBuilder {
  private getFrag: ShaderGetter = getFragDefault;
  private getVert: ShaderGetter = getVertDefault;

  fragmentUrl(url: string) {
    this.getFrag = (gl: GL2Wrapper) =>
      gl.createShader(ShaderType.Fragment).fetchSource(url);
    return this;
  }

  vertexUrl(url: string) {
    this.getFrag = (gl: GL2Wrapper) =>
      gl.createShader(ShaderType.Vertex).fetchSource(url);
    return this;
  }

  async build(gl: GL2Wrapper) {
    if (!this.getFrag)
      throw new Error("No fragment shader attached when building program");
    if (!this.getVert)
      throw new Error("No fragment shader attached when building program");
    const frag = (await this.getFrag(gl)).compile();
    const vert = (await this.getVert(gl)).compile();

    return gl
      .createProgram()
      .attachShader(frag)
      .attachShader(vert)
      .link()
      .validate();
  }
}
