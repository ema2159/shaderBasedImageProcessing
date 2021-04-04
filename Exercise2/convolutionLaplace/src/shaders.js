const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = vec2( uv.x, 1.0-uv.y );
  gl_Position = projectionMatrix *
    modelViewMatrix * vec4(position, 1.0 );
}
`
const fragmentShader = `
precision highp float;
uniform float sigma;
uniform int kernelSize;
uniform sampler2D image;
uniform vec2 resolution;
uniform bool norm;

varying vec2 vUv;

#define PI 3.14159265358979323846
#define PI2 6.28318530717958647692

// pos: position of pixel in the kernel
// sigma: standard deviation of gaussian kernel
float get_laplace_pix(vec2 pos, float sigma) {
  return (1.0 - ((pow(pos.x, 2.0) + pow(pos.y, 2.0)) / (2.0 * pow(sigma, 2.0)))) *
         exp(-((pow(pos.x, 2.0) + pow(pos.y, 2.0)) / (2.0 * pow(sigma, 2.0))));
}

void main(void) {
  vec2 cellSize = 1.0 / resolution.xy;
  vec2 uv = vUv.xy;

  vec4 textureValue = vec4(0, 0, 0, 0);
  int kernelSizeDiv2 = kernelSize / 2;

  float kernelSum = 0.0;
  for (int i = -kernelSizeDiv2; i <= kernelSizeDiv2; i++) {
    for (int j = -kernelSizeDiv2; j <= kernelSizeDiv2; j++) {
      float pix_gauss_val = get_laplace_pix(vec2(float(i), float(j)), sigma);
      kernelSum += pix_gauss_val;
      textureValue +=
          pix_gauss_val * texture2D(image, uv + vec2(float(i) * cellSize.x,
                                                     float(j) * cellSize.y));
    }
  }

  textureValue /= kernelSum;
  if(norm) {
    textureValue = normalize(textureValue);
  }
  gl_FragColor = textureValue;
}
`
export {vertexShader, fragmentShader}
