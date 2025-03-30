uniform vec2 u_Mouse;
uniform vec2 u_Resolution;
uniform float u_Time;

vec3 getBg() {
  return vec3(u_Mouse / u_Resolution, .9);
}
