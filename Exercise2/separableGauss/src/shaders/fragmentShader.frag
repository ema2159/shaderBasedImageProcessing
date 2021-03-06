precision highp float;
uniform float sigma;
uniform int kernelSize;
uniform bool firstPass;
uniform sampler2D image;
uniform vec2 resolution;

varying vec2 vUv;

// t: value of one of the components (x or y) of the pixel
// sigma: standard deviation of gaussian kernel
float get_gauss_pix1D(float t, float sigma) {
  return exp(-(pow(t, 2.0) / (2.0 * pow(sigma, 2.0))));
}

void main(void) {
  vec2 cellSize = 1.0 / resolution.xy;
  vec2 uv = vUv.xy;

  vec4 textureValue = vec4(0, 0, 0, 0);
  int kernelSizeDiv2 = kernelSize / 2;

  float kernelSum = 0.0;
  if(firstPass) {
    for (int i = -kernelSizeDiv2; i <= kernelSizeDiv2; i++) {
      float pix_gauss_val = get_gauss_pix1D(float(i), sigma);
      kernelSum += pix_gauss_val;
      textureValue +=
	pix_gauss_val * texture2D(image, uv + vec2(float(i) * cellSize.x,
						   0.0));
    }
  } else {
    for (int j = -kernelSizeDiv2; j <= kernelSizeDiv2; j++) {
      float pix_gauss_val = get_gauss_pix1D(float(j), sigma);
      kernelSum += pix_gauss_val;
      textureValue +=
	pix_gauss_val * texture2D(image, uv + vec2(0.0,
						   float(j) * cellSize.y));
    }
  }

  textureValue /= kernelSum;

  gl_FragColor = textureValue;
}
