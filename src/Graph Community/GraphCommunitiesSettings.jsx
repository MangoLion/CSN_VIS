import React, { useState, useEffect } from "react";

import seedrandom from "seedrandom";

import {
  CustomNumberInput,
  CustomCheckBox,
  CustomSelect,
} from "../components/CustomComponents";
import {
  Box,
  Typography,
  Grid2,
  Button,
  CircularProgress,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

const GraphCommunityWorker = new Worker(
  new URL("./GraphCommunityWorker.jsx", import.meta.url),
  { type: "module" }
);
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
  selectedNode,
  selectedNodes,
  communityAlgorithm,
  setCommunityAlgorithm,
  graphData,
  setGraphData,
  setColoredSegments,
}) => {
  const [undoState, setUndoState] = useState(false);
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
  const [allGroups, setAllGroups] = useState([]);
  const [running, setRunning] = useState(false);

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

  useEffect(() => {
    GraphCommunityWorker.postMessage({
      preCompute: true,
      dGraphData: dGraphData,
      segments: segments,
      inputs: inputs,
      communityAlgorithm: communityAlgorithm,
    });
  }, [dGraphData]);

  const handleStart = async () => {
    // Check if the graph is empty
    if (isEmpty) return; // Do not attempt to plot if the graph is empty

    GraphCommunityWorker.addEventListener(
      "message",
      GraphCommunityFunction,
      false
    );
    GraphCommunityWorker.postMessage({
      preCompute: false,
      dGraphData: dGraphData,
      segments: segments,
      inputs: inputs,
      communityAlgorithm: communityAlgorithm,
    });

    setRunning(true);
  };

  const GraphCommunityFunction = (event) => {
    setRunning(false);

    GraphCommunityWorker.removeEventListener("message", GraphCommunityFunction);
    setColoredSegments(event.data.segments);
    setOrgCommunities(event.data.communities);
    setGraphData({
      //nodes,
      nodes: event.data.nodesWithCommunityMembers,
      links: event.data.interCommunityLinks, //[], // No inter-community links for this simplified visualization
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

  useEffect(() => {
    setIsEmpty(dGraphData.every((arr) => arr.length === 0));
  }, [dGraphData]);

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
          <Grid2 size={6}>
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
          <Grid2 size={6}>{renderInputs()}</Grid2>
        </Grid2>

        <Grid2 container size={12} spacing={2}>
          <Grid2 size={4.5}></Grid2>
          <Grid2
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
              disabled={multiSelect || isEmpty}
              sx={{ flexGrow: 1 }}
              onClick={handleStart}
            >
              Start
            </Button>
          </Grid2>
          <Grid2
            size={4.5}
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              justifyContent: "center",
            }}
          >
            {running && <CircularProgress size={20} />}
          </Grid2>
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default GraphCommunitiesSettings;
