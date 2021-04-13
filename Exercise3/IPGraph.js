/**
 * Class IPGraph.
 *
 * @class IPGraph
 * This class implements an image procecssing graph over an input texture.
 * @param {int} height       Height of the input texture.
 * @param {int} width        Width of the input texture.
 * @param {int} inputTexture Input texture.
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

  /**
   * Method for adding an image processing node at the end of the graph.
   * Implemented utilizing an strategy design pattern.
   * @param  {IPFilter} IPNode   Image processing filter to add to the graph.
   * @param  {Object}   uniforms Object containing the uniforms to override default node uniforms.
   * @return {IPGraph}  Implements a fluid API. Returns _this_.
   */
  addNode(IPNode, uniforms) {
    let tex = this.#texture;
    let filterNode = new IPNode(this.#height, this.#width, tex, uniforms);
    this.#nodes.push(filterNode);
    this.#texture = filterNode.rtt.texture;
    this.#lastNode = filterNode;
    return this;
  }

  /**
   * Method for initializing graph's objects' offscreen renderer.
   * It initializes each node in the graph and also the sub-graphs attached
   * Implemented utilizing an observer design pattern.
   * @param  {Object} renderer Scene's renderer.
   */
  initializeRenderer(renderer) {
    // Initialize graph's nodes
    this.#nodes.forEach(node => node.initializeRenderer(renderer));
    // Initialize graph's subGraphs
    this.#subGraphs.forEach(subGraph => subGraph.initializeRenderer(renderer));
  }

  /**
   * Method for subscribing a sub-graph to the current image processing graph.
   * When the sub-graph is subscribed, its renderer will be initialized when the current graph's
   * renderer is initialized.
   * @param {Object} subGraph Sub-grahp to subscribe.
   * @return {IPGraph}  Implements a fluid API. Returns _this_.
   */
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
