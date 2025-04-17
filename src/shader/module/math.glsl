//-----------------------
// CONSTANT DEFINITIONS
//-----------------------

#ifndef PI
#define PI 3.1415926538
#endif

//-----------------------
// GEOMETRIC SUMS
//-----------------------

float GeometricSum(float start, int count, float ratio) {
    return start * (1. - pow(ratio, float(count))) / (1. - ratio);
}

//-----------------------
// MATRIX
//-----------------------

vec2 Skew(vec2 coords, float factor) {
    return coords * mat2(
        1, factor,
        1, 0
    );
}

vec2 Rotate(vec2 coords, float angle) {
    angle *= PI / 180.;
    return mat2(
        cos(angle), -sin(angle),
        sin(angle), cos(angle)
    ) * coords;
}

//-----------------------
// COORDINATES
//-----------------------

vec2 StepCoordinates(vec2 coords, int stepCount) {
    return floor(coords * float(stepCount)) / float(stepCount);
}

//-----------------------
// Genral utility
//-----------------------

float Map(float value, float rangeMin, float rangeMax, float newMin, float newMax) {
    return newMin + (newMax - newMin) * (value - rangeMin) / (rangeMax - rangeMin);
}

float Map(float value, float newMin, float newMax) {
    return (newMax - newMin) * value + newMin; 
}

float Map(float value, float dist) {
    return value * 2. * dist - dist;
}

float SmoothMax(float a, float b, float smoothness) {
    return log(exp(smoothness * a) + exp(smoothness * b)) / smoothness;
}

float SmoothMin(float a, float b, float smoothness) {
    return SmoothMax(-a, -b, smoothness);
}

float FloatXOR(float a, float b) {
    return mix(a + b, a - b, step(0., a - b));
}

#define Step(var, stepCount) floor(var * stepCount) / stepCount
#define StepInclusive(var, stepCount) Step(var, stepCount) / (1. - 1. / stepCount)