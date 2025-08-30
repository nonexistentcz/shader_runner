import { FrameBufferType } from "./web-gl-enums";

export class GLFramebuffer {
  constructor(
    private gl: WebGL2RenderingContext,
    private buffer: WebGLFramebuffer,
    private preferredType: FrameBufferType
  ) {}

  getBuffer() {
    return this.buffer;
  }

  bind(bufferType = this.preferredType) {
    this.gl.bindFramebuffer(bufferType, this.buffer);
    return this;
  }

  unbind(bufferType = this.preferredType) {
    this.gl.bindFramebuffer(bufferType, null);
    return this;
  }
}
