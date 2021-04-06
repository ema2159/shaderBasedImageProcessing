precision highp float;
uniform int kernelSize;
uniform sampler2D image;
uniform vec2 resolution;

varying vec2 vUv;

#define MAX_ARRAY_SIZE 100

// int kernelSizeSquared = int(pow(float(kernelSize), 2.0));

void insertionSort(inout vec4 arr[MAX_ARRAY_SIZE], int n) {
  vec4 key;
  int i, j;
  for (i = 1; i < n; i++) {
    key = arr[i];
    j = i - 1;

    /* Move elements of arr[0..i-1], that are
      greater than key, to one position ahead
      of their current position */
    while (j >= 0 && length(arr[j]) > length(key)) {
      arr[j + 1] = arr[j];
      j = j - 1;
    }
    arr[j + 1] = key;
  }
}

void main(void) {
  vec2 cellSize = 1.0 / resolution.xy;
  vec2 uv = vUv.xy;

  vec4 textureValue = vec4(0, 0, 0, 0);
  int kernelSizeDiv2 = kernelSize / 2;
  int median_arr_size = int(pow(float(kernelSize), 2.0));
  vec4[MAX_ARRAY_SIZE] median_arr;

  int count = 0;
  for (int i = -kernelSizeDiv2; i <= kernelSizeDiv2; i++) {
    for (int j = -kernelSizeDiv2; j <= kernelSizeDiv2; j++) {
      median_arr[count] = texture2D(
          image, uv + vec2(float(i) * cellSize.x, float(j) * cellSize.y));
      count++;
    }
  }

  gl_FragColor = textureValue;
}
