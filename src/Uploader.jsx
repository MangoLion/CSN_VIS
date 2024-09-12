import React, { useState } from "react";
import { Grid2, TextField, Box, Button, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import MemoryIcon from "@mui/icons-material/Memory";
import { CustomNumberInput } from "./components/CustomComponents";
import { GPU } from "gpu.js";

const gpu = new GPU();
const VisuallyHiddenInput = styled("input")({
  accept: ".txt",
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const Uploader = ({ setSegments, setStreamLines }) => {
  const [file, setFile] = useState(null);
  const [skipLines, setSkipLines] = useState(0);
  const [skipSegments, setSkipSegments] = useState(0);

  const handleFileUpload = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = (event) => {
    const reader = new FileReader();
    let segments = [];
    reader.readAsText(file);
    reader.onload = (event) => {
      const tick = performance.now();
      let globalIdx = 0,
        lineIDx = 0;
      const text = event.target.result;
      const streamlines = [];
      let endIDx = 0;
      let lineSkipCount = 0;
      let linesArray = text
        .trim()
        .split("\n")
        .map((line) => {
          lineSkipCount++;
          if (lineSkipCount > 1 && lineSkipCount % skipLines === 0) {
            return [];
          }
          const coords = line.trim().split(" ").map(parseFloat);
          const streamline = [endIDx];
          const points = [];
          let ss = 1;
          if (skipSegments > 1) ss = skipSegments;
          for (let i = 0; i < coords.length; i += 4 * ss) {
            let start = [coords[i], coords[i + 1], coords[i + 2]];
            let end = [
              coords[i + 4 * ss],
              coords[i + 4 * ss + 1],
              coords[i + 4 * ss + 2],
            ];
            let midpoint = [
              (start[0] + end[0]) / 2,
              (start[1] + end[1]) / 2,
              (start[2] + end[2]) / 2,
            ];
            if (
              !(
                start.every((num) => !isNaN(num)) &&
                end.every((num) => !isNaN(num))
              )
            )
              continue;

            segments.push({
              startPoint: start,
              endPoint: end,
              midPoint: midpoint,
              color: "yellow",
              lineIDx: lineIDx,
              globalIdx: globalIdx,
              neighbors: [],
            });
            points.push(start);
            points.push(end);

            globalIdx++;
            endIDx = globalIdx;
          }
          streamline.push(endIDx);
          streamlines.push(streamline);
          endIDx++;
          lineIDx++;
          return [points];
        });

      const pairwiseDistances = computePairwiseDistances(segments, streamlines);

      let flag = false;
      const rearrangedStreamlines = rearrangeStreamlinesKNN(
        streamlines,
        pairwiseDistances,
        flag,
        5
      );

      linesArray = linesArray.filter((l) => l.length > 0);
      setSegments(segments);
      setStreamLines(streamlines);

      const tock = performance.now();
      console.log(`Upload took ${(tock - tick).toFixed(2)} ms`);
    };
  };

  const computePairwiseDistances = (segments, streamlines) => {
    const points = segments.map((segment) => segment.midPoint);
    const kernelBody = `
    let totalDistance = 0.0;
    let count = 0.0;
    const x = this.thread.x;
    const y = this.thread.y;

    for (let i = streamlines[x][0]; i < streamlines[x][1]; i++) {
      for (let j = streamlines[y][0]; j < streamlines[y][1]; j++) {
        totalDistance += Math.sqrt(
          Math.pow(points[i][0] - points[j][0], 2) +
          Math.pow(points[i][1] - points[j][1], 2) +
          Math.pow(points[i][2] - points[j][2], 2)
        );
        count += 1.0;
      }
    }

    return count > 0.0 ? totalDistance / count : 0.0;`;

    const kernelFunction = new Function("points", "streamlines", kernelBody);

    const kernel = gpu
      .createKernel(kernelFunction)
      .setOutput([streamlines.length, streamlines.length]);

    return kernel(points, streamlines);
  };

  const rearrangeStreamlinesKNN = (
    streamlines,
    distances,
    flag,
    k,
    memorySize = 10
  ) => {
    // Compute KNN distances
    let knnDistances = streamlines.map((_, idx) => {
      let dists = distances[idx].map((d, i) => ({ index: i, distance: d }));
      dists.sort((a, b) => a.distance - b.distance);
      return dists.slice(1, k + 1).reduce((sum, d) => sum + d.distance, 0);
    });

    // Pair streamlines with their KNN distances
    let pairedStreamlines = streamlines.map((s, idx) => ({
      streamline: s,
      distanceSum: knnDistances[idx],
    }));

    if (flag) {
      // Sort by ascending order for flag = true
      pairedStreamlines.sort((a, b) => a.distanceSum - b.distanceSum);
    } else {
      let remainingStreamlines = new Set(streamlines.map((_, idx) => idx));
      let arrangedStreamlines = [];
      let recentSelections = []; // Memory of recent selections

      // Start with a randomly selected streamline for more variety
      let currentIdx =
        Array.from(remainingStreamlines)[
          Math.floor(Math.random() * remainingStreamlines.size)
        ];
      arrangedStreamlines.push(streamlines[currentIdx]);
      recentSelections.push(currentIdx);
      remainingStreamlines.delete(currentIdx);

      while (remainingStreamlines.size > 0) {
        let candidates = [];

        remainingStreamlines.forEach((idx) => {
          if (!recentSelections.includes(idx)) {
            candidates.push({
              index: idx,
              distance: distances[currentIdx][idx],
            });
          }
        });

        candidates.sort((a, b) => b.distance - a.distance);

        let selectIndex = Math.min(
          candidates.length - 1,
          Math.floor(Math.random() * Math.min(memorySize, candidates.length))
        );
        let selected = candidates[selectIndex];

        arrangedStreamlines.push(streamlines[selected.index]);
        currentIdx = selected.index;
        recentSelections.push(currentIdx);
        if (recentSelections.length > memorySize) {
          recentSelections.shift();
        }
        remainingStreamlines.delete(currentIdx);
      }

      return arrangedStreamlines;
    }

    return pairedStreamlines.map((p) => p.streamline);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid2 container spacing={1}>
        <Typography sx={{ fontWeight: "bold" }}>Upload Settings</Typography>
        <Grid2 container size={12} spacing={2}>
          <Grid2
            item
            size={3}
            sx={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            <Button
              component="label"
              role={undefined}
              variant="contained"
              tabIndex={-1}
              startIcon={<CloudUploadIcon />}
              fullWidth
              sx={{ flexGrow: 1 }}
            >
              Upload
              <VisuallyHiddenInput
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
              />
            </Button>
          </Grid2>

          <Grid2
            item
            size={3}
            sx={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            <Button
              component="label"
              onClick={handleUpload}
              variant="contained"
              fullWidth
              startIcon={<MemoryIcon />}
              sx={{ flexGrow: 1 }}
            >
              Process
            </Button>
          </Grid2>

          <Grid2
            item
            size={6}
            sx={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
              <Typography noWrap>
                {file ? file.name : "No file chosen"}
              </Typography>
            </Box>
          </Grid2>
        </Grid2>
        <Grid2 container size={12} spacing={2}>
          <Grid2 item size={6}>
            <CustomNumberInput
              name="Merge X Segments Together"
              onChange={(e) => setSkipSegments(Number(e.target.value))}
              defaultValue={skipSegments}
            />
          </Grid2>
          <Grid2 item size={6}>
            <CustomNumberInput
              name="Skip Every X Lines"
              onChange={(e) => setSkipLines(Number(e.target.value) + 1)}
              defaultValue={skipLines}
            />
          </Grid2>
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default Uploader;
