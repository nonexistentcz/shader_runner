const CTX = WebGL2RenderingContext;

export enum ClearBuffer {
  Color = CTX.COLOR_BUFFER_BIT,
  Stencil = CTX.STENCIL_BUFFER_BIT,
  Depth = CTX.DEPTH_BUFFER_BIT,
}
