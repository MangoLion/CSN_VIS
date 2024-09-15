import React, { useState, useEffect } from "react";
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
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

import createNearestNeighborWorker from "./NearestNeighbor.worker.js";
const NearestNeighborWorker = new createNearestNeighborWorker();

const NearestNeighborSettings = ({
  setDGraphData,
  unmodifiedSegments,
  unmodifiedStreamLines,
}) => {
  const [treeAlgorithm, setTreeAlgorithm] = useState("KNN");
  const [param, setParam] = useState("1");
  const [distanceMetric, setDistanceMetric] = useState("shortest");
  const [manualStart, setManualStart] = useState(false);
  const [exclude, setExclude] = useState(false);
  const [progress, setProgress] = useState(0);
  const [segments, setSegments] = useState([]);
  const [streamLines, setStreamLines] = useState([]);
  const [doSort, setDoSort] = useState(false);
  const [sortType, setSortType] = useState(1);
  const [graph, setGraph] = useState([]);
  const [minMax, setMinMax] = useState([0, 1]);
  const [pixelData, setPixelData] = useState([]);
  const [currentPixels, setCurrentPixels] = useState([]);
  const [slRange, setSlRange] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    if (unmodifiedSegments && unmodifiedSegments.length > 0) {
      setSegments(unmodifiedSegments);

      //When the segments are updated, construct the tree in the background
      NearestNeighborWorker.postMessage({
        constructTree: true,
        doSort: doSort,
        param: param,
        unmodifiedSegments: unmodifiedSegments,
        treeAlgorithm: treeAlgorithm,
        distanceMetric: distanceMetric,
        unmodifiedStreamLines: unmodifiedStreamLines,
        exclude: exclude,
        sortType: sortType,
      });
    }
  }, [unmodifiedSegments]);

  useEffect(() => {
    setIsEmpty(
      !(
        unmodifiedStreamLines &&
        unmodifiedStreamLines.length > 0 &&
        unmodifiedSegments &&
        unmodifiedSegments.length > 0
      )
    );
  }, [unmodifiedSegments, unmodifiedStreamLines]);

  const handleStart = async () => {
    NearestNeighborWorker.addEventListener("message", AMCSWorkerFunc, false);
    NearestNeighborWorker.postMessage({
      constructTree: false,
      doSort: doSort,
      param: param,
      unmodifiedSegments: unmodifiedSegments,
      treeAlgorithm: treeAlgorithm,
      distanceMetric: distanceMetric,
      unmodifiedStreamLines: unmodifiedStreamLines,
      exclude: exclude,
      sortType: sortType,
    });
  };

  const AMCSWorkerFunc = (event) => {
    if (event.data.type == "final") {
      setProgress(100);
      NearestNeighborWorker.removeEventListener("message", AMCSWorkerFunc);
      setGraph(event.data.tgraph);
      window.tempGraph = event.data.tgraph;

      let graphSize = 0;
      event.data.tgraph.forEach((edges) => {
        graphSize += edges.length;
      });

      setMinMax([event.data.minDist, event.data.maxDist]);
      setDGraphData(event.data.tgraph);
      updateSlRange(event.data.pixels);
      setCurrentPixels(event.data.pixels);
      setPixelData(event.data.pixels);
      if (doSort) {
        setSegments(event.data.segments);
        setStreamLines(event.data.streamlines);
      }
    } else if (event.data.type == "progress") {
      setProgress(event.data.progress);
    }
  };

  const updateSlRange = (pixels) => {
    const slR = {};
    pixels.forEach((px) => {
      const idx1 = segments[px[0]].lineIDx;
      const idx2 = segments[px[1]].lineIDx;
      let key = `${idx1},${idx2}`;
      if (!slR[key]) {
        slR[key] = [px[2], px[2]];
      } else {
        slR[key][0] = Math.min(px[2], slR[key][0]);
        slR[key][1] = Math.max(px[2], slR[key][1]);
      }
    });
    setSlRange(slR);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid2 container spacing={1}>
        <Typography sx={{ fontWeight: "bold" }}>
          Nearest Neighbor Settings
        </Typography>
        <Grid2 container size={12} spacing={1}>
          <Grid2 size={6}>
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
            <CustomCheckBox
              name={"Manual Start"}
              onChange={(e) => setManualStart(e.target.checked)}
              defaultValue={manualStart}
            />
          </Grid2>
          <Grid2 size={6}>
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
            <CustomSelect
              name={"Sort Type"}
              onChange={(e) => setSortType(e.target.value)}
              defaultValue={sortType}
              options={[
                { value: 1, label: "Row Sum" },
                { value: 2, label: "Average Distance" },
              ]}
            />
          </Grid2>
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
              sx={{ flexGrow: 1 }}
              onClick={handleStart}
              disabled={isEmpty}
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
            {progress != 0 && progress != 100 && (
              <CircularProgress
                variant="determinate"
                value={progress}
                size={20}
              />
            )}
          </Grid2>
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default NearestNeighborSettings;
