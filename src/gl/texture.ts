import { TextureType } from "./web-gl-enums";

export class GLTexture {
  constructor(
    private gl: WebGL2RenderingContext,
    private buffer: WebGLFramebuffer,
    private textureType: TextureType
  ) {}

  getBuffer() {
    return this.buffer;
  }

  bind(textureType = this.textureType) {
    this.gl.bindTexture(textureType, this.buffer);
    return this;
  }

  unbind(textureType = this.textureType) {
    this.gl.bindTexture(textureType, null);
    return this;
  }
}
