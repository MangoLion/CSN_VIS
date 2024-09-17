import Graph from "graphology";
import louvain from "graphology-communities-louvain";
import { scaleOrdinal } from "d3-scale";
import { schemeCategory10 } from "d3-scale-chromatic";
import jLayeredLabelPropagation from "./JLayeredLabelPropogation";
import jHamming from "./JHamming";
import jInfomap from "./JInfoMap";

const colorScale = scaleOrdinal(schemeCategory10);

let imapNodes = [];
let imapEdges = [];
let graph = new Graph();

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
