/// use:col.frag

out vec4 fragColor;

void main() {
    fragColor = vec4(getBg(gl_FragCoord.xy / u_Resolution), 1.0);
}