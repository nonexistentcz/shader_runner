import { BufferType } from "./enums";

type SetDataOptions = {
  usage?: GLenum;
  bufferType?: BufferType;
};

export class GLBuffer {
  constructor(
    private gl: WebGL2RenderingContext,
    private buffer: WebGLBuffer,
    private preferredType: BufferType
  ) {}

  getBuffer() {
    return this.buffer;
  }

  bind(bufferType = this.preferredType) {
    this.gl.bindBuffer(bufferType, this.buffer);
    return this;
  }

  unbind(bufferType = this.preferredType) {
    this.gl.bindBuffer(bufferType, null);
    return this;
  }

  setData(
    data: AllowSharedBufferSource | null,
    {
      usage = this.gl.STATIC_DRAW,
      bufferType = this.preferredType,
    }: SetDataOptions = {}
  ) {
    this.gl.bufferData(bufferType, data, usage);
    return this;
  }

  setDataWithBind(
    data: AllowSharedBufferSource | null,
    options?: SetDataOptions
  ) {
    return this.bind(options?.bufferType)
      .setData(data, options)
      .unbind(options?.bufferType);
  }
}
