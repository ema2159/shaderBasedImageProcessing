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
uniform sampler2D image;
uniform vec2 resolution;
uniform bool norm;
uniform float hueShift;

varying vec2 vUv;

#define PI 3.14159265358979323846

vec3 rgb2xyz(vec3 c) {
  vec3 tmp;
  tmp.x = (c.r > 0.04045) ? pow((c.r + 0.055) / 1.055, 2.4) : c.r / 12.92;
  tmp.y = (c.g > 0.04045) ? pow((c.g + 0.055) / 1.055, 2.4) : c.g / 12.92;
  tmp.z = (c.b > 0.04045) ? pow((c.b + 0.055) / 1.055, 2.4) : c.b / 12.92;
  mat3 xyz_mat = mat3(0.4124, 0.3576, 0.1805, 0.2126, 0.7152, 0.0722, 0.0193,
                      0.1192, 0.9505);
  return 100.0 * xyz_mat * tmp;
}

vec3 xyz2lab(vec3 c) {
    vec3 n = c / vec3(95.047, 100, 108.883);
    vec3 v;
    v.x = (n.x > 0.008856) ? pow(n.x, 1.0 / 3.0) : (7.787 * n.x) + (16.0 / 116.0);
    v.y = (n.y > 0.008856) ? pow(n.y, 1.0 / 3.0) : (7.787 * n.y) + (16.0 / 116.0);
    v.z = (n.z > 0.008856) ? pow(n.z, 1.0 / 3.0) : (7.787 * n.z) + (16.0 / 116.0);
    return vec3((116.0 * v.y) - 16.0, 500.0 * (v.x - v.y), 200.0 * (v.y - v.z));
}

vec3 rgb2lab(vec3 c) {
    vec3 lab = xyz2lab(rgb2xyz(c) );
    return vec3(lab.x / 100.0, 0.5 + 0.5 * (lab.y / 127.0), 0.5 + 0.5 * (lab.z / 127.0));
}
vec3 xyz2rgb(vec3 c) {
  const mat3 mat = mat3(
			3.2406, -1.5372, -0.4986,
			-0.9689, 1.8758, 0.0415,
			0.0557, -0.2040, 1.0570
			);
  vec3 v = mat * (c/100.0);
  vec3 r;
  r.x = (v.r > 0.0031308) ? ((1.055 * pow(v.r, (1.0 / 2.4))) - 0.055) : 12.92 * v.r;
  r.y = (v.g > 0.0031308) ? ((1.055 * pow(v.g, (1.0 / 2.4))) - 0.055) : 12.92 * v.g;
  r.z = (v.b > 0.0031308) ? ((1.055 * pow(v.b, (1.0 / 2.4))) - 0.055) : 12.92 * v.b;
  return r;
}

vec3 lab2xyz(vec3 c) {
  float fy = (c.x + 16.0) / 116.0;
  float fx = c.y / 500.0 + fy;
  float fz = fy - c.z / 200.0;
  return vec3(
	      95.047 * ((fx > 0.206897) ? fx * fx * fx : (fx - 16.0 / 116.0) / 7.787),
	      100.000 * ((fy > 0.206897) ? fy * fy * fy : (fy - 16.0 / 116.0) / 7.787),
	      108.883 * ((fz > 0.206897) ? fz * fz * fz : (fz - 16.0 / 116.0) / 7.787)
	     );
}

vec3 lab2rgb(vec3 c) {
  return xyz2rgb(lab2xyz(vec3(100.0 * c.x, 2.0 * 127.0 * (c.y - 0.5), 2.0 * 127.0 * (c.z - 0.5))));
}

void main(void) {
  vec2 cellSize = 1.0 / resolution.xy;
  vec2 uv = vUv.xy;

  vec4 pixel_sample = texture2D(image, uv);
  vec3 color = rgb2lab(pixel_sample.rgb);
  float C_ab = length(vec2(color[1], color[2])); // sqrt((a*)^2+(b*)^2)
  float h = atan(color[2], color[1]);

  // Shift CIELAB color's a* and b* components
  h += (hueShift*PI)/180.0;
  vec2 ab = vec2(cos(h)*C_ab, sin(h)*C_ab);
  color.yz = ab;

  color = lab2rgb(color);

  gl_FragColor = vec4(color, 1.0);
}
`
export {vertexShader, fragmentShader}
