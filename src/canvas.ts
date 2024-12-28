import { debounce } from "./utils/debounce";
import { GL2 } from "./gl";

export const defaultId = "opengl-runner";

export class GLCanvas {
  private static instance: GLCanvas | null = null;
  get el() {
    return this._el;
  }
  constructor(private _el: HTMLCanvasElement) {
    if (GLCanvas.instance) {
      throw new Error("canvas can only be instantiated once");
    }
  }

  private static init(id: string) {
    const canvas = document.createElement("canvas");
    canvas.id = id;
    document.body.appendChild(canvas);
    canvas.style.width = "100dvw";
    canvas.style.height = "100dvh";
    canvas.style.display = "block";
    GLCanvas.instance = new GLCanvas(canvas);
    return GLCanvas.instance;
  }

  static getInstance(id: string) {
    return GLCanvas.instance ?? GLCanvas.init(id);
  }

  onResize(fn: (canvas: this) => void, debounced = true) {
    const listener = () => fn(this);
    window.addEventListener(
      "resize",
      debounced ? debounce(listener) : listener
    );
    return this;
  }

  getGl() {
    return new GL2(this._el);
  }
}

export function getCanvas(id = defaultId) {
  return GLCanvas.getInstance(id);
}
