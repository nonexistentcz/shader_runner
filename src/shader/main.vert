#ifdef GL_ES
precision mediump float;
#endif

in vec3 a_position;

uniform mat4 u_Transform;
uniform vec2 u_Resolution;

void main() {
  float aspectRatio = u_Resolution.y / u_Resolution.x;
  vec4 pos = vec4(a_position, 1.) * u_Transform;
  gl_Position = vec4(pos * vec4(aspectRatio * .9, .9, 1., 1.));
}