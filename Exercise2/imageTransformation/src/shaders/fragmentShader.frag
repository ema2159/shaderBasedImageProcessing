precision highp float;
const int kernelSizeDiv2 = 2;
uniform sampler2D image;
uniform vec2 resolution;
uniform float scale;
uniform float centerX;
uniform float centerY;

varying vec2 vUv;

vec2 scale_coord(vec2 pt, float scale) {
  mat2 scale_mat = mat2(scale, 0, 0, scale);
  return scale_mat * pt;
}

void main(void) {
  vec2 cellSize = 1.0 / resolution.xy;
  vec2 center = vec2(centerX, centerY);
  vec2 uv = vUv.xy + center;

  uv = scale_coord(uv, scale);
  vec4 textureValue = texture2D(image, uv);
      
  gl_FragColor = textureValue;
}
