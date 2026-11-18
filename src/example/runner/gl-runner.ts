import { getCanvas, GLCanvas, uniform3x3, uniform4x4 } from "../../gl";
import { GL2Wrapper } from "../../gl/wrapper";
import { vec2, Vec2, Vec4Array } from "../../utils/vector";
import { FramebufferTarget, TextureTarget } from "../../gl/web-gl-enums";
import { uniform2fv } from "../../gl";
import { GLRunnerProgramBuilder } from "./gl-runner-program-builder";
import {
  BuilderFunction,
  GLMouseCoords,
  GLUIEventHandler,
  GLUIMouseEventHandler,
} from "./types";
import Matrix4x4 from "../../utils/matrix/matrix4x4";
import { Shape3DTransform } from "../../render/shape3d";
import { ShapeTransform } from "../../render/types";
import Matrix3x3 from "../../utils/matrix/matrix3x3";
import { Shape2DTransform } from "../../render/shape2d";

export function toClipCoords(vec: Vec2) {
  return new Vec2([vec.x * 2 - 1, vec.y * 2 - 1]);
}

export class GLRunner {
  private gl: GL2Wrapper;
  private canvas: GLCanvas;
  private _resolution = vec2([0, 0]);
  private _mouse: GLMouseCoords = { clip: vec2([0, 0]), screen: vec2([0, 0]) };
  private mouseMoveHandlers: GLUIMouseEventHandler[] = [];
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

  onMouseMove(fn: GLUIMouseEventHandler) {
    this.mouseMoveHandlers.push(fn);
    return this;
  }

  onResize(fn: GLUIEventHandler, dryRun?: boolean) {
    if (dryRun) fn(this._resolution, new UIEvent("dry"));
    this.onResizeHandlers.push(fn);
    return this;
  }

  adjustSizeAndViewport() {
    this.canvas.adjustSizeAndViewport();
    this._resolution = vec2([this.canvas.el.width, this.canvas.el.height]);
    return this;
  }

  createProgram<TShape, TMatrix, TTransform extends ShapeTransform<TMatrix>>(
    buildProgram: BuilderFunction<TShape, TMatrix, TTransform>,
  ) {
    return buildProgram(GLRunnerProgramBuilder.create()).build(this.gl);
  }

  createTexture(textureType: TextureTarget) {
    return this.gl.createTexture(textureType);
  }

  setActiveTexture(textureUnit: number) {
    this.gl.setActiveTexture(textureUnit);

    return this;
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
      const clip = new Vec2([coords.x * aspectRatio, coords.y]).divide(0.9);
      const screen = new Vec2([e.x, e.y]);
      this._mouse = { clip, screen };
      this.mouseMoveHandlers.forEach((handler) => handler(this._mouse, e));
    });
    return this;
  }

  createRunnerProgram3D<TShape>(
    buildProgram: BuilderFunction<TShape, Matrix4x4, Shape3DTransform>,
  ) {
    this.adjustSizeAndViewport();
    const uResolution = uniform2fv("u_Resolution", this._resolution.get());
    const uTransform = uniform4x4("u_Transform", Matrix4x4.unit());
    const uMouse = uniform2fv("u_Mouse", [0, 0]);

    const program = this.createProgram<TShape, Matrix4x4, Shape3DTransform>(
      (builder) =>
        buildProgram(builder)
          .uniform(uResolution)
          .uniform(uMouse)
          .uniform(uTransform)
          // updated before drawing, when this program is in use, as gl.uniform*
          // writes to the current program and handlers may fire while another one is
          .useBeforeDraw(() => {
            uResolution.update(this._resolution.get());
            uMouse.update(this._mouse.clip.get());
          })
          .useBeforeShapeDraw((_, s) =>
            uTransform.update(Matrix4x4.fromShape3D(s)),
          ),
    );

    return program;
  }

  createRunnerProgram2D<TShape>(
    buildProgram: BuilderFunction<TShape, Matrix3x3, Shape2DTransform>,
  ) {
    this.adjustSizeAndViewport();
    const uResolution = uniform2fv("u_Resolution", this._resolution.get());
    const uTransform = uniform3x3("u_Transform", Matrix3x3.unit());
    const uMouse = uniform2fv("u_Mouse", [0, 0]);

    const program = this.createProgram<TShape, Matrix3x3, Shape2DTransform>(
      (builder) =>
        buildProgram(builder)
          .vertexUrl("/shader/main2d.vert")
          .uniform(uResolution)
          .uniform(uMouse)
          .uniform(uTransform)
          // see createRunnerProgram3D
          .useBeforeDraw(() => {
            uResolution.update(this._resolution.get());
            uMouse.update(this._mouse.screen.get());
          })
          .useBeforeShapeDraw((_, s) =>
            uTransform.update(Matrix3x3.fromShape2D(s)),
          ),
    );

    return program;
  }

  setClearColor(color: Vec4Array) {
    this.gl.setClearColor(color);
    return this;
  }

  enableAlphaBlending() {
    this.gl.enableAlphaBlending();
    return this;
  }

  clear() {
    this.gl.clear();
    return this;
  }
}
