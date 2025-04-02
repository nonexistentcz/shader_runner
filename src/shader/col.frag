uniform vec2 u_Mouse;
uniform vec2 u_Resolution;
uniform float u_Time;

const vec3 NONEX = vec3(0.66, 0.12, 0.28);
const vec3 NONEX_LIGHT = vec3(0.102, 0.0, 0.0);

vec3 getBg(vec2 uv) {
  return NONEX_LIGHT;
  // return vec3(mix(NONEX_LIGHT, NONEX_COMPLEMENTARY_LIGHT, u_Mouse.x / u_Resolution.x));
}
