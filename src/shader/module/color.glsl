/// PRIO:1

const vec3 BURGUNDY = vec3(.52, 0., .125);
const vec3 DARK_MAGENTA = vec3(0.2196, 0.0392, 0.251);
const vec3 NONEXISTENT = vec3(0.6588, 0.1216, 0.2784);
const vec3 MARINE_BLUE = vec3(0.0392, 0.0392, 0.251);
const vec3 BURGUNDY_COMPLEMENT = vec3(0.,.52,.376);
const vec3 WHITE = vec3(1.);
const vec3 BLACK = vec3(0.);
const vec3 PASTEL_BLUE = vec3(0.6549, 0.7804, 0.9059);
const vec3 SKYBLUE = vec3(0.5294, 0.8078, 0.9216);
const vec3 LAVENDER = vec3(0.7333, 0.6824, 1.0);
const vec3 PINK = vec3(1.0, 0.6824, 0.8941);

//-----------------------
// Color spaces
//-----------------------

vec3 RGBToHSL( in vec3 c ){
  float h = 0.0;
	float s = 0.0;
	float l = 0.0;
	float r = c.r;
	float g = c.g;
	float b = c.b;
	float cMin = min( r, min( g, b ) );
	float cMax = max( r, max( g, b ) );

	l = ( cMax + cMin ) / 2.0;
	if ( cMax > cMin ) {
		float cDelta = cMax - cMin;
        
        //s = l < .05 ? cDelta / ( cMax + cMin ) : cDelta / ( 2.0 - ( cMax + cMin ) ); Original
		s = l < .0 ? cDelta / ( cMax + cMin ) : cDelta / ( 2.0 - ( cMax + cMin ) );
        
		if ( r == cMax ) {
			h = ( g - b ) / cDelta;
		} else if ( g == cMax ) {
			h = 2.0 + ( b - r ) / cDelta;
		} else {
			h = 4.0 + ( r - g ) / cDelta;
		}

		if ( h < 0.0) {
			h += 6.0;
		}
		h = h / 6.0;
	}
	return vec3( h, s, l );
}

vec3 RGBToHSV(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 HSLToRGB(vec3 c)
{
    vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );
    return c.z + c.y * (rgb-0.5)*(1.0-abs(2.0*c.z-1.0));
}

vec3 HSVToRGB(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float Luminance(vec3 col) {
    const vec3 W = vec3(0.2125, 0.7154, 0.0721);
    return dot(col, W);
}

vec3 ToRGB(float h, float s, float l) {
    return HSLToRGB(vec3(h,s,l));
}

vec3 HueShift (in vec3 Color, in float Shift)
{
    vec3 P = vec3(0.55735)*dot(vec3(0.55735),Color);
    vec3 U = Color-P;
    vec3 V = cross(vec3(0.55735),U);    
    Color = U*cos(Shift*6.2832) + V*sin(Shift*6.2832) + P;
    return vec3(Color);
}

vec3 BlendBurn(vec3 color1, vec3 color2) {
    return 1. - (1. - color1) / color2;
}

vec3 BlendScreen(vec3 color1, vec3 color2) {
    return 1. - (1. - color1) * (1. - color2);
}

vec3 BlendDodge(vec3 color1, vec3 color2) {
    return color1 / (1. - color2);
}

vec3 BlendOverlay(vec3 color1, vec3 color2) {
    float luminance = Luminance(color1);
    return luminance >= .5 ?
            1. - 2. * (1. - color1) * (1. - color2) :
            2. * color1 * color2;
}

vec3 BlendSoftLight(vec3 color1, vec3 color2) {
    float luminance = Luminance(color2);
    return luminance <= .5 ? 
            2. * color1 * color2 + color1 * color1 * (1. - 2. * color2) :
            2. * color1 * (1. - color2) + sqrt(color1) * (2. * color2 - 1.);
}

#define Darken(col, percentage) mix(col, BLACK, percentage)
#define Lighten(col, percentage) mix(col, WHITE, percentage)
