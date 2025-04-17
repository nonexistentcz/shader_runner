/// use:module/noise.glsl
/// use:module/color.glsl

uniform vec2 u_Mouse;
uniform vec2 u_Resolution;
uniform float u_Time;
uniform vec2 u_Position;

const vec3 NONEX = vec3(0.66, 0.12, 0.28);
const vec3 NONEX_DARKER = vec3(0.5216, 0.0863, 0.2157);
const vec3 NONEX_DARKEST = vec3(0.1686, 0.1373, 0.1451);

vec3 getBg(vec2 uv) {
  float threshold = GapNoise(uv + u_Time * .0003, .2, 7);
  return StylizedNoise(uv, mix(NONEX_DARKEST, NONEX_DARKER, threshold), .1);
  // return vec3(mix(NONEX_LIGHT, NONEX_COMPLEMENTARY_LIGHT, u_Mouse.x / u_Resolution.x));
}
