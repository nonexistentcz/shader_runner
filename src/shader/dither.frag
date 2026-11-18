/// use:module/noise.glsl

out vec4 fragColor;

// fill of the shape, alpha 0 leaves only the dithered foreground
uniform vec4 u_Color;
// color of the dither pixels
uniform vec3 u_Foreground;
uniform float u_Gradient;
uniform vec2 u_ShapeCenter;
uniform float u_ShapeRadius;
uniform vec2 u_Resolution;
// random offset, re-rolled periodically (see seed.ts)
uniform vec2 u_Seed;

// in shape-local units (radius = 1), y up
const vec2 LIGHT_POSITION = vec2(-.45, .45);
// 0 = straight diagonal gradient, 1 = fully radial
const float RADIAL_AMOUNT = .6;
// opacity of a single dot on the light (top left) side, rising to 1 on the dark side;
// fainter dots let the background mix in, so more of them are drawn to compensate
const float MIN_DOT_OPACITY = .35;

void main() {
    // shape center is in screen coords (y down), gl_FragCoord has y up
    vec2 center = vec2(u_ShapeCenter.x, u_Resolution.y - u_ShapeCenter.y);
    vec2 local = (gl_FragCoord.xy - center) / u_ShapeRadius;
    // 0 at the top left edge, 1 at the bottom right edge of the shape
    float linear = (local.x - local.y) / (2. * sqrt(2.)) + .5;
    // distance from a light spot up and to the left of the center, 1 at the far edge
    float radial = length(local - LIGHT_POSITION) / (length(LIGHT_POSITION) + 1.);
    float t = clamp(mix(linear, radial, RADIAL_AMOUNT), 0., 1.);
    // dots are fainter where t is low, density is raised so the average
    // coverage (density * opacity) still equals t
    float dotOpacity = mix(MIN_DOT_OPACITY, 1., t);
    float density = min(t / dotOpacity, 1.);
    float dither = step(Hash12(floor(gl_FragCoord.xy) + u_Seed), density) * u_Gradient;
    float coverage = dither * dotOpacity;

    // foreground dot composited over the fill, the fill may be transparent
    float alpha = coverage + u_Color.a * (1. - coverage);
    vec3 col = (u_Foreground * coverage + u_Color.rgb * u_Color.a * (1. - coverage)) / max(alpha, 1e-4);
    fragColor = vec4(col, alpha);
}
