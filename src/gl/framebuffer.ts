import { GLTexture } from "./texture";
import { FramebufferTarget } from "./web-gl-enums";

const COLOR_ATTACHMENT_LIMIT = 15;

export class GLFramebuffer {
  constructor(
    private gl: WebGL2RenderingContext,
    private buffer: WebGLFramebuffer,
    private target: FramebufferTarget
  ) {}

  getBuffer() {
    return this.buffer;
  }

  getTarget() {
    return this.target;
  }

  bind(bufferType = this.target) {
    this.gl.bindFramebuffer(bufferType, this.buffer);
    return this;
  }

  unbind(bufferType = this.target) {
    this.gl.bindFramebuffer(bufferType, null);
    return this;
  }

  withBind<T>(fn: (buffer: this) => T) {
    this.bind();
    const result = fn(this);
    this.unbind();
    return result;
  }

  async withBindAsync(fn: (buffer: this) => Promise<void>) {
    this.bind();
    const result = await fn(this);
    this.unbind();
    return result;
  }

  delete() {
    this.gl.deleteFramebuffer(this.buffer);
  }

  texture2D(texture: GLTexture, colorAttachment: number, levelOfDepth: number) {
    if (colorAttachment < 0 || colorAttachment > COLOR_ATTACHMENT_LIMIT)
      throw new Error(
        `${colorAttachment} is not a color attachment, if not, update the limits`
      );

    this.gl.framebufferTexture2D(
      this.target,
      // @ts-expect-error this could potentially break in the future
      this.gl[`COLOR_ATTACHMENT${colorAttachment}`],
      texture.getTarget(),
      texture.getTexture(),
      levelOfDepth
    );

    return this;
  }
}
