const iaVertexShader = `
varying vec2 vUv;
void main() {
  vUv = vec2( uv.x, uv.y );
  gl_Position = projectionMatrix *
    modelViewMatrix * vec4(position, 1.0 );
}
`
const iaFragmentShader = `
precision highp float;
uniform sampler2D image;
uniform sampler2D image2;
uniform vec2 resolution;
uniform float scale;
uniform float centerX;
uniform float centerY;
uniform int operation;
uniform float scaleFactor;
uniform float offset;

varying vec2 vUv;

vec2 scale_coord(vec2 pt, float scale) {
  mat2 scale_mat = mat2(scale, 0, 0, scale);
  return scale_mat * pt;
}

void main(void) {
  vec2 cellSize = 1.0 / resolution.xy;
  vec2 center = vec2(centerX, centerY);
  vec2 uv = vUv.xy;
  vec2 uv2 = vUv.xy + center;

  uv2 = scale_coord(uv2, scale);

  vec4 textureValue = texture2D(image, uv);
  vec4 textureValue2 = texture2D(image2, uv2);

  if(operation == 0) {
    textureValue.rgb += textureValue2.rgb;
  } else if (operation == 1) {
    textureValue.rgb -= textureValue2.rgb;
  } else if (operation == 2) {
    textureValue.rgb *= textureValue2.rgb;
  } else if (operation == 3) {
    textureValue.rgb /= textureValue2.rgb;
  }

  gl_FragColor = textureValue*scaleFactor+offset;
}
`
export {iaVertexShader, iaFragmentShader}
