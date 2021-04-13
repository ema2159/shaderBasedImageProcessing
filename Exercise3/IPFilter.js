import * as THREE from "https://unpkg.com/three/build/three.module.js";
import {scVertexShader, scFragmentShader} from "./shaders/SCshaders.js";
import {iaVertexShader, iaFragmentShader} from "./shaders/IAshaders.js";
import {cgVertexShader, cgFragmentShader} from "./shaders/CGshaders.js";
import {clVertexShader, clFragmentShader} from "./shaders/CLshaders.js";
import {lgVertexShader, lgFragmentShader} from "./shaders/LoGshaders.js";
import {sgVertexShader, sgFragmentShader} from "./shaders/SGshaders.js";
import {mfVertexShader, mfFragmentShader} from "./shaders/MFshaders.js";
import {ctVertexShader, ctFragmentShader} from "./shaders/CTshaders.js";

/**
 * Abstract Class IPFilter.
 *
 * @class IPFilter
 *
 * Abstract class for creating offscreen rendering image processing nodes.
 * @param {int} width   The width of the renderTarget.
 * @param {int} height  The height of the renderTarget.
 * @param {Object} imageProcessingMaterial Shader material that implements the image processing method.
 */
class IPFilter {
  // Private class fields
  #material;
  #scene;
  #orthoCamera;
  #rtt;

  constructor(height, width, imageProcessingMaterial) {
    // Cannot call constructor of abstract class
    if (this.constructor == IPFilter) {
      throw new Error("Abstract classes can't be instantiated.");
    }

    // Material to return
    this.#material = imageProcessingMaterial;

    //3 rtt setup
    this.#scene = new THREE.Scene();
    // prettier-ignore
    this.#orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1);

    //4 create a target texture
    let options = {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      // type:THREE.FloatType
      type: THREE.UnsignedByteType,
    };
    this.#rtt = new THREE.WebGLRenderTarget(width, height, options);

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
          [ 0,0, 1,0, 1,1, 0,0, 1,1, 0,1 ]
        ),
        2
      )
    );
    this.#scene.add(new THREE.Mesh(geom, imageProcessingMaterial));
  }

  initializeRenderer(renderer) {
    renderer.setRenderTarget(this.#rtt);
    renderer.render(this.#scene, this.#orthoCamera);
    renderer.setRenderTarget(null);
  }

  // Getter functions
  get material() {
    return this.#material;
  }

  get rtt() {
    return this.#rtt;
  }

  get scene() {
    return this.#scene;
  }

  get orthoCamera() {
    return this.#orthoCamera;
  }
}

/**
 * Class Scaling.
 *
 * @class Scaling
 * Class for creating an offscreen rendering image scaling filter.
 * @param {int} width  The width of the renderTarget.
 * @param {int} height The height of the renderTarget.
 * @param {Object} texture Input texture to be processed.
 * @param {Object} uniformsParam Object containing uniforms that override default material uniforms.
 * An example of a valid uniforms object to pass would be the following:
 * {scaleX: {type: _"f"_, value: *2.0*},
 * scaleY: {type: _"f"_, value: *2.0*},
 * interpolation: {type: _"i"_, value: *0*}} // 0: bilinear, 1: nearest neighbors, 2: no interp.
 * @extends IPFilter
 */
class Scaling extends IPFilter {
  constructor(height, width, texture, uniformsParam = {}) {
    let imageProcessingMaterial = new THREE.ShaderMaterial({
      uniforms: {
        scaleX: {type: "f", value: 1.0},
        scaleY: {type: "f", value: 1.0},
        interpolation: {type: "i", value: 0},
        image: {type: "t", value: texture},
        resolution: {
          type: "2f",
          value: new THREE.Vector2(width, height),
        },
        ...uniformsParam,
      },
      vertexShader: scVertexShader,
      fragmentShader: scFragmentShader,
      side: THREE.DoubleSide,
    });
    super(height, width, imageProcessingMaterial);
  }
}

/**
 * Class IArithmetic.
 *
 * @class IArithmetic
 * Class for creating an offscreen rendering image arithmetic node.
 * It implements the following operation:
 * (image1 _operator_ image2)*scaleFactor+offset
 * @param {int} width  The width of the renderTarget.
 * @param {int} height The height of the renderTarget.
 * @param {Object} texture Input texture to be processed.
 * @param {Object} uniformsParam Object containing uniforms that override default material uniforms.
 * An example of a valid uniforms object to pass would be the following:
 * {scale: {type: _"f"_, value: *1.4*}, // Scale second texture
 * centerX: {type: _"f"_, value: *0.3*}, // Move center of second texture along X axis
 * centerY: {type: _"f"_, value: *0.2*}, // Move center of second texture along Y axis
 * image2: {type: _"t"_, value: texture}, // Second texture to process. Must be a texture object.
 * operation: {type: _"i"_, value: *0*}, // 0: Add, 1: Sub, 2: Mult, 3: Div
 * scaleFactor: {type: _"f"_, value: *1.2*},
 * offset: {type: _"f"_, value: *0.3*}}
 * @extends IPFilter
 */
class IArithmetic extends IPFilter {
  constructor(height, width, texture, uniformsParam = {}) {
    let imageProcessingMaterial = new THREE.ShaderMaterial({
      uniforms: {
        scale: {type: "f", value: 1.0},
        centerX: {type: "f", value: 0.0},
        centerY: {type: "f", value: 0.0},
        image: {type: "t", value: texture},
        image2: {type: "t", value: texture},
        operation: {type: "i", value: 0},
        scaleFactor: {type: "f", value: 1.0},
        offset: {type: "f", value: 0.0},
        resolution: {
          type: "2f",
          value: new THREE.Vector2(width, height),
        },
        ...uniformsParam,
      },
      vertexShader: iaVertexShader,
      fragmentShader: iaFragmentShader,
      side: THREE.DoubleSide,
    });
    super(height, width, imageProcessingMaterial);
  }
}

/**
 * Class GaussFilter.
 *
 * @class GaussFilter
 *
 * Class for creating a non separated offscreen rendering image gaussian filter.
 * @param {int} width  The width of the renderTarget.
 * @param {int} height The height of the renderTarget.
 * @param {Object} texture Input texture to be processed.
 * @param {Object} uniformsParam Object containing uniforms that override default material uniforms.
 * An example of a valid uniforms object to pass would be the following:
 * {sigma: {type: _"f"_, value: *5.0*},
 * kernelSize: {type: _"i"_, value: *31.0*}}
 * @extends IPFilter
 */
class GaussFilter extends IPFilter {
  constructor(height, width, texture, uniformsParam = {}) {
    let imageProcessingMaterial = new THREE.ShaderMaterial({
      uniforms: {
        image: {type: "t", value: texture},
        sigma: {type: "f", value: 1.0},
        kernelSize: {type: "i", value: 1.0},
        resolution: {
          type: "2f",
          value: new THREE.Vector2(width, height),
        },
        ...uniformsParam,
      },
      vertexShader: cgVertexShader,
      fragmentShader: cgFragmentShader,
      side: THREE.DoubleSide,
    });
    super(height, width, imageProcessingMaterial);
  }
}

/**
 * Class LaplaceFilter.
 *
 * @class LaplaceFilter
 *
 * Class for creating an offscreen rendering image laplacian filter.
 * It uses the following kernel:
 * |-1.0|-1.0| -1.0|
 * |-1.0| 8.0| -1.0|
 * |-1.0|-1.0| -1.0|
 * @param {int} width  The width of the renderTarget.
 * @param {int} height The height of the renderTarget.
 * @param {Object} texture Input texture to be processed.
 * @param {Object} uniformsParam Object containing uniforms that override default material uniforms.
 * An example of a valid uniforms object to pass would be the following:
 * {norm: {type: _"b"_, value: _true_}} // Whether to normalize or not each pixel's color
 * @extends IPFilter
 */
class LaplaceFilter extends IPFilter {
  constructor(height, width, texture, uniformsParam = {}) {
    let imageProcessingMaterial = new THREE.ShaderMaterial({
      uniforms: {
        image: {type: "t", value: texture},
        norm: {type: "b", value: false},
        resolution: {
          type: "2f",
          value: new THREE.Vector2(width, height),
        },
        ...uniformsParam,
      },
      vertexShader: clVertexShader,
      fragmentShader: clFragmentShader,
      side: THREE.DoubleSide,
    });
    super(height, width, imageProcessingMaterial);
  }
}

/**
 * Class LoGFilter.
 *
 * @class LoGFilter
 *
 * Class for creating an offscreen rendering image laplacian of gaussian filter.
 * @param {int} width  The width of the renderTarget.
 * @param {int} height The height of the renderTarget.
 * @param {Object} texture Input texture to be processed.
 * @param {Object} uniformsParam Object containing uniforms that override default material uniforms.
 * An example of a valid uniforms object to pass would be the following:
 * {sigma: {type: _"f"_, value: *5.0*},
 * kernelSize: {type: _"i"_, value: *31.0*}
 * norm: {type: _"b"_, value: _true_}} // Whether to normalize or not each pixel's color
 * @extends IPFilter
 */
class LoGFilter extends IPFilter {
  constructor(height, width, texture, uniformsParam = {}) {
    let imageProcessingMaterial = new THREE.ShaderMaterial({
      uniforms: {
        image: {type: "t", value: texture},
        sigma: {type: "f", value: 1.0},
        kernelSize: {type: "i", value: 1.0},
        norm: {type: "b", value: false},
        resolution: {
          type: "2f",
          value: new THREE.Vector2(width, height),
        },
        ...uniformsParam,
      },
      vertexShader: lgVertexShader,
      fragmentShader: lgFragmentShader,
      side: THREE.DoubleSide,
    });
    super(height, width, imageProcessingMaterial);
  }
}

/**
 * Class SGFilter.
 *
 * @class SGFilter
 *
 * Class for creating a separated offscreen rendering image gaussian filter.
 * This should be used instead of the GaussFilter class since it obtains the same result much faster.
 * @param {int} width  The width of the renderTarget.
 * @param {int} height The height of the renderTarget.
 * @param {Object} texture Input texture to be processed.
 * @param {Object} uniformsParam Object containing uniforms that override default material uniforms.
 * An example of a valid uniforms object to pass would be the following:
 * {sigma: {type: _"f"_, value: *10.0*},
 * kernelSize: {type: _"i"_, value: *61.0*}}
 * @extends IPFilter
 */
class SGFilter extends IPFilter {
  // Private class fields
  #intermediate;

  constructor(height, width, texture, uniformsParam = {}, fstPass = false) {
    let intermediateRTT = null;
    let texturePass = texture;
    // This is a shield for the first pass. If on second pass, then create a first pass intermediate
    // RTT object. If on first pass, don't create any intermediate RTT object.
    if (!fstPass) {
      intermediateRTT = new SGFilter(
        height,
        width,
        texture,
        {
          ...uniformsParam,
          firstPass: {type: "b", value: true},
        },
        (fstPass = true)
      );
      texturePass = intermediateRTT.rtt.texture;
    }
    let imageProcessingMaterial = new THREE.ShaderMaterial({
      uniforms: {
        image: {type: "t", value: texturePass},
        sigma: {type: "f", value: 1.0},
        kernelSize: {type: "i", value: 1.0},
        resolution: {
          type: "2f",
          value: new THREE.Vector2(width, height),
        },
        firstPass: {type: "b", value: false},
        ...uniformsParam,
      },
      vertexShader: sgVertexShader,
      fragmentShader: sgFragmentShader,
      side: THREE.DoubleSide,
    });
    super(height, width, imageProcessingMaterial);
    this.#intermediate = intermediateRTT;
  }

  initializeRenderer(renderer) {
    // Initialize intermediate step's renderer
    if (typeof this.#intermediate !== "undefined") {
      renderer.setRenderTarget(this.#intermediate.rtt);
      renderer.render(this.#intermediate.scene, this.#intermediate.orthoCamera);
      renderer.setRenderTarget(null);
    }
    // Initialize final step's renderer (and next filter's if any)
    super.initializeRenderer(renderer);
  }
}

/**
 * Class MedianFilter.
 *
 * @class MedianFilter
 *
 * Class for creating an offscreen rendering image nearest neighbors median filter.
 * @param {int} width  The width of the renderTarget.
 * @param {int} height The height of the renderTarget.
 * @param {Object} texture Input texture to be processed.
 * @param {Object} uniformsParam Object containing uniforms that override default material uniforms.
 * An example of a valid uniforms object to pass would be the following:
 * {kernelSize: {type: _"i"_, value: *3.0*}} // If this value is too high, it has a poor performance.
 * @extends IPFilter
 */
class MedianFilter extends IPFilter {
  constructor(height, width, texture, uniformsParam = {}) {
    let imageProcessingMaterial = new THREE.ShaderMaterial({
      uniforms: {
        image: {type: "t", value: texture},
        kernelSize: {type: "i", value: 1.0},
        resolution: {
          type: "2f",
          value: new THREE.Vector2(width, height),
        },
        ...uniformsParam,
      },
      vertexShader: mfVertexShader,
      fragmentShader: mfFragmentShader,
      side: THREE.DoubleSide,
    });
    super(height, width, imageProcessingMaterial);
  }
}

/**
 * Class CTFilter.
 *
 * @class CTFilter
 *
 * Class for creating an offscreen rendering image hue shift filter.
 * @param {int} width  The width of the renderTarget.
 * @param {int} height The height of the renderTarget.
 * @param {Object} texture Input texture to be processed.
 * @param {Object} uniformsParam Object containing uniforms that override default material uniforms.
 * An example of a valid uniforms object to pass would be the following:
 * {hueShift: {type: _"i"_, value: *30.0*}}
 * @extends IPFilter
 */
class CTFilter extends IPFilter {
  constructor(height, width, texture, uniformsParam = {}) {
    let imageProcessingMaterial = new THREE.ShaderMaterial({
      uniforms: {
        image: {type: "t", value: texture},
        hueShift: {type: "f", value: 0.0},
        resolution: {
          type: "2f",
          value: new THREE.Vector2(width, height),
        },
        ...uniformsParam,
      },
      vertexShader: ctVertexShader,
      fragmentShader: ctFragmentShader,
      side: THREE.DoubleSide,
    });
    super(height, width, imageProcessingMaterial);
  }
}

export {
  Scaling,
  IArithmetic,
  GaussFilter,
  LaplaceFilter,
  LoGFilter,
  SGFilter,
  MedianFilter,
  CTFilter,
};
