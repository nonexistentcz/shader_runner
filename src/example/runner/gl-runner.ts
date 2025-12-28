import { getCanvas, GLCanvas, uniform4x4 } from "../../gl";
import { GL2Wrapper } from "../../gl/wrapper";
import { vec2, Vec2, Vec4Array } from "../../utils/vector";
import { FramebufferTarget, TextureTarget } from "../../gl/web-gl-enums";
import { uniform2fv } from "../../gl";
import { Matrix4x4 } from "../../utils";
import { GLRunnerProgramBuilder } from "./gl-runner-program-builder";
import { BuilderFunction, GLUIEventHandler } from "./types";

export function toClipCoords(vec: Vec2) {
  return new Vec2([vec.x * 2 - 1, vec.y * 2 - 1]);
}

export class GLRunner {
  private gl: GL2Wrapper;
  private canvas: GLCanvas;
  private _resolution = vec2([0, 0]);
  private _mouse = vec2([0, 0]);
  private mouseMoveHandlers: GLUIEventHandler[] = [];
  private onResizeHandlers: GLUIEventHandler[] = [];

  constructor(canvasId?: string) {
    this.canvas = getCanvas(canvasId);
    this.gl = this.canvas.getGl();
    this._initListeners();
  }

  get resolution() {
    return this._resolution;
  }

  get mouse() {
    return this._mouse;
  }

  getCanvas() {
    return this.canvas;
  }

  prepareFramebuffer(framebufferTarget = FramebufferTarget.FrameBuffer) {
    return this.gl.createFramebuffer(framebufferTarget);
  }

  onMouseMove(fn: GLUIEventHandler) {
    this.mouseMoveHandlers.push(fn);
    return this;
  }

  onResize(fn: GLUIEventHandler) {
    this.onResizeHandlers.push(fn);
    return this;
  }

  adjustSizeAndViewport() {
    this.canvas.adjustSizeAndViewport();
    this._resolution = vec2([this.canvas.el.width, this.canvas.el.height]);
    return this;
  }

  createProgram<TShape>(buildProgram: BuilderFunction<TShape>) {
    return buildProgram(GLRunnerProgramBuilder.create()).build(this.gl);
  }

  createTexture(textureType: TextureTarget) {
    return this.gl.createTexture(textureType);
  }

  private _initListeners() {
    this.canvas.onResize((e) => {
      this.adjustSizeAndViewport();
      this.onResizeHandlers.forEach((handler) => handler(this._resolution, e));
    });

    this.canvas.el.addEventListener("mousemove", (e) => {
      const res = this._resolution;
      const uv = new Vec2([e.x, e.y]).divideElements(res);
      const coords = toClipCoords(new Vec2([uv.x, 1 - uv.y]));
      const aspectRatio = res.x / res.y;
      const mouseCoords = new Vec2([coords.x * aspectRatio, coords.y]).divide(
        0.9
      );
      this._mouse = mouseCoords;
      this.mouseMoveHandlers.forEach((handler) => handler(mouseCoords, e));
    });
    return this;
  }

  createRunnerProgram<TShape>(buildProgram: BuilderFunction<TShape>) {
    this.adjustSizeAndViewport();
    const uResolution = uniform2fv("u_Resolution", this._resolution.get());
    const uTransform = uniform4x4("u_Transform", Matrix4x4.unit());
    const uMouse = uniform2fv("u_Mouse", [0, 0]);

    const program = this.createProgram<TShape>((builder) =>
      buildProgram(builder)
        .uniform(uResolution)
        .uniform(uMouse)
        .uniform(uTransform)
        .useBeforeShapeDraw((_, s) => uTransform.update(Matrix4x4.fromShape(s)))
    );

    this.onResize((resolution) => uResolution.update(resolution.get()));
    this.onMouseMove((mouseCoords) => uMouse.update(mouseCoords.get()));

    return program;
  }

  setClearColor(color: Vec4Array) {
    this.gl.setClearColor(color);
    return this;
  }

  clear() {
    this.gl.clear();
    return this;
  }
}
