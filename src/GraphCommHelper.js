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

export const drawHullOnCanvas = (points, ctx, color, stretchFactor = 1.5) => {
  points = JSON.parse(JSON.stringify(points)); //deepcopy
  if (points.length < 3 || !points[0]) return;
  let hullIndices = convexHull(points);

  let hull = hullIndices.map((edge) => {
    // edge is a pair of indices, like [0, 1]
    return points[edge[0]]; //[points[edge[0]], points[edge[1]]];
  });

  //console.log(hull)

  // Compute the centroid of the convex hull
  //const centroid = d3.polygonCentroid(hull);
  const centroid = calculateCentroid(hull);
  //console.log(centroid)
  //console.log(centroid)

  // Create a new hull array with points moved away from the centroid
  const expandedHull = hull.map((point) => {
    const vector = [point[0] - centroid[0], point[1] - centroid[1]];
    //console.log(`${point} ${vector} ${centroid}`)
    return [
      centroid[0] + vector[0] * stretchFactor,
      centroid[1] + vector[1] * stretchFactor,
    ];
  });

  hull = expandedHull;
  // Add first point at the end to close the loop for Bezier curves
  hull.push(hull[0]);

  ctx.beginPath();
  for (let i = 0; i < hull.length; i++) {
    const startPt = hull[i];
    const endPt = hull[(i + 1) % hull.length];
    const midPt = [(startPt[0] + endPt[0]) / 2, (startPt[1] + endPt[1]) / 2];

    if (i === 0) {
      // Move to the first midpoint
      ctx.moveTo(midPt[0], midPt[1]);
    } else {
      // Draw quadratic Bezier curve from previous midpoint
      const prevMidPt = [
        (hull[i - 1][0] + startPt[0]) / 2,
        (hull[i - 1][1] + startPt[1]) / 2,
      ];
      ctx.quadraticCurveTo(startPt[0], startPt[1], midPt[0], midPt[1]);
    }
  }

  // Close the path for the last curve
  const lastMidPt = [
    (hull[hull.length - 1][0] + hull[0][0]) / 2,
    (hull[hull.length - 1][1] + hull[0][1]) / 2,
  ];
  ctx.quadraticCurveTo(hull[0][0], hull[0][1], lastMidPt[0], lastMidPt[1]);

  ctx.closePath();

  // Set the style for the dashed line
  ctx.setLineDash([5, 5]); // Sets up the dash pattern, adjust the numbers for different patterns
  ctx.strokeStyle = "rgba(0, 0, 0, 0.7)"; // Color for the dashed line
  ctx.lineWidth = 1; // Width of the dashed line
  ctx.stroke(); // Apply the line style to the hull

  ctx.fillStyle = color; //'rgba(150, 150, 250, 0.1)'; // Fill color
  ctx.fill();

  // Reset the dashed line to default for any subsequent drawing
  ctx.setLineDash([]);

  return centroid;
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

export const computeSizes = (nodes) => {
  // Find min and max number of members
  let minMembers = Infinity,
    maxMembers = -Infinity;
  nodes.forEach((node) => {
    minMembers = Math.min(minMembers, node.members.length);
    maxMembers = Math.max(maxMembers, node.members.length);
  });

  // Define the log base - using e (natural logarithm) for simplicity
  const logBase = Math.E;

  // Function to calculate size based on members count
  const logScaleSize = (membersCount, a, b) => {
    return a + (b * Math.log(membersCount)) / Math.log(logBase);
  };

  // Calculate constants a and b for the scale
  // Solve for a and b using the equations for min and max members
  const b = 9 / (Math.log(maxMembers) - Math.log(minMembers)); // (10 - 1) = 9 is the range of sizes
  const a = 1 - b * Math.log(minMembers);

  // Calculate and assign sizes
  nodes.forEach((node) => {
    node.size = logScaleSize(node.members.length, a, b);
    // Ensure size is within bounds
    node.size = Math.max(1, Math.min(node.size, 10));
  });

  return nodes;
};

export const calculateCentroid = (pts) => {
  //console.log(pts)
  let firstPoint = pts[0],
    lastPoint = pts[pts.length - 1];
  if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1])
    pts.push(firstPoint);
  let twiceArea = 0,
    x = 0,
    y = 0,
    nPts = pts.length,
    p1,
    p2,
    f;

  for (let i = 0, j = nPts - 1; i < nPts; j = i++) {
    p1 = pts[i];
    p2 = pts[j];
    f = p1[0] * p2[1] - p2[0] * p1[1];
    twiceArea += f;
    x += (p1[0] + p2[0]) * f;
    y += (p1[1] + p2[1]) * f;
  }
  f = twiceArea * 3;
  return [x / f, y / f];
};
