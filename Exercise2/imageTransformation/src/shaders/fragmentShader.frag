precision highp float;
uniform sampler2D image;
uniform vec2 resolution;
uniform float scale;
uniform float centerX;
uniform float centerY;

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
}

void main(void) {
  vec2 cellSize = 1.0 / resolution.xy;
  vec2 center = vec2(centerX, centerY);
  vec2 uv = vUv.xy + center;

  uv = scale_coord(uv, scale);
  vec4 textureValue = texture2D(image, uv);
      
  gl_FragColor = textureValue;
}
