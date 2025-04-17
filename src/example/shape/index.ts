import { outline } from "../../shapes";
import { Runner } from "../runner";

const runner = new Runner();
const shape = outline([], false);

export async function initOutline() {
  runner.init();
  runner.useShape(shape);
}
