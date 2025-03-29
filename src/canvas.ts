import { debounce } from "./utils/debounce";
import { GL2 } from "./gl";

export const defaultId = "opengl-runner";
function getCanvasElement(id: string) {
  const existing = document.getElementById(id);
  if (existing) {
    if (existing instanceof HTMLCanvasElement) return existing;
    throw new Error(`the element with the id: "${id}" is not of type canvas`);
  }
  const canvas = document.createElement("canvas");
  canvas.id = id;
  document.body.appendChild(canvas);
  return canvas;
}

export class GLCanvas {
  private static instance: GLCanvas | null = null;
  private constructor(private _el: HTMLCanvasElement) {
    if (GLCanvas.instance) {
      throw new Error("canvas can only be instantiated once");
    }
  }

  get el() {
    return this._el;
  }

  private static init(id: string) {
    const canvas = getCanvasElement(id);
    // TODO: remove
    canvas.style.width = "100dvw";
    canvas.style.height = "100dvh";
    canvas.style.display = "block";
    GLCanvas.instance = new GLCanvas(canvas).adjustSizeAndViewport();
    return GLCanvas.instance;
  }

  static getInstance(id: string) {
    return GLCanvas.instance ?? GLCanvas.init(id);
  }

  adjustSizeAndViewport() {
    const { _el: canvas } = this;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    this.getGl().viewportFromCanvas();
    return this;
  }

  draw(subject: any) {
    throw new Error("Not implemented");
  }

  onResize(fn: (ev: UIEvent, canvas: this) => void, debounced = true) {
    const listener = (ev: UIEvent) => fn(ev, this);
    window.addEventListener(
      "resize",
      debounced ? debounce(listener) : listener
    );
    return this;
  }

  getGl() {
    return GL2.getInstance(this._el);
  }
}

export function getCanvas(id = defaultId) {
  return GLCanvas.getInstance(id);
}
