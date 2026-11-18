/// use:module/noise.glsl

out vec4 fragColor;

uniform vec2 u_Resolution;
uniform sampler2D u_Texture;
uniform float u_NoiseAmplitude;
// random offset, re-rolled periodically (see seed.ts)
uniform vec2 u_Seed;

// grain octaves, each one twice the cell size and half the weight of the previous
const int GRAIN_OCTAVES = 3;

// zero-mean grain summed over octaves of 1, 2, 4... px cells, roughly in [-.5, .5]
float OctaveGrain(vec2 pixel, vec2 seed) {
    float sum = 0.;
    float weight = 1.;
    float cellSize = 1.;
    for (int i = 0; i < GRAIN_OCTAVES; i++) {
        sum += (Hash12(floor(pixel / cellSize) + seed + float(i) * 113.) - .5) * weight;
        weight *= .5;
        cellSize *= 2.;
    }
    return sum / GeometricSum(1., GRAIN_OCTAVES, .5);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_Resolution;
    vec3 col = texture(u_Texture, uv).rgb;

    // zero-mean multiplicative grain, keeps hue and average brightness, black stays black
    float grain = OctaveGrain(floor(gl_FragCoord.xy), u_Seed) * u_NoiseAmplitude;
    fragColor = vec4(clamp(col * (1. + grain), 0., 1.), 1.);
}
