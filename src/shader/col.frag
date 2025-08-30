/// use:module/noise.glsl
/// use:module/color.glsl

uniform vec2 u_Mouse;
uniform vec2 u_Resolution;
uniform float u_Time;
uniform vec2 u_Position;

const vec3 NONEX = vec3(0.66, 0.12, 0.28);
const vec3 NONEX_DARKER = vec3(0.5216, 0.0863, 0.2157);
const vec3 NONEX_DARKEST = vec3(0.2039, 0.2039, 0.3412);

vec3 getBg(vec2 uv) {
  vec2 newUv = uv + GapNoise(uv + 40. - u_Time * 0.00001, .1, 45) * .3;
  float threshold = GapNoise(newUv + u_Time * .3 * .0003, .2, 7);
  return mix(NONEX_DARKEST, NONEX_DARKER, threshold);
  // return vec3(mix(NONEX_LIGHT, NONEX_COMPLEMENTARY_LIGHT, u_Mouse.x / u_Resolution.x));
}
