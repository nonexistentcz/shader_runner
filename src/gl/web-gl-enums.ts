const CTX = WebGL2RenderingContext;

export enum ClearBuffer {
  Color = CTX.COLOR_BUFFER_BIT,
  Stencil = CTX.STENCIL_BUFFER_BIT,
  Depth = CTX.DEPTH_BUFFER_BIT,
}

export enum ShaderType {
  Fragment = CTX.FRAGMENT_SHADER,
  Vertex = CTX.VERTEX_SHADER,
}

export enum EnableFlags {
  Blend = CTX.BLEND,
  CullFace = CTX.CULL_FACE,
  DepthTest = CTX.DEPTH_TEST,
  Dither = CTX.DITHER,
  PolygonOffsetFill = CTX.POLYGON_OFFSET_FILL,
  SampleAlphaToCoverage = CTX.SAMPLE_ALPHA_TO_COVERAGE,
  SampleCoverage = CTX.SAMPLE_COVERAGE,
  ScissorTest = CTX.SCISSOR_TEST,
  StencilTest = CTX.STENCIL_TEST,
}

export enum BufferType {
  ElementArray = CTX.ELEMENT_ARRAY_BUFFER,
  Index = CTX.ELEMENT_ARRAY_BUFFER,
  Array = CTX.ARRAY_BUFFER,
  Vertex = CTX.ARRAY_BUFFER,
}

export enum FrameBufferType {
  FrameBuffer = CTX.FRAMEBUFFER,
  DrawFrameBuffer = CTX.DRAW_FRAMEBUFFER,
}
