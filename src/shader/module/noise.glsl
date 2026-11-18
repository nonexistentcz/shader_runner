/// use:module/math.glsl

//-----------------------
// NOISE
//-----------------------


float N11(float pos, int seed) {
    return fract(sin(1516.51 * pos + float(seed) * 37.15) * (1317.12 * pos));
}

float N11(float pos) {
    return N11(pos, 0);
}

float N21(vec2 coords, int seed) {
    return fract(sin(1428. * coords.x + 1741. * coords.y) * (923. + float(seed)));
}

float N21(vec2 coords) {
    return N21(coords, 0);
}

// uniformly distributed per-pixel hash (Dave Hoskins), so P(hash < t) == t
float Hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

vec2 N22(vec2 coords, int seed) {
    vec3 a = fract(coords.xyx * vec3(123.34, 234.34, 345.65));
    a += dot(a, a + 534.45 + float(seed));
    return fract(vec2(a.x * a.y, a.x * a.z));
}

vec2 N22(vec2 coords) {
    return N22(coords, 0);
}

vec3 OffsetNoise(vec2 coords, vec3 offsets) {
    return vec3(N21(coords + offsets.x), N21(coords + offsets.y), N21(coords + offsets.z));
}

vec3 OffsetNoise(vec2 coords, vec3 offsets, int seed) {
    return vec3(N21(coords + offsets.x, seed), N21(coords + offsets.y, seed), N21(coords + offsets.z, seed));
}

float ShireNoise(vec2 coords, float frequency) {
    vec2 gridID = vec2(floor(coords.x * frequency), floor(coords.y) * frequency);
    vec2 gridPos = vec2(
        smoothstep(0., 1., fract(coords.x * frequency)),
        smoothstep(0., 1., fract(coords.y) * frequency)
    );
    return mix(
        mix(N21(gridID), N21(gridID + vec2(1., 0.)), gridPos.x),
        mix(N21(gridID + vec2(0., 1.)), N21(gridID + vec2(1., 1.)), gridPos.x),
        gridPos.y
    );
}

float SmoothNoise(vec2 coords, float frequency, int seed) {
    vec2 gridID = vec2(floor(coords.x * frequency), floor(coords.y * frequency));
    vec2 gridPos = vec2(
        smoothstep(0., 1., fract(coords.x * frequency)), 
        smoothstep(0., 1., fract(coords.y * frequency))
    );
    return mix(
        mix(N21(gridID, seed), N21(gridID + vec2(1., 0.), seed), gridPos.x),
        mix(N21(gridID + vec2(0., 1.), seed), N21(gridID + vec2(1., 1.), seed), gridPos.x),
        gridPos.y
    );
}

float SmoothNoise(vec2 coords, float frequency) {
    return SmoothNoise(coords, frequency, 0);
}

float SmoothOctave(vec2 coords, float frequency, int octaves, int seed) {
    float ret = 0.; 
    for (int i = 1; i <= octaves; i++) {
        ret += SmoothNoise(coords, frequency * float(i), seed) / float(i);
    }
    return ret / GeometricSum(1., octaves, .5);
}

float SmoothOctave(vec2 coords, float frequency, int octaves) {
    return SmoothOctave(coords, frequency, octaves, 0);
}


float SharpNoise(vec2 coords, float frequency, int seed) {
    vec2 gridID = vec2(floor(coords.x * frequency), floor(coords.y * frequency));
    return mix(
        mix(N21(gridID, seed), N21(gridID + vec2(1., 0.), seed), fract(coords.x * frequency)),
        mix(N21(gridID + vec2(0., 1.), seed), N21(gridID + vec2(1., 1.), seed), fract(coords.x * frequency)),
        fract(coords.y * frequency)
    );
}

float SharpNoise(vec2 coords, float frequency) {
    return SharpNoise(coords, frequency, 0);
}

float GradientNoise(vec2 coords, float frequency, int seed) {
    vec2 gridID = floor(coords * frequency);
    vec2 gridPos = fract(coords * frequency);
    float maxVal = 0.;
    for (int x = -1; x <= 1; x++) {
        for (int y = -1; y <= 1; y++) {
            vec2 currentID = gridID + vec2(x, y);
            vec2 currentPos = vec2(N21(currentID, seed), N21(currentID, seed + 1000));
            vec2 currentPoint = (currentID + currentPos) / frequency;
            maxVal = max(1. - length(currentPoint - coords) * frequency, maxVal);
        }
    }
    return clamp(0., 1., maxVal);
}

float SmoothGradientNoise(vec2 coords, float frequency, float smoothness, int seed) {
    vec2 gridID = floor(coords * frequency);
    vec2 gridPos = fract(coords * frequency);
    float maxVal = 0.;
    for (int x = -1; x <= 1; x++) {
        for (int y = -1; y <= 1; y++) {
            vec2 currentID = gridID + vec2(x, y);
            vec2 currentPos = vec2(N21(currentID, seed), N21(currentID, seed + 1000));
            vec2 currentPoint = (currentID + currentPos) / frequency;
            maxVal = SmoothMax(1. - length(currentPoint - coords) * frequency, maxVal, smoothness);
        }
    }
    return clamp(0., 1., maxVal * .5 + .5);
}

float SmoothGradientNoise(vec2 coords, float frequency, float smoothness) {
    return SmoothGradientNoise(coords, frequency, smoothness, 0);
}

float GradientNoise(vec2 coords, float frequency) {
    return GradientNoise(coords, frequency, 0);
}

float VineNoise(vec2 coords) {
    coords = Skew(coords, 30.);
    float ret = SmoothNoise(coords, 40.);
    coords = Skew(coords, -30.);
    ret = mix(ret, 1., SmoothOctave(coords, 3., 1));
    return ret;
}

float StepFractNoise(vec2 coords, float frequency, float maxOffset, int seed) {
    coords.x = fract(coords.x * frequency) / frequency;
    coords.y += N21(coords, seed) * maxOffset;
    float ret = step(coords.y, .5);

    return ret;
}

float StepFractNoise(vec2 coords, float frequency, float maxOffset) {
    return StepFractNoise(coords, frequency, maxOffset, 0);
}

float StepFloorNoise(vec2 coords, float frequency, float maxOffset, int seed) {
    coords.x = floor(coords.x * frequency) / frequency;
    coords.y += N21(coords, seed) * maxOffset;
    float ret = step(coords.y, .5);

    return ret;
}

float SkylineNoise(vec2 coords, float frequency, float maxOffset, int seed) {
    float gridID = floor(coords.x * frequency) / frequency;
    float noiseVal = N11(gridID, seed) * maxOffset;
    coords.y -= noiseVal;
    return step(coords.y, .5);
}

float SkylineNoise(vec2 coords, float frequency, float maxOffset) {
    return SkylineNoise(coords, frequency, maxOffset, 0);
}

// CREATES SMOOTHSTEP GRADIENT
float GapNoise(vec2 coords, float frequency, int octave, int seed) {
    float gapSize = 1. / float(octave);
    float gapFract = gapSize / 5.;
    float ret = 0.;
    for (int i = 1; i <= octave; i++) {
        float gap = gapSize * float(i);
        ret = mix(ret, 1., smoothstep(gap, gap + gapFract, SmoothOctave(coords, frequency, 8, seed)));
        ret = mix(ret, 0., smoothstep(gap + gapFract * 2., gap + gapFract * 3., SmoothOctave(coords, frequency, 8, seed)));
    }
    return ret;
}

float GapNoise(vec2 coords, float frequency, int octave) {
    return GapNoise(coords, frequency, octave, 0);
}

vec3 StylizedNoise(vec2 uv, vec3 col, float amplitude) {
    col = mix(col, vec3(1.), N21(uv) * amplitude);
    col = mix(col, vec3(0.), N21(uv) * amplitude);
    return col;
}

vec3 StylizedNoise(vec2 uv, vec3 col) {
    return StylizedNoise(uv, col, .1);
}

vec2 N22prob(vec2 uv, float percentage, int seed) {
    return step(1. - percentage, N22(uv, seed));
}

vec2 N22prob(vec2 uv, float percentage) {
    return step(1. - percentage, N22(uv));
}

float N21prob(vec2 uv, float percentage, int seed) {
    return step(1. - percentage, N21(uv, seed));
}

float N21prob(vec2 uv, float percentage) {
    return step(1. - percentage, N21(uv));
}