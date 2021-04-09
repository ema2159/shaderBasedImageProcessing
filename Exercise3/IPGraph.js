/**
 * Abstract Class IPGraph.
 *
 * @class IPGraph
 */
class IPGraph {
  // Private class fields
  #height;
  #width;
  #texture;
  #lastNode;

  constructor(height, width, inputTexture) {
    this.#height = height;
    this.#width = width;
    this.#texture = inputTexture;
    this.#lastNode = null;
  }

  addNode(IPNode, uniforms) {
    let tex = this.#texture;
    let filterNode = new IPNode(this.#height, this.#width, tex, uniforms);
    this.#texture = filterNode.rtt.texture;
    this.#lastNode = filterNode;
    return this;
  }

  // Getter functions
  get outputTexture() {
    return this.#texture;
  }

  get outputMaterial() {
    return this.#lastNode.material;
  }
}

export default IPGraph;
