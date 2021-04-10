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
  #nodes;
  #lastNode;
  #subGraphs;

  constructor(height, width, inputTexture) {
    this.#height = height;
    this.#width = width;
    this.#texture = inputTexture;
    this.#lastNode = null;
    this.#nodes = [];
    this.#subGraphs = [];
  }

  // Node adding. Essentially a strategy pattern. 
  addNode(IPNode, uniforms) {
    let tex = this.#texture;
    let filterNode = new IPNode(this.#height, this.#width, tex, uniforms);
    this.#nodes.push(filterNode);
    this.#texture = filterNode.rtt.texture;
    this.#lastNode = filterNode;
    return this;
  }

  // Renderer initialization. Essentially an observer pattern.
  initializeRenderer(renderer) {
    // Initialize graph's nodes
    this.#nodes.forEach(node => node.initializeRenderer(renderer));
    // Initialize graph's subGraphs
    this.#subGraphs.forEach(subGraph => subGraph.initializeRenderer(renderer));
  }

  // Subscribe sub graphs for initialization
  subscribeSubGraph(subGraph) {
    this.#subGraphs.push(subGraph);
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
