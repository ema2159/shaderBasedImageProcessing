precision highp float;
const int kernelSizeDiv2 = 2;
uniform sampler2D image;
uniform vec2 resolution;
uniform int operation;

varying vec2 vUv;

void main(void) {
  vec2 cellSize = 1.0 / resolution.xy;
  vec2 uv = vUv.xy;

  vec4 textureValue = vec4(0, 0, 0, 0);
  
  for (int i = -kernelSizeDiv2; i <= kernelSizeDiv2; i++) {
    for (int j = -kernelSizeDiv2; j <= kernelSizeDiv2; j++) {
      textureValue += texture2D(
          image, uv + vec2(float(i) * cellSize.x, float(j) * cellSize.y));
    }
  }

  textureValue /= float((kernelSizeDiv2 * 2 + 1) * (kernelSizeDiv2 * 2 + 1));      
  gl_FragColor = textureValue;
}
