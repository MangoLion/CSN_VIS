import React, { useState, useEffect, useContext } from "react";

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
import { LoadingButton } from "@mui/lab";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { UniversalDataContext } from "../context/UniversalDataContext";
import { GraphCommunitiesDataContext } from "../context/GraphCommunitiesDataContext";
import { GraphCommunityWorkerInstance } from "./GraphCommunityWorkerInstance";

const GraphCommunitiesSettings = () => {
  const {
    nodeScale,
    setNodeScale,
    dGraphData,
    isEmpty,
    setIsEmpty,
    communityAlgorithm,
    setCommunityAlgorithm,
    setGraphData,
    setUndoState,
    setOrgCommunities,
    seed,
    setSeed,
    inputs,
    setInputs,
  } = useContext(GraphCommunitiesDataContext);
  const { segments } = useContext(UniversalDataContext);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    GraphCommunityWorkerInstance.postMessage({
      functionType: "preCompute",
      dGraphData: dGraphData,
    });
  }, [dGraphData]);

  const handleStart = async () => {
    if (isEmpty) return; // Do not attempt to plot if the graph is empty

    GraphCommunityWorkerInstance.addEventListener(
      "message",
      createGraphCallback,
      false
    );
    GraphCommunityWorkerInstance.postMessage({
      functionType: "createGraph",
      dGraphData: dGraphData,
      segments: segments,
      inputs: inputs,
      communityAlgorithm: communityAlgorithm,
      seed: seed,
    });

    setRunning(true);
  };

  const createGraphCallback = (event) => {
    setRunning(false);

    GraphCommunityWorkerInstance.removeEventListener(
      "message",
      createGraphCallback
    );
    setOrgCommunities(event.data.communities);
    setGraphData({
      //nodes,
      nodes: event.data.nodesWithCommunityMembers,
      links: event.data.interCommunityLinks, //[], // No inter-community links for this simplified visualization
    });

    setUndoState(null);
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
              isDynamic={false}
            />
            <CustomCheckBox
              name={"Random Walk"}
              onChange={handleInputChange}
              defaultValue={inputs.randomWalk}
              isDynamic={false}
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
      <Grid2 container spacing={2}>
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
        {renderInputs()}
        <LoadingButton
          component="label"
          variant="contained"
          tabIndex={-1}
          startIcon={<PlayArrowIcon />}
          fullWidth
          disabled={isEmpty}
          sx={{ flexGrow: 1 }}
          onClick={handleStart}
          loading={running}
        >
          Start
        </LoadingButton>
      </Grid2>
    </Box>
  );
};

export default GraphCommunitiesSettings;
