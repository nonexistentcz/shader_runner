import { Runner } from "./runner";

const runner = new Runner();
async function init() {
  await runner.init();
  const canvas = runner.getCanvas();
  canvas.el.tabIndex = 1;
  canvas.el.addEventListener("keypress", (ev) => {
    console.log("click");
  });
  main();
}

function draw(time = 0) {
  runner.clear(time);
  runner.draw();
}

function main(time = 0) {
  draw(time);
  requestAnimationFrame(main);
}

init();
