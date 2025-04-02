in vec3 a_position;

uniform vec3 u_ShapePos;
uniform vec2 u_Resolution;

void main() {
  float aspectRatio = u_Resolution.y / u_Resolution.x;
  vec3 pos = a_position + u_ShapePos;
  gl_Position = vec4(pos * vec3(aspectRatio * .9, .9, 1.), 1.);
}