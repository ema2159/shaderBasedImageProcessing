import * as THREE from "https://unpkg.com/three/build/three.module.js";
import {scVertexShader, scFragmentShader} from "./shaders/SCshaders.js";
import {iaVertexShader, iaFragmentShader} from "./shaders/IAshaders.js";
import {cgVertexShader, cgFragmentShader} from "./shaders/CGshaders.js";
import {clVertexShader, clFragmentShader} from "./shaders/CLshaders.js";
import {lgVertexShader, lgFragmentShader} from "./shaders/LoGshaders.js";
import {sgVertexShader, sgFragmentShader} from "./shaders/SGshaders.js";

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

    this.material = imageProcessingMaterial;

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
	  [ 0,0, 1,0, 1,1, 0,0, 1,1, 0,1 ]
        ),
        2
      )
    );
    this.scene.add(new THREE.Mesh(geom, imageProcessingMaterial));

  }

  initializeRenderer(renderer) {
    renderer.setRenderTarget(this.rtt);
    renderer.render(this.scene, this.orthoCamera);
    renderer.setRenderTarget(null);
  }

  getMaterial() {
    return this.material;
  }
}

/**
 * Class Scaling.
 *
 * @class Scaling
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
 */
class IArithmetic extends IPFilter {
  constructor(height, width, texture, texture2, uniformsParam = {}) {
    let imageProcessingMaterial = new THREE.ShaderMaterial({
      uniforms: {
        scale: {type: "f", value: 1.0},
        centerX: {type: "f", value: 0.0},
        centerY: {type: "f", value: 0.0},
        image: {type: "t", value: texture},
        image2: {type: "t", value: texture2},
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
 */
class SGFilter extends IPFilter {
  constructor(height, width, texture, uniformsParam = {}, fstPass = false) {
    let intermediateRTT;
    let texturePass = texture;
    // This is a shield for the first pass. If on second pass, then create a first pass intermediate
    // RTT object. If on first pass, don't create any intermediate RTT object.
    if (!fstPass) {
      intermediateRTT = new SGFilter(
        height,
        width,
        texture,
        {
          sigma: {type: "f", value: 1.0},
          kernelSize: {type: "i", value: 1.0},
          resolution: {
            type: "2f",
            value: new THREE.Vector2(width, height),
          },
          firstPass: {type: "b", value: true},
          ...uniformsParam,
        },
	fstPass = true
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
    this.intermediate = intermediateRTT;
  }

  initializeRenderer(renderer) {
    renderer.setRenderTarget(this.rtt);
    renderer.render(this.scene, this.orthoCamera);
    renderer.setRenderTarget(null);
    if(typeof this.intermediate !== 'undefined') {
      renderer.setRenderTarget(this.intermediate.rtt);
      renderer.render(this.intermediate.scene, this.intermediate.orthoCamera);
      renderer.setRenderTarget(null);
    }
  }
}

export {Scaling, IArithmetic, GaussFilter, LaplaceFilter, LoGFilter, SGFilter};
