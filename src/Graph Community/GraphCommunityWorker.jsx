import Graph from "graphology";
import louvain from "graphology-communities-louvain";
import { scaleOrdinal } from "d3-scale";
import { schemeCategory10 } from "d3-scale-chromatic";
// import { jInfomap } from "infomap";
// import { jLayeredLabelPropagation } from "layered-label-propagation";
// import { jHamming } from "./distance-hamming";

const colorScale = scaleOrdinal(schemeCategory10);

const jLayeredLabelPropagation = (nds, edgs, gamma, steps_input) => {
  // A function expression can be stored in a variable. After it has been
  // stored this way, it can be used as a function. Functions stored in variables do not need
  // names. They are always invoked using the variable name.

  // Global Variables
  let original_graph_nodes; // Defined in the core() of the algorithm.
  let original_graph_edges; // Defined in the core() of the algorithm.
  let original_graph = {}; // Defined in the core() of the algorithm.
  let partition_init; // Defined in the core() of the algorithm. May not be used (depending on the user input).
  let steps = 0;

  // ----------------------------------------- Helpers -----------------------------------------

  function get_neighbours_of_node(graph, node) {
    if (typeof graph._assoc_mat[node] === "undefined") {
      // In case we are looking for a node not connected, the
      // function returns an empty array.
      return [];
    }
    return Object.keys(graph._assoc_mat[node]); // Returns the position of each value that exists:
    // [2,,0,0,,2] -> Array ["0", "2", "3", "5"].
  }
  // Prints an ARRAY with all neighbours of input node ID.

  function make_assoc_mat(edge_list) {
    let mat = {}; // It is not an array. It is a list:
    // Object { {source: 3, target: 5, weight: 1.5}, {source: 1, target: 2, weight: 1.99}, {source: 30, target: 2, weight: 3.14} ...}
    edge_list.forEach(function (edge) {
      mat[edge.source] = mat[edge.source] || {}; // Important because many edges share the same nodes. In
      // order to include an element in a 2D matrix, we need to 1st create a list to insert it.
      mat[edge.source][edge.target] = 1;
      mat[edge.target] = mat[edge.target] || {};
      mat[edge.target][edge.source] = 1;
    });
    return mat; // It is not an array (1 object containing others): Object { 1: Object { 2: 3 }, 2: Object { 2: 3 } }
  }
  // make_assoc_mat is used once in the core.edges (to create _assoc_mat). Do not forget even objects inside objects are key/value pairs.

  function clone(obj) {
    if (obj === null || typeof obj !== "object") return obj;

    let temp = obj.constructor();

    for (let key in obj) {
      temp[key] = clone(obj[key]);
    }

    return temp;
  }
  // Copy paste operation. This is important because: I have an object x. I'd like to copy it as object y, such that changes to y do not modify x.

  function getAllKeys(obj) {
    let values = Object.values(obj);
    let max = Math.max.apply(null, values);
    let keys = Object.keys(obj);
    let result = [];
    keys.forEach(function (key) {
      if (obj[key] === max) {
        result.push(key);
      }
    });

    return result;
  }
  // Returns an array with the keys of the maximum values present in the input object.

  function shuffle(a) {
    let j, x, i;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
    }
    return a;
  }
  // Returns the input vector but randomly shuffled.

  function counter(obj) {
    let nodes = Object.keys(obj);
    let result = {};

    nodes.forEach(function (node) {
      let com = obj[node];

      result[com] = (result[com] || 0) + 1;
    });

    return result;
  }
  // Returns an object in which each key is a different community and each value is the number of members.

  // ----------------------------------------- Algorithm -----------------------------------------
  function __init_status(graph, status, part) {
    // Aim of this function is to initialize network properties. This
    // means, attribute one different community to every node.
    // Part refers to an initial partition that may be input by the user with the initial graph data.

    // Defining Status
    status["nodes_to_com"] = {}; // Nodes linked to the communities they belong to. Key/value pairs. It takes the
    // value of -1 if a node is not assigned to a community.

    // Goal of next if condition is to update status['nodes_to_com'].
    if (typeof part === "undefined") {
      // No part input.
      graph.nodes.forEach(function (node, i) {
        status.nodes_to_com[node] = i; // Each node belongs to a different community.
      });
    } else {
      // In case there is a partition as function argument.
      graph.nodes.forEach(function (node) {
        // There are status features that are node specific.
        status.nodes_to_com[node] = part[node];
      });
    }
  }

  function __modifiedNeighCom(node, graph, status) {
    // Communities in the neighborhood of a given node.

    let weights = {};
    let neighborhood = get_neighbours_of_node(graph, node);
    let result = {};

    neighborhood.forEach(function (neighbour) {
      if (neighbour !== node) {
        let weight = graph._assoc_mat[node][neighbour] || 1; // weight is a number.
        let neighbourcom = status.nodes_to_com[neighbour];
        weights[neighbourcom] = (weights[neighbourcom] || 0) + weight; // weights is an array.
      }
    });

    let neighbourWeights = weights; // Each key corresponds to a different community. The respective value is the sum of all links
    // connecting "node" to other nodes present in the respective cluster.
    let communities = Object.keys(neighbourWeights);

    communities.forEach(function (com) {
      result[com] =
        neighbourWeights[com] -
        gamma * (counter(status.nodes_to_com)[com] - neighbourWeights[com]);
    });

    return result;
  }

  function __dominates(node, graph, status) {
    let result = __modifiedNeighCom(node, graph, status);

    return result[status.nodes_to_com[node]] === Math.max(result);
  }
  // It returns a Boolean dependent on the community the node belongs to (whether it maximizes LLP equation).

  function __dominantCommunity(node, graph, status) {
    let nrLabeledNodes = __modifiedNeighCom(node, graph, status);
    let result = getAllKeys(nrLabeledNodes);

    return result[Math.floor(Math.random() * result.length)];
  }
  // Randomly returns one of the dominant communities.

  // After inserting or removing a node from a community it is fundamental to update community ID. When node is removed, it will be placed in community -1.
  function __renumber(dict) {
    // dict = status.nodes_to_com
    let count = 0;
    let ret = clone(dict); // Function output (deep copy)
    let new_values = {};
    let dict_keys = Object.keys(dict); // Getting node IDs. {1: 1, 2: 2, 3: 3...}
    dict_keys.forEach(function (key) {
      let value = dict[key]; // Node's community.
      let new_value =
        typeof new_values[value] === "undefined" ? -1 : new_values[value];
      if (new_value === -1) {
        new_values[value] = count;
        new_value = count;
        count = count + 1;
      }
      ret[key] = new_value; // {1: , 2: , 3: ,...}
    });

    return ret; // Returns an object similar to nodes_to_com. Although, each node's community is defined in an
    // ordered way like the nodes. Every single community will come across count. Communities already identified
    // in previous nodes will be assigned to future ones.
  }

  function __algorithmIteration(graph, part_init) {
    // Layered Label Propagation iteration.

    let status = {};

    __init_status(original_graph, status, part_init);

    while (true) {
      // This cycle is not the one that removes or inserts nodes.

      let prev_nodes_to_com = status.nodes_to_com;
      let shuffledNodes = shuffle(graph.nodes);

      shuffledNodes.forEach(function (node) {
        if (__dominates(node, graph, status) === false) {
          let best_com = __dominantCommunity(node, graph, status);

          status.nodes_to_com[node] = +best_com;
        }
      });

      let next_nodes_to_com = status.nodes_to_com;

      steps++;

      if (prev_nodes_to_com === next_nodes_to_com || steps === steps_input)
        break;
    }

    return __renumber(status.nodes_to_com); // At the end, the initial number of communities decreased. Thus, a numbering update was needed.
  }

  if (nds.length > 0) {
    original_graph_nodes = nds;
    original_graph_edges = edgs; // Global variable.

    let assoc_mat = make_assoc_mat(edgs);
    original_graph = {
      // Global variable. Graph is an object with node (node), edge (edges) and weight (_assoc_mat) data.
      nodes: original_graph_nodes,
      edges: original_graph_edges,
      _assoc_mat: assoc_mat,
    };
  }

  return __algorithmIteration(original_graph, partition_init);
};

let imapNodes = [];
let imapEdges = [];
let graph = new Graph();

console.log("Worker started");

const computeGraph = (dGraphData) => {
  imapNodes = [];
  imapEdges = [];
  graph = new Graph();

  if (!dGraphData || dGraphData.length === 0) return;

  let startTime = performance.now();
  dGraphData.forEach((_, nodeIndex) => {
    if (!graph.hasNode(nodeIndex)) {
      graph.addNode(nodeIndex);
    }
    imapNodes.push(nodeIndex);
  });

  // Then add edges
  dGraphData.forEach((edges, source) => {
    edges.forEach((target) => {
      imapEdges.push({
        source,
        target,
        value: 1,
      });
      // Ensure both source and target nodes exist
      if (!graph.hasNode(target)) {
        graph.addNode(target);
      }
      if (!graph.hasEdge(source, target)) {
        graph.addEdge(source, target);
      }
    });
  });
  let endTime = performance.now();

  console.log(`Precompute Time: ${endTime - startTime}ms`);
};

const pcaKmeansStreamlineClustering = (segments, pcaDims, k) => {
  const streamlineIndices = {};
  segments.forEach((segment, idx) => {
    if (!streamlineIndices[segment.lineIDx]) {
      streamlineIndices[segment.lineIDx] = [idx, idx];
    } else {
      streamlineIndices[segment.lineIDx][1] = idx;
    }
  });

  const streamlines = Object.values(streamlineIndices);

  const avgLength = Math.round(
    streamlines.reduce((sum, s) => sum + (s[1] - s[0] + 1), 0) /
      streamlines.length
  );

  const paddedStreamlines = streamlines.map(([startIdx, endIdx]) => {
    let streamline = segments.slice(startIdx, endIdx + 1);
    let streamlineLength = streamline.length;

    let flattenedStreamline = streamline.flatMap((segment) => [
      ...segment.startPoint,
      ...segment.endPoint,
      ...segment.midPoint,
    ]);

    if (streamlineLength < avgLength) {
      const paddingSize = (avgLength - streamlineLength) * 9;
      flattenedStreamline = [
        ...flattenedStreamline,
        ...Array(paddingSize).fill(0),
      ];
    } else if (streamlineLength > avgLength) {
      flattenedStreamline = flattenedStreamline.slice(0, avgLength * 9);
    }

    return flattenedStreamline;
  });

  const pca = new PCA(paddedStreamlines);
  const reducedData = pca.predict(paddedStreamlines, {
    nComponents: pcaDims,
  });
  const reducedDataArray = Array.from(reducedData.data).map((row) =>
    Array.from(row)
  );

  let ans = kmeans.kmeans(reducedDataArray, k, { seed: seed });
  const communities = {};
  ans.clusters.forEach((cluster, streamlineIndex) => {
    const [startIdx, endIdx] = streamlines[streamlineIndex];
    for (let i = startIdx; i <= endIdx; i++) {
      communities[i] = cluster;
    }
  });

  return fillHolesInCommunities(communities);
};

self.addEventListener("message", (event) => {
  console.log("worker started");
  let { preCompute, dGraphData, segments, inputs, communityAlgorithm } =
    event.data;

  let startTime = 0;
  let endTime = 0;

  if (preCompute) {
    computeGraph(dGraphData);
    return;
  } else if (imapNodes.length === 0 || imapEdges.length === 0) {
    console.error("Precompute not done");
    computeGraph(dGraphData);
  }

  startTime = performance.now();

  // Detect communities
  let communities;
  switch (communityAlgorithm) {
    case "Louvain":
      communities = louvain(graph, {
        resolution: inputs.resolution,
        randomWalk: inputs.randomWalk,
      });
      break;
    case "Louvain-SL":
      // Step 1: Build streamline graph
      const streamlineGraph = new Graph();
      const streamlineMap = new Map(); // Map streamline index to array of segment indices

      // First, map segments to streamlines
      segments.forEach((segment, segmentIndex) => {
        const streamlineIndex = segment.lineIDx;
        if (!streamlineMap.has(streamlineIndex)) {
          streamlineMap.set(streamlineIndex, []);
        }
        streamlineMap.get(streamlineIndex).push(segmentIndex);
      });

      // Add all nodes to streamlineGraph first
      streamlineMap.forEach((_, streamlineIndex) => {
        streamlineGraph.addNode(streamlineIndex);
      });

      // Now add edges to streamlineGraph
      streamlineMap.forEach((segmentIndices, streamlineIndex) => {
        segmentIndices.forEach((segmentIndex) => {
          dGraphData[segmentIndex].forEach((neighborIndex) => {
            const neighborStreamlineIndex = segments[neighborIndex].lineIDx;
            if (streamlineIndex !== neighborStreamlineIndex) {
              if (
                !streamlineGraph.hasEdge(
                  streamlineIndex,
                  neighborStreamlineIndex
                )
              ) {
                streamlineGraph.addEdge(
                  streamlineIndex,
                  neighborStreamlineIndex
                );
              }
            }
          });
        });
      });

      // Step 2: Perform Louvain community detection on streamlineGraph
      const streamlineCommunities = louvain(streamlineGraph, {
        resolution: inputs.resolution,
        randomWalk: inputs.randomWalk,
      });

      // Step 3: Map communities back to individual segments
      communities = {};
      streamlineMap.forEach((segmentIndices, streamlineIndex) => {
        const communityId = streamlineCommunities[streamlineIndex];
        segmentIndices.forEach((segmentIndex) => {
          communities[segmentIndex] = communityId;
        });
      });
      break;
    case "PCA":
      communities = pcaKmeansStreamlineClustering(
        segments,
        inputs.dims,
        inputs.kmean
      );
      break;
    case "Infomap":
      communities = jInfomap(imapNodes, imapEdges, inputs.min);
      break;
    case "Hamming Distance":
      communities = jHamming(nodes, links, inputs.min);
      break;
    case "Label Propagation":
      communities = jLayeredLabelPropagation(
        imapNodes,
        imapEdges,
        inputs.gamma,
        inputs.max
      );
      break;
    case "Blank":
      communities = Array.from({ length: segments.length }, (_, i) => [
        i,
        0,
      ]).reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
      break;
  }

  endTime = performance.now();

  console.log(`Comm detect time:${endTime - startTime}ms`);

  startTime = performance.now();

  ///color all!!
  Object.entries(communities).forEach(([nodeId, communityIndex]) => {
    const color = colorScale(communityIndex.toString());
    //console.log(`Node ${nodeId}: Community ${communityIndex} Color: ${color}`);
    if (!segments[parseInt(nodeId)]) console.log(nodeId);
    else segments[parseInt(nodeId)].color = color;
    //setSegmentsSelected(segments)
  });
  //CHECKKKKK!!!

  const communityGraph = new Graph(); // This will store the community graph
  // Process communities, creating nodes for each community and counting sizes
  Object.entries(communities).forEach(([node, community]) => {
    if (!segments[parseInt(node)]) return;
    if (!communityGraph.hasNode(community)) {
      communityGraph.addNode(community, { size: 1 });
    } else {
      communityGraph.updateNodeAttribute(community, "size", (size) => size + 1);
    }
  });

  // Now, let's prepare dGraphData for visualization
  const nodes = communityGraph.nodes().map((node) => ({
    id: node,
    size: communityGraph.getNodeAttribute(node, "size") / 2,
  }));

  // After computing community sizes but before setting the graphData:
  const scaleFactor = 0.02; // Adjust this scaling factor as needed
  const scaledNodes = nodes.map((node) => ({
    ...node,
    size: node.size * scaleFactor,
  }));

  console.log("NODE SIZE: ", nodes[0].size * scaleFactor);

  // Assign a color to each community node
  const nodesWithColors = scaledNodes.map((node) => ({
    ...node,
    color: colorScale(node.id.toString()), // Convert node id to string for the scale function
  }));

  // No edges between communities are added for now,
  // as we don't have the information about inter-community connections here.
  // You might need additional logic to determine and add these connections if needed.

  // Detected communities: communities (a mapping of node -> community)

  console.log("CHECKPOINT1");

  // Use a set to store unique inter-community links in the format "smaller_larger" to ensure uniqueness
  const interCommunityLinksSet = new Set();

  dGraphData.forEach((edges, source) => {
    edges.forEach((target) => {
      const sourceCommunity = communities[source];
      const targetCommunity = communities[target];

      // Check if communities are different, now including community 0
      if (sourceCommunity !== targetCommunity) {
        // Ensure a consistent order for the pair to avoid duplicate entries in set
        const sortedPair = [sourceCommunity, targetCommunity].sort().join("_");
        interCommunityLinksSet.add(sortedPair);
      }
    });
  });

  // Convert the set back to an array of objects for further processing or output
  let interCommunityLinks = Array.from(interCommunityLinksSet).map((pair) => {
    const [source, target] = pair.split("_");
    return { source, target };
  });
  console.log("CHECKPOINT2");
  // Deduplicate the links
  const linkPairs = new Set();
  interCommunityLinks = interCommunityLinks.filter((link) => {
    const sortedPair = [link.source, link.target].sort().join("_");
    if (linkPairs.has(sortedPair)) {
      return false;
    } else {
      linkPairs.add(sortedPair);
      return true;
    }
  });
  console.log("CHECKPOINT3");
  const communityMembers = {};
  Object.entries(communities).forEach(([originalNode, communityId]) => {
    if (!segments[parseInt(originalNode)]) return;

    if (!communityMembers[communityId]) {
      communityMembers[communityId] = [];
    }
    communityMembers[communityId].push(parseInt(originalNode, 10));
  });

  const nodesWithCommunityMembers = nodesWithColors.map((node) => ({
    ...node,
    members: communityMembers[node.id] || [],
    groupID: [],
  }));

  endTime = performance.now();

  self.postMessage({
    nodesWithCommunityMembers: nodesWithCommunityMembers,
    interCommunityLinks: interCommunityLinks,
    segments: segments,
    communities: communities,
  });
});
