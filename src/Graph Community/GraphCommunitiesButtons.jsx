import React, { useContext } from "react";
import { GraphCommunityWorkerInstance } from "./GraphCommunityWorkerInstance";
import { Button, Box, ToggleButton, Tooltip } from "@mui/material";
import UndoIcon from "@mui/icons-material/Undo";
import CallSplitIcon from "@mui/icons-material/CallSplit";
import CallMergeIcon from "@mui/icons-material/CallMerge";

import { GraphCommunitiesDataContext } from "../context/GraphCommunitiesDataContext";
import { UniversalDataContext } from "../context/UniversalDataContext";

const GraphCommunitiesButtons = () => {
  const { segments, selectedSegments } = useContext(UniversalDataContext);
  const {
    setGraphData,
    setOrgCommunities,
    multiSelect,
    setMultiSelect,
    setAllGroups,
    selectedNodes,
    undoState,
    setUndoState,
    communityAlgorithm,
    dGraphData,
    graphData,
    orgCommunities,
    inputs,
    allGroups,
  } = useContext(GraphCommunitiesDataContext);

  const handleUndo = (data = false) => {
    if (!undoState) return;
    if (!data) data = undoState;
    else setUndoState(data);

    const undo = JSON.parse(data);
    setGraphData(undo.graphData);
    setOrgCommunities(undo.orgCommunities);
    setMultiSelect(undo.multiSelect);
    setAllGroups(undo.allGroups);
    setUndoState(undo.prevUndo);
  };

  const handleSplitCommunity = (splitInto = null) => {
    GraphCommunityWorkerInstance.addEventListener(
      "message",
      splitCommunityCallback,
      false
    );
    GraphCommunityWorkerInstance.postMessage({
      functionType: "splitCommunity",
      communityAlgorithm: communityAlgorithm,
      dGraphData: dGraphData,
      graphData: graphData,
      splitInto: splitInto,
      selectedSegments: selectedSegments,
      orgCommunities: orgCommunities,
      selectedNodes: selectedNodes,
      inputs: inputs,
      segments: segments,
    });
  };

  const splitCommunityCallback = (event) => {
    GraphCommunityWorkerInstance.removeEventListener(
      "message",
      splitCommunityCallback
    );
    const { newGroups, newOrgCommunities, newGraphData } = event.data;
    saveUndo();
    updateGroups(newGroups);
    setOrgCommunities(newOrgCommunities);
    setGraphData(newGraphData);
  };

  const handleMergeCommunity = () => {
    GraphCommunityWorkerInstance.addEventListener(
      "message",
      mergeCommunityCallback,
      false
    );
    GraphCommunityWorkerInstance.postMessage({
      functionType: "mergeCommunity",
      graphData: graphData,
      selectedNodes: selectedNodes,
      orgCommunities: orgCommunities,
    });
  };

  const mergeCommunityCallback = (event) => {
    GraphCommunityWorkerInstance.removeEventListener(
      "message",
      mergeCommunityCallback
    );
    const { newGraphData, newOrgCommunities, newNodes } = event.data;
    saveUndo();
    setOrgCommunities(newOrgCommunities);
    setGraphData(newGraphData);
    updateGroups(newNodes);
  };

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
      prevUndo: undoState,
      graphData: sGraphData,
      orgCommunities,
      selectedNodes,
      multiSelect,
      allGroups,
    };

    setUndoState(JSON.stringify(undo));
  };

  const updateGroups = (nodes) => {
    const groups = {};

    nodes.forEach((node) => {
      if (Array.isArray(node.groupID)) {
        //console.log(node.groupID)
        node.groupID = [...new Set(node.groupID)];
        node.groupID.forEach((groupID) => {
          if (groups.hasOwnProperty(groupID)) {
            groups[groupID]++; // Increment the frequency if the key exists
          } else {
            groups[groupID] = 1; // Initialize the frequency if the key doesn't exist
          }
        });
      }
    });

    computeSizes(nodes);
    setAllGroups(groups);
    return groups;
  };

  const computeSizes = (nodes) => {
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

  return (
    <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
      <Tooltip title="Toggle Selecting Multiple Nodes">
        <span>
          <ToggleButton
            value="check"
            selected={multiSelect}
            onChange={() => setMultiSelect(!multiSelect)}
            color="primary"
            disabled={!graphData.nodes || graphData.nodes.length === 0}
          >
            Multi Select
          </ToggleButton>
        </span>
      </Tooltip>
      <Tooltip title="Undo to Previous State">
        <span>
          <Button
            component="label"
            variant="contained"
            tabIndex={-1}
            startIcon={<UndoIcon />}
            onClick={() => handleUndo()}
            disabled={!undoState}
          >
            Undo
          </Button>
        </span>
      </Tooltip>
      <Tooltip title="Split the Selected Node (Must only have One Node Selected)">
        <span>
          <Button
            component="label"
            variant="contained"
            tabIndex={-1}
            startIcon={<CallSplitIcon />}
            onClick={() => handleSplitCommunity()}
            disabled={selectedNodes.length !== 1}
          >
            Split
          </Button>
        </span>
      </Tooltip>
      <Tooltip title="Merge the Selected Nodes (Must only have More than One Node Selected)">
        <span>
          <Button
            component="label"
            variant="contained"
            tabIndex={-1}
            startIcon={<CallMergeIcon />}
            onClick={() => handleMergeCommunity()}
            disabled={selectedNodes.length < 2}
          >
            Merge
          </Button>
        </span>
      </Tooltip>
    </Box>
  );
};

export default GraphCommunitiesButtons;
