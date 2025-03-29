uniform vec2 u_Mouse;
uniform vec2 u_Resolution;

vec3 getBg() {
  return vec3(u_Mouse / u_Resolution, 0.9412);
}
