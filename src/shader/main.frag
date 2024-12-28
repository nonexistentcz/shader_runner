#version 300 es

#ifdef GL_ES
precision highp float;
#endif

out vec4 fragColor;

void main() {
    vec3 col = vec3(0.902, 0.9294, 1.0);
    fragColor = vec4(col, 1.0);
}