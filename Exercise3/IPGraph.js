/**
 * Abstract Class IPFilter.
 *
 * @class IPFilter
 */
class IPFilter {

  constructor(height, width, imageProcessingMaterial) {
    // Cannot call constructor of abstract class
    if (this.constructor == IPFilter) {
      throw new Error("Abstract classes can't be instantiated.");
    }
    this.height = height;
    this.width = width;

    //3 rtt setup
    this.scene = new THREE.Scene();
    // prettier-ignore
    this.orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1);

    //4 create a target texture
    let options = {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      // type:THREE.FloatType
      type: THREE.UnsignedByteType,
    };
    this.rtt = new THREE.WebGLRenderTarget(width, height, options);

    let geom = new THREE.BufferGeometry();
    geom.addAttribute(
      "position",
      new THREE.BufferAttribute(
	new Float32Array(
	  // prettier-ignore
	  [-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0]
	),
	3
      )
    );
    geom.addAttribute(
      "uv",
      new THREE.BufferAttribute(
	new Float32Array(
	  // prettier-ignore
	  [ 0,1, 1,1, 1,0, 0,1, 1,0, 0,0 ]
	),
	2
      )
    );
    this.scene.add(new THREE.Mesh(geom, imageProcessingMaterial));
  }

}

/**
 * Abstract Class Scaling.
 *
 * @class Scaling
 */
class Scaling extends IPFilter {

  constructor(height, width, imageProcessingMaterial) {
    super(height, width, imageProcessingMaterial);
  }

}
