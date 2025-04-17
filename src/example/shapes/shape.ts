import { ring, rectangle } from "../../shapes";
import { vec2, vec3 } from "../../utils/vector";
import { SHAPE_SIZE, Shape } from ".";

export function createShape() {
  const angle = randomMapped(0, 2 * Math.PI);
  const size = randomMapped(SHAPE_SIZE * 0.6, SHAPE_SIZE * 1.3);
  const speed = randomMapped(size * 0.01, size * 0.1);
  const shape =
    Math.random() < 0.5
      ? ring(
          size,
          randomMapped(size * 0.3, size * 0.9),
          Math.ceil(randomMapped(1, 30))
        )
      : rectangle(size * 2, size * 2);
  return {
    size,
    speed: vec2([Math.sin(angle) * speed, Math.cos(angle) * speed]),
    obj: shape.setCenter(
      vec3([
        randomMapped(-1 + size, 1 - size),
        randomMapped(-1 + size, 1 - size),
        0,
      ])
    ),
  };
}

export function collideBallWall(ball: Shape) {
  const [x, y] = ball.obj.center.get();
  ball.speed = vec2([
    ball.speed.x * (x < -1 + ball.size / 2 || x > 1 - ball.size / 2 ? -1 : 1),
    ball.speed.y * (y < -1 + ball.size / 2 || y > 1 - ball.size / 2 ? -1 : 1),
  ]);
}

function detectCollisionBallBall(a: Shape, b: Shape) {
  return (
    b.obj.center.toVec2().subtract(a.obj.center.toVec2()).magnitude() <
    a.size + b.size
  );
}

export function handleCollisionBallBall(a: Shape, b: Shape) {
  if (!detectCollisionBallBall(a, b)) return;
  const centerA = a.obj.center.toVec2();
  const centerB = b.obj.center.toVec2();
  const diff = centerB.subtract(centerA);
  const normalizedDiffA = diff.normalize();
  a.speed = a.speed.subtract(
    normalizedDiffA.multiply(2 * a.speed.dot(normalizedDiffA))
  );
}

export function randomMapped(x1: number, x2: number) {
  const size = x2 - x1;
  const offset = x1;
  return Math.random() * size + offset;
}
