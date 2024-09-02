import React, { useState, useEffect, useRef } from "react";
import "./styles/LineSegmentUploader.css";
const { GPU } = require("gpu.js");
const gpu = new GPU();

const LineSegmentUploader = React.memo(
  ({
    setShowPlotView,
    showPlotView,
    setRadius,
    setTubeRes,
    swapLayout,
    setSwapLayout,
    drawAll,
    setDrawAll,
    manualUpdate,
    setManualUpdate,
    setStreamLines,
    setSegments,
    setExclude,
    settings,
    setSettings,
    setSphereRadius,
    sphereRadius,
    setObjFile,
    selectionMode,
    setSelectionMode,
    shapeMode,
    setShapeMode,
    transformMode,
    setTransformMode,
    setManualStart,
    manualProgress,
    intensity,
    setIntensity,
    setOpacity,
    showCaps,
    setShowCaps,
  }) => {
    const [lines, setLines] = useState([]);
    const [skipLines, setSkipLines] = useState(0);
    const [skipSegments, setSkipSegments] = useState(0);
    const [file, setFile] = useState(null);
    const [exclude, setExclude2] = useState(-1);

    const [numSegments, setNumSegments] = useState(0);

    const fileInputRef = useRef(null);

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

        const pairwiseDistances = computePairwiseDistances(
          segments,
          streamlines
        );

        let flag = false;
        const rearrangedStreamlines = rearrangeStreamlinesKNN(
          streamlines,
          pairwiseDistances,
          flag,
          5
        );

        const { newSegments, updatedStreamlines } =
          rebuildSegmentsAndStreamlines(
            segments,
            streamlines,
            rearrangedStreamlines
          );

        linesArray = linesArray.filter((l) => l.length > 0);

        setSegments(segments);
        setStreamLines(streamlines);

        setNumSegments(segments.length);
        setLines(linesArray);

        const tock = performance.now();
        console.log(`Upload took ${(tock - tick).toFixed(2)} ms`);
      };
    };

    //------
    function rearrangeStreamlinesKNN(
      streamlines,
      distances,
      flag,
      k,
      memorySize = 10
    ) {
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

          // Sort candidates by distance, descending
          candidates.sort((a, b) => b.distance - a.distance);

          // Select one of the top candidates, but not the farthest to avoid ping-ponging
          let selectIndex = Math.min(
            candidates.length - 1,
            Math.floor(Math.random() * Math.min(memorySize, candidates.length))
          );
          let selected = candidates[selectIndex];

          arrangedStreamlines.push(streamlines[selected.index]);
          currentIdx = selected.index;
          recentSelections.push(currentIdx);
          if (recentSelections.length > memorySize) {
            recentSelections.shift(); // Maintain memory size
          }
          remainingStreamlines.delete(currentIdx);
        }

        return arrangedStreamlines;
      }

      return pairedStreamlines.map((p) => p.streamline);
    }

    function computePairwiseDistances(segments, streamlines) {
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
    }

    function rebuildSegmentsAndStreamlines(
      segments,
      oldStreamlines,
      newStreamlines
    ) {
      let newSegments = [];
      let updatedStreamlines = [];

      newStreamlines.forEach((streamline) => {
        let newStartIdx = newSegments.length;
        for (let i = streamline[0]; i < streamline[1]; i++) {
          newSegments.push(segments[i]);
        }
        let newEndIdx = newSegments.length;
        updatedStreamlines.push([newStartIdx, newEndIdx]);
      });

      return { newSegments, updatedStreamlines };
    }

    const handleExcludeChange = (event) => {
      setExclude2(event.target.value);
      setExclude(Number(event.target.value));
    };

    const [algorithm, setAlgorithm] = useState("KNN");
    const [param, setParam] = useState("1");
    const [distanceMetric, setDistanceMetric] = useState("shortest");
    const [progress, setProgress] = useState(0);

    useEffect(() => {
      setProgress(manualProgress);
    }, [manualProgress]);

    const handleStart = () => {
      setManualStart(true);
    };

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          margin: "5px",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
          <input
            type="file"
            onChange={handleFileUpload}
            ref={fileInputRef}
            style={{ display: "none" }}
          />
          <button onClick={() => fileInputRef.current.click()}>
            Choose File
          </button>
          <button onClick={handleUpload}>Upload</button> <br />
          <label>{file ? file.name : "No file chosen"}</label>
        </div>
        <label>
          Streamlines: {lines.length}&nbsp; Segments: {numSegments}
        </label>
        <br />
        <label style={{ fontWeight: "bold" }}>Settings</label>
        <div id="settings" style={{ display: "flex", gap: "10px" }}>
          <div
            style={{
              flexDirection: "column",
              width: "50%",
            }}
          >
            <div className="setting">
              <label>Intensity:</label>
              <input
                type="number"
                value={intensity}
                onChange={(e) => {
                  setIntensity(Number(e.target.value));
                }}
              />
            </div>
            <div className="setting">
              <label>Skip every x lines:</label>
              <input
                type="number"
                value={skipLines}
                onChange={(e) => {
                  setSkipLines(Number(e.target.value) + 1);
                }}
              />
            </div>
            <div className="setting">
              <label>Merge x segments together:</label>
              <input
                type="number"
                value={skipSegments}
                onChange={(e) => {
                  setSkipSegments(Number(e.target.value));
                }}
              />
            </div>
            <div className="setting">
              <label>PlotView:</label>
              <input
                type="checkbox"
                checked={showPlotView}
                onChange={() => {
                  setShowPlotView(!showPlotView);
                }}
              />
            </div>
            <div className="setting">
              <label>Exclude close segments:</label>
              <input
                type="number"
                value={exclude}
                onChange={handleExcludeChange}
              />
            </div>
            <div className="setting">
              <label>Tube Radius:</label>
              <input
                defaultValue={0.45}
                step={0.05}
                type="number"
                onChange={(e) => {
                  setRadius(Number(e.target.value));
                }}
              />
            </div>
          </div>
          <div
            style={{
              flexDirection: "column",
              width: "50%",
            }}
          >
            <div className="setting">
              <label>Tube Resolution:</label>
              <input
                defaultValue={20}
                type="number"
                onChange={(e) => {
                  setTubeRes(Number(e.target.value));
                }}
              />
            </div>
            <div className="setting">
              <label>Manual Update</label>
              <input
                type="checkbox"
                checked={manualUpdate}
                onChange={() => {
                  setManualUpdate(!manualUpdate);
                }}
              />
            </div>
            <div className="setting">
              <label>Draw All Segments</label>
              <input
                type="checkbox"
                checked={drawAll}
                onChange={() => {
                  setDrawAll(!drawAll);
                }}
              />
            </div>
            <div className="setting">
              <label>Opacity:</label>
              <input
                type="number"
                defaultValue={0.4}
                step={0.05}
                onChange={(e) => {
                  setOpacity(Number(e.target.value));
                }}
              />
            </div>
            <div className="setting">
              <label>Show Caps</label>
              <input
                type="checkbox"
                checked={showCaps}
                onChange={() => {
                  setShowCaps(!showCaps);
                }}
              />
            </div>
          </div>
        </div>
        <br />
        <label style={{ fontWeight: "bold" }}>Generate CSNG</label>
        <div id="csng" style={{ display: "flex", gap: "10px" }}>
          <div style={{ flexDirection: "column", width: "50%" }}>
            <div>
              <label>Algorithm:</label>
              <select
                defaultValue={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
              >
                <option value="KNN">KNN</option>
                <option value="RBN">RBN</option>
              </select>
            </div>
            {algorithm === "KNN" && (
              <div>
                <label>K:</label>
                <input
                  type="number"
                  value={param}
                  onChange={(e) => setParam(e.target.value)}
                />
              </div>
            )}
            {algorithm === "RBN" && (
              <div>
                <label>R:</label>
                <input
                  type="number"
                  value={param}
                  onChange={(e) => setParam(e.target.value)}
                />
              </div>
            )}
            <div>
              <label>Distance:</label>
              <select
                defaultValue={distanceMetric}
                onChange={(e) => setDistanceMetric(e.target.value)}
              >
                <option value="shortest">Shortest</option>
                <option value="longest">Longest</option>
                <option value="haustoff">Haustoff</option>
              </select>
            </div>
          </div>
          <div
            style={{
              flexDirection: "column",
              width: "50%",
              alignItems: "center",
            }}
          >
            <button
              style={{ width: "80%", maxWidth: "260px" }}
              onClick={handleStart}
            >
              Start
            </button>
            <progress
              style={{ width: "80%", maxWidth: "260px" }}
              value={progress}
              max="100"
            ></progress>
          </div>
        </div>
      </div>
    );
  }
);

export default LineSegmentUploader;
