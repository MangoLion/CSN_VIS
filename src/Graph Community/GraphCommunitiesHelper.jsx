import convexHull from "convex-hull";
const kmeans = require("ml-kmeans");
import { PCA } from "ml-pca";
import Graph from "graphology";

export const fillHolesInCommunities = (communities) => {
  const sortedKeys = Object.keys(communities)
    .map(Number)
    .sort((a, b) => a - b);
  const newCommunities = {};
  let gapCount = 0;

  for (let i = 0; i < sortedKeys.length; i++) {
    // Check if there is a hole
    if (i > 0 && sortedKeys[i] !== sortedKeys[i - 1] + 1) {
      gapCount += sortedKeys[i] - sortedKeys[i - 1] - 1;
    }
    newCommunities[sortedKeys[i] - gapCount] = communities[sortedKeys[i]];
  }

  return newCommunities;
};

export const pcaKmeansStreamlineClustering = (segments, pcaDims, k) => {
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

export const pcaKmeansCommunityDetection = (segments, pcaDims, k) => {
  // Step 1: Prepare data for PCA with new feature extraction
  const data = segments.map((segment) => {
    const length = Math.sqrt(
      Math.pow(segment.endPoint[0] - segment.startPoint[0], 2) +
        Math.pow(segment.endPoint[1] - segment.startPoint[1], 2) +
        Math.pow(segment.endPoint[2] - segment.startPoint[2], 2)
    );
    const direction = [
      (segment.endPoint[0] - segment.startPoint[0]) / length,
      (segment.endPoint[1] - segment.startPoint[1]) / length,
      (segment.endPoint[2] - segment.startPoint[2]) / length,
    ];
    return [length, ...direction, ...segment.midPoint];
  });

  // Step 2: Apply PCA
  const pca = new PCA(data);
  const reducedData = pca.predict(data, { nComponents: pcaDims });
  const reducedDataArray = Array.from(reducedData.data).map((row) =>
    Array.from(row)
  );
  // Step 3: Apply KMeans
  console.log(reducedDataArray);
  let ans = kmeans.kmeans(reducedDataArray, k);
  //const clusters = kmeans.predict(reducedData);

  // Step 4: Assign clusters to segments
  const communities = {};
  ans.clusters.forEach((cluster, index) => {
    const segmentIdx = segments[index].globalIdx; // Assuming globalIdx uniquely identifies a segment
    communities[segmentIdx] = cluster;
  });

  return fillHolesInCommunities(communities);
};

export const getFirstNKeys = (obj, n) => {
  const result = {};
  for (let i = 0; i < n; i++) {
    if (obj.hasOwnProperty(i)) {
      result[i] = obj[i];
    }
  }
  return result;
};

/**
 * Creates a graph from a given data array.
 * @param {Array<Array<number>>} data - An array of number arrays representing the edges of the graph.
 * @returns {Graph} The created graph.
 */
export const createGraph = (data) => {
  const preprocessData = (data) => {
    const nodesSet = new Set();
    const edges = [];

    data.forEach((edgeList, source) => {
      nodesSet.add(source);
      edgeList.forEach((target) => {
        nodesSet.add(target);
        edges.push({ source, target });
      });
    });

    const nodes = Array.from(nodesSet);
    const nodeCount = nodes.length;
    const nodeMap = new Map(nodes.map((node, index) => [node, index]));
    const typedEdges = new Uint32Array(edges.length * 2);

    edges.forEach(({ source, target }, index) => {
      typedEdges[index * 2] = nodeMap.get(source);
      typedEdges[index * 2 + 1] = nodeMap.get(target);
    });

    return { nodes, typedEdges, nodeCount };
  };

  const { nodes, typedEdges } = preprocessData(data);

  const startTime = performance.now();

  const graph2 = new Graph();
  graph2.import({
    nodes: nodes.map((node) => ({ key: node })),
    edges: Array.from({ length: typedEdges.length / 2 }, (_, i) => ({
      source: typedEdges[i * 2],
      target: typedEdges[i * 2 + 1],
    })),
  });

  const endTime = performance.now();
  console.log(`Graph creation took ${endTime - startTime} milliseconds.`);

  return graph2;
};

export const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};
