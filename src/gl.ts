import { ClearBuffer } from "./enums";
import { Vec4Array } from "./utils/vector";

export class GL2 {
  public gl: WebGL2RenderingContext;
  private program?: WebGLProgram;

  constructor(canvas: HTMLCanvasElement) {
    const context = canvas.getContext("webgl2");
    if (!context) throw new Error("could not get webgl2 context");
    this.gl = context;
  }

  createProgram() {}

  setClearColor([r, g, b, a]: Vec4Array) {
    this.gl.clearColor(r, g, b, a);
    return this;
  }

  public clear(buffer: ClearBuffer | number = ClearBuffer.Color) {
    this.gl.clear(buffer);
    return this;
  }
}
