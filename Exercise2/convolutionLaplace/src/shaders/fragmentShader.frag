precision highp float;
uniform sampler2D image;
uniform vec2 resolution;
uniform bool norm;

varying vec2 vUv;

const int kernelSize = 3;

const mat3 lapl_mat = mat3(-1.0, -1.0, -1.0,
			   -1.0, 8.0, -1.0,
			   -1.0, -1.0, -1.0);

void main(void) {
  vec2 cellSize = 1.0 / resolution.xy;
  vec2 uv = vUv.xy;

  vec4 textureValue = vec4(0.0, 0.0, 0.0, 1.0);
  int kernelSizeDiv2 = kernelSize / 2;

  for (int i = -kernelSizeDiv2; i <= kernelSizeDiv2; i++) {
    for (int j = -kernelSizeDiv2; j <= kernelSizeDiv2; j++) {
      textureValue.rgb += lapl_mat[i + kernelSizeDiv2][j + kernelSizeDiv2] *
                          texture2D(image, uv + vec2(float(i) * cellSize.x,
                                                     float(j) * cellSize.y)).rgb;
    }
  }

  if (norm) {
    textureValue = normalize(textureValue);
  }
  gl_FragColor = textureValue;
}
