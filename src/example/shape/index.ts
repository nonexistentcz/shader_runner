import { outline } from "../../render/shapes";
import { Runner } from "../runner";

const runner = new Runner();
const shape = outline([], false);

export async function initOutline() {
  runner.init();
  runner.useShape(shape);
}
