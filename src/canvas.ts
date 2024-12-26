import { debounce } from "./utils/debounce";
import { GL2 } from "./gl";

export const defaultId = "opengl-runner";

export class Canvas {
  private static instance: Canvas | null = null;
  constructor(public el: HTMLCanvasElement) {
    if (Canvas.instance) {
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
    Canvas.instance = new Canvas(canvas);
    return Canvas.instance;
  }

  static getInstance(id: string) {
    return Canvas.instance ?? Canvas.init(id);
  }

  onResize(fn: (canvas: HTMLCanvasElement) => void, debounced = true) {
    const listener = () => fn(this.el);
    window.addEventListener(
      "resize",
      debounced ? debounce(listener) : listener
    );
    return this;
  }

  getGl() {
    return new GL2(this.el);
  }
}

export function getCanvas(id = defaultId) {
  return Canvas.getInstance(id);
}
