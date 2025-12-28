/// use:module/noise.glsl

out vec4 fragColor;

uniform vec3 u_Color;
uniform vec2 u_Resolution;
uniform sampler2D u_Texture;
uniform float u_Time;

void main() {
    float aspectRatio = u_Resolution.x / u_Resolution.y;
    vec2 uv = gl_FragCoord.xy / u_Resolution;
    vec2 texRG = texture(u_Texture, uv).rg;
    float texB = texture(u_Texture, vec2(uv.x, uv.y + .01)).b;
    vec3 texCol = vec3(texRG, texB);
    fragColor = vec4(texCol, 1.);
}