const vertexShader = `
uniform float scaleX;
uniform float scaleY;

varying vec2 vUv;

vec2 scale_coord(vec2 pt, float scaleX, float scaleY) {
  mat2 scale_mat = mat2(scaleX, 0, 0, scaleY);
  return scale_mat * pt;
}

void main() {
  vUv = vec2( uv.x, uv.y );
  
  vec3 pos = position;
  pos.xy = scale_coord(pos.xy, scaleX, scaleY);
  
  gl_Position = projectionMatrix *
    modelViewMatrix * vec4(pos, 1.0 );
}
`
const fragmentShader = `
precision highp float;
uniform sampler2D image;
uniform vec2 resolution;
uniform float scale;
uniform int interpolation;

varying vec2 vUv;

// Redundant. OpenGL does it by default.
vec3 bilinear_iterp(vec2 frag_pos, sampler2D image, vec2 cellSize) {
  vec2 h_0 = frag_pos + mod(frag_pos, cellSize);
  vec2 h_1 = frag_pos + mod(frag_pos, cellSize) + cellSize;
  vec3 pix1 = texture2D(image, vec2(h_0.x, h_0.y)).rgb;
  vec3 pix2 = texture2D(image, vec2(h_1.x, h_0.y)).rgb;
  vec3 pix3 = texture2D(image, vec2(h_0.x, h_1.y)).rgb;
  vec3 pix4 = texture2D(image, vec2(h_1.x, h_1.y)).rgb;
  vec3 horiz1 = mix(pix1, pix2, frag_pos.x); 
  vec3 horiz2 = mix(pix3, pix4, frag_pos.x); 
  vec3 vert = mix(horiz1, horiz2, frag_pos.y);
  return vert;
}

vec3 nn_iterp(vec2 frag_pos, sampler2D image, vec2 cellSize) {
  vec2 pix_mod = mod(frag_pos, cellSize);
  float h_coord = (pix_mod.x <= 0.5) ? frag_pos.x - pix_mod.x : frag_pos.x - pix_mod.x + cellSize.x;
  float v_coord = (pix_mod.y <= 0.5) ? frag_pos.y - pix_mod.y : frag_pos.y - pix_mod.y + cellSize.y;
  vec3 pix = texture2D(image, vec2(h_coord, v_coord)).rgb;
  return pix;
}

void main(void) {
  vec2 cellSize = 1.0 / resolution.xy;
  vec2 uv = vUv.xy;

  vec3 textureValue;
  if (interpolation == 0) {
    textureValue = bilinear_iterp(uv, image, cellSize);
  } else if (interpolation == 1) {
    textureValue = nn_iterp(uv, image, cellSize);
  }

  gl_FragColor = vec4(textureValue, 1.0);
}
`
export {vertexShader, fragmentShader}
