/// use:module/color.glsl
/// use:module/noise.glsl

out vec4 fragColor;
uniform vec2 u_Resolution;
uniform float u_Time;

vec3 getBg(vec2 uv) {
  return mix(DARK_MAGENTA, vec3(0.), N22prob(uv, .2).x);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_Resolution;
  fragColor = vec4(getBg(gl_FragCoord.xy / u_Resolution), 1.0);
}