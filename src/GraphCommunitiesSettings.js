import React, { useState, useEffect } from "react";

import seedrandom from "seedrandom";
import Graph from "graphology";
import louvain from "graphology-communities-louvain";
import { scaleOrdinal } from "d3-scale";
import { schemeCategory10 } from "d3-scale-chromatic"; // Or any other D3 color scheme

import {
  CustomNumberInput,
  CustomCheckBox,
  CustomSelect,
} from "./components/CustomComponents";
import { Box, Typography, Grid2, Button } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

const GraphCommunitiesSettings = ({
  segments,
  setSegmentsSelected,
  multiSelect,
  setMultiSelect,
  nodeScale,
  setNodeScale,
  dGraphData,
  setDGraphData,
  isEmpty,
  setIsEmpty,
}) => {
  const [undoState, setUndoState] = useState(false);
  const [communityAlgorithm, setCommunityAlgorithm] = useState("Louvain");
  const [seed, setSeed] = useState(1);
  const [inputs, setInputs] = useState({
    resolution: 1,
    randomWalk: false,
    min: 0.01,
    gamma: 0.1,
    max: 10,
    dims: 5,
    kmean: 8,
  });
  const [orgCommunities, setOrgCommunities] = useState({
    nodes: [],
    links: [],
  });
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const colorScale = scaleOrdinal(schemeCategory10);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [allGroups, setAllGroups] = useState([]);

  const saveUndo = () => {
    const nlinks = graphData.links.map((obj) => ({
      source: obj.source.id,
      target: obj.target.id,
    }));

    const sGraphData = {
      nodes: graphData.nodes,
      links: nlinks,
    };

    const undo = {
      graphData: sGraphData,
      orgCommunities,
      isEmpty,
      selectedNode,
      selectedNodes,
      multiSelect,
      allGroups,
    };

    setUndoState(JSON.stringify(undo));
  };

  const handleStart = () => {
    // Check if the graph is empty
    const isEmptyGraph = dGraphData.every((arr) => arr.length === 0);
    setIsEmpty(isEmptyGraph);

    if (isEmptyGraph) {
      console.log("Graph is empty, nothing to layout.");
      return; // Do not attempt to plot if the graph is empty
    }

    const graph = new Graph(); // Create a graph
    const communityGraph = new Graph(); // This will store the community graph
    const communitySizes = {}; // To store the size of each community

    const imapNodes = [];
    const imapEdges = [];

    let startTime = performance.now();
    //console.log(segments);
    // Add nodes first
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

    console.log(`Graph1 build time: ${endTime - startTime}ms`);

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
        communities = infomap.jInfomap(imapNodes, imapEdges, inputs.min);
        break;
      case "Hamming Distance":
        communities = hamming.jHamming(nodes, links, inputs.min);
        break;
      case "Label Propagation":
        communities = llp.jLayeredLabelPropagation(
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

    const comms = {};
    Object.keys(communities).forEach((k) => {
      comms[communities[k]] = 1;
    });
    console.log("NUM COMMUNITIES: ", Object.keys(comms).length);

    console.log("comms:", communities);

    setOrgCommunities(communities);

    ///color all!!
    Object.entries(communities).forEach(([nodeId, communityIndex]) => {
      const color = colorScale(communityIndex.toString());
      //console.log(`Node ${nodeId}: Community ${communityIndex} Color: ${color}`);
      if (!segments[parseInt(nodeId)]) console.log(nodeId);
      else segments[parseInt(nodeId)].color = color;
      //setSegmentsSelected(segments)
    });
    //CHECKKKKK!!!
    setSegmentsSelected(segments);

    // Process communities, creating nodes for each community and counting sizes
    Object.entries(communities).forEach(([node, community]) => {
      if (!segments[parseInt(node)]) return;
      if (!communityGraph.hasNode(community)) {
        communityGraph.addNode(community, { size: 1 });
      } else {
        communityGraph.updateNodeAttribute(
          community,
          "size",
          (size) => size + 1
        );
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
          const sortedPair = [sourceCommunity, targetCommunity]
            .sort()
            .join("_");
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

    //console.log("nodesWithCommunityMembers: ",nodesWithCommunityMembers)

    setDGraphData({
      //nodes,
      nodes: nodesWithCommunityMembers,
      links: interCommunityLinks, //[], // No inter-community links for this simplified visualization
    });

    saveUndo();
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setInputs({
      ...inputs,
      [name]: type === "checkbox" ? checked : parseFloat(value),
    });
  };

  const renderInputs = () => {
    switch (communityAlgorithm) {
      case "Louvain":
      case "Louvain-SL":
        return (
          <>
            <CustomNumberInput
              name={"Resolution"}
              onChange={handleInputChange}
              defaultValue={inputs.resolution}
            />
            <CustomCheckBox
              name={"Random Walk"}
              onChange={handleInputChange}
              defaultValue={inputs.randomWalk}
            />
          </>
        );
      case "PCA":
        return (
          <>
            <CustomNumberInput
              name={"Dims"}
              onChange={handleInputChange}
              defaultValue={inputs.dims}
            />

            <CustomNumberInput
              name={"K Means"}
              onChange={handleInputChange}
              defaultValue={inputs.kmean}
            />
          </>
        );
      case "Infomap":
        return (
          <CustomNumberInput
            name={"Min"}
            onChange={handleInputChange}
            defaultValue={inputs.min}
          />
        );
      case "Hamming Distance":
        return (
          <CustomNumberInput
            name={"Min"}
            onChange={handleInputChange}
            defaultValue={inputs.min}
          />
        );
      case "Blank":
        return <></>;
      case "Label Propagation":
        return (
          <>
            <CustomNumberInput
              name={"Gamma"}
              onChange={handleInputChange}
              defaultValue={inputs.gamma}
            />
            <CustomNumberInput
              name={"Max"}
              onChange={handleInputChange}
              defaultValue={inputs.max}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid2 container spacing={1}>
        <Typography sx={{ fontWeight: "bold" }}>
          Graph Community Settings
        </Typography>

        <Grid2 container size={12} spacing={2}>
          <Grid2 item size={6}>
            <CustomSelect
              name={"Community Algorithm"}
              onChange={(e) => setCommunityAlgorithm(e.target.value)}
              defaultValue={communityAlgorithm}
              options={[
                { value: "Louvain", label: "Louvain" },
                { value: "Louvain-SL", label: "Louvain-SL" },
                { value: "PCA", label: "PCA K-Means" },
                { value: "Infomap", label: "Infomap" },
                {
                  value: "Label Propagation",
                  label: "Label Propagation",
                },
                { value: "Hamming Distance", label: "Hamming Distance" },
                { value: "Blank", label: "Blank" },
              ]}
            />
            <CustomNumberInput
              name={"Node Scale"}
              onChange={(e) => setNodeScale(Number(e.target.value))}
              defaultValue={nodeScale}
            />
            <CustomNumberInput
              name={"Seed"}
              onChange={(e) => {
                setSeed(Number(e.target.value));
                seedrandom(seed, { global: true });
              }}
              defaultValue={seed}
            />
          </Grid2>
          <Grid2 item size={6}>
            {renderInputs()}
          </Grid2>
        </Grid2>

        <Grid2 container size={12} spacing={2}>
          <Grid2 item size={4.5}></Grid2>
          <Grid2
            item
            size={3}
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <Button
              component="label"
              variant="contained"
              tabIndex={-1}
              startIcon={<PlayArrowIcon />}
              fullWidth
              disabled={multiSelect}
              sx={{ flexGrow: 1 }}
              onClick={handleStart}
            >
              Start
            </Button>
          </Grid2>
          <Grid2 item size={4.5}></Grid2>
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default GraphCommunitiesSettings;
