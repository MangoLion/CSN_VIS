import React, { useState, useEffect, useContext } from "react";
import {
  CustomCheckBox,
  CustomNumberInput,
  CustomSelect,
} from "../components/CustomComponents";
import {
  Button,
  Box,
  Grid2,
  Typography,
  CircularProgress,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DeleteIcon from "@mui/icons-material/Delete";
import { UniversalDataContext } from "../context/UniversalDataContext";
import { GraphCommunitiesDataContext } from "../context/GraphCommunitiesDataContext";
import { NearestNeighborDataContext } from "../context/NearestNeighborDataContext";

const NearestNeighborWorker = new Worker(
  new URL("./NearestNeighborWorker.jsx", import.meta.url),
  { type: "module" }
);

const NearestNeighborSettings = () => {
  const { segments, streamLines } = useContext(UniversalDataContext);
  const { dGraphData, setDGraphData } = useContext(GraphCommunitiesDataContext);
  const {
    treeAlgorithm,
    setTreeAlgorithm,
    param,
    setParam,
    distanceMetric,
    setDistanceMetric,
    manualStart,
    setManualStart,
    exclude,
    setExclude,
    progress,
    setProgress,
    doSort,
    setDoSort,
    sortType,
    setSortType,
  } = useContext(NearestNeighborDataContext);

  useEffect(() => {
    if (segments && segments.length > 0) {
      NearestNeighborWorker.postMessage({
        constructTree: true,
        doSort: doSort,
        param: param,
        unmodifiedSegments: segments,
        treeAlgorithm: treeAlgorithm,
        distanceMetric: distanceMetric,
        unmodifiedStreamLines: streamLines,
        exclude: exclude,
        sortType: sortType,
      });
    }
  }, [segments]);

  const handleSearch = async () => {
    NearestNeighborWorker.addEventListener("message", searchCallback, false);
    NearestNeighborWorker.postMessage({
      constructTree: false,
      doSort: doSort,
      param: param,
      unmodifiedSegments: segments,
      treeAlgorithm: treeAlgorithm,
      distanceMetric: distanceMetric,
      unmodifiedStreamLines: streamLines,
      exclude: exclude,
      sortType: sortType,
    });
  };

  const searchCallback = (event) => {
    if (event.data.type == "final") {
      setProgress(100);
      NearestNeighborWorker.removeEventListener("message", searchCallback);
      setDGraphData(event.data.tgraph);
    } else if (event.data.type == "progress") {
      setProgress(event.data.progress);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid2 container spacing={2}>
        <CustomSelect
          name={"Algorithm"}
          onChange={(e) => setTreeAlgorithm(e.target.value)}
          defaultValue={treeAlgorithm}
          options={[
            { value: "KNN", label: "KNN" },
            { value: "RBN", label: "RBN" },
          ]}
        />
        <CustomNumberInput
          name={treeAlgorithm === "KNN" ? "K" : "R"}
          onChange={(e) => setParam(e.target.value)}
          defaultValue={param}
        />
        <CustomSelect
          name={"Distance"}
          onChange={(e) => setDistanceMetric(e.target.value)}
          defaultValue={distanceMetric}
          options={[
            { value: "shortest", label: "Shortest" },
            { value: "longest", label: "Longest" },
            { value: "haustoff", label: "Haustoff" },
          ]}
        />
        <CustomSelect
          name={"Sort Type"}
          onChange={(e) => setSortType(e.target.value)}
          defaultValue={sortType}
          options={[
            { value: 1, label: "Row Sum" },
            { value: 2, label: "Average Distance" },
          ]}
        />
        <CustomCheckBox
          name={"Manual Start"}
          onChange={(e) => setManualStart(e.target.checked)}
          defaultValue={manualStart}
        />
        <CustomCheckBox
          name={"Exclude"}
          onChange={(e) => setExclude(e.target.checked)}
          defaultValue={exclude}
        />
        <CustomCheckBox
          name={"Do Sort"}
          onChange={(e) => setDoSort(e.target.checked)}
          defaultValue={doSort}
        />
        <LoadingButton
          component="label"
          variant="contained"
          tabIndex={-1}
          startIcon={<PlayArrowIcon />}
          fullWidth
          sx={{ flexGrow: 1 }}
          onClick={handleSearch}
          loading={progress != 0 && progress != 100}
          disabled={dGraphData.length > 0}
          loadingIndicator={
            <CircularProgress
              variant="determinate"
              value={progress}
              size={20}
            />
          }
        >
          Start
        </LoadingButton>
        <Button
          component="label"
          variant="contained"
          tabIndex={-1}
          startIcon={<DeleteIcon />}
          fullWidth
          sx={{ flexGrow: 1 }}
          onClick={() => setDGraphData([])}
          disabled={dGraphData.length === 0}
        >
          Delete Tree
        </Button>
      </Grid2>
    </Box>
  );
};

export default NearestNeighborSettings;
