/// use:module/noise.glsl

out vec4 fragColor;

uniform vec3 u_Color;
uniform vec2 u_Resolution;

const float NOISE_AMPLITUDE = .25;

void main() {
    vec2 uv = gl_FragCoord.xy / u_Resolution;
    float grain = N21(uv) - .5;
    vec3 col = u_Color + grain * NOISE_AMPLITUDE;
    fragColor = vec4(clamp(col, 0., 1.), 1.0);
}
