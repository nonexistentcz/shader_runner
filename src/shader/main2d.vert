#ifdef GL_ES
precision mediump float;
#endif

in vec3 a_position;

uniform mat3 u_Transform;
uniform vec2 u_Resolution;

vec2 screenToClip(vec2 screen) {
  vec2 clip = screen / u_Resolution * 2.0 - 1.0;
  return vec2(clip.x, -clip.y);
}

void main() {
  vec3 pos = vec3(a_position.xy, 1.0) * u_Transform;
  gl_Position = vec4(screenToClip(pos.xy), 0., 1.);
}