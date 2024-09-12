import React, { useState, useRef, useEffect } from "react";
import HugeCanvas from "./HugeCanvas";
import LineSegments from "./LineSegments";
import GraphCommunities1 from "./GraphCommunities1";

import "rc-dock/dist/rc-dock.css";
import BarChart from "./PlotView";

import "./styles/App.css";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import Vis from "./components/Vis";
import GraphCommunities from "./GraphCommunities";
import { Matrix3 } from "three";

import { createTheme, ThemeProvider } from "@mui/material/styles";

const App = () => {
  const [segments, setSegments] = useState([]);
  const [streamLines, setStreamLines] = useState([]);
  const [selectedSegment, setSelectedSegment] = useState(-1);
  const [segmentsSelected, setSegmentsSelected] = useState([]);
  const [dGraphData, setDGraphData] = useState([]);
  const [swapLayout, setSwapLayout] = useState(false);
  const [layerProps, setLayerProps] = useState({
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
  });

  const [pixelData, setPixelData] = useState(false);

  const [canvasData, setCanvasData] = useState({});
  const [settings, setSettings] = useState({});

  const [selectRegion, setSelectRegion] = useState({
    start: null,
    end: null,
  });

  const [graphData, setGraphData] = useState(null);
  const [CSNG, setCSNG] = useState(false);
  const [dGraph, setDGraph] = useState(false);
  const [pixelMapData, setPixelMapData] = useState(false);

  const [sphereRadius, setSphereRadius] = useState(1); // Default radius

  const [selectionMode, setSelectionMode] = useState("Add");
  const [shapeMode, setShapeMode] = useState("Sphere");
  const [transformMode, setTransformMode] = useState("translate");

  const [objFile, setObjFile] = useState(false);

  const matRef = React.createRef();

  const [manualStart, setManualStart] = useState(false);

  useEffect(() => {
    console.log(matRef.current);
  }, [matRef.current]);

  //const amcsRef = useRef();

  /**
   * description
   * @param {*} newProps
   */
  const handleLayerChange = (newProps) => {
    setLayerProps(newProps);
  };

  return (
    <div className="App">
      <Allotment key="main">
        <LineSegments
          {...{
            segments,
            setSegments,
            segmentsSelected,
            setSelectedSegment,
            setStreamLines,
          }}
        />
        {/* 
        <Allotment.Pane>
          <GraphCommunities
            setPixelMapData={setPixelMapData}
            matRef={matRef}
            data={dGraphData}
            setPixelData={setPixelData}
            pixelData={pixelData}
            segmentsSelected={segmentsSelected}
            setSegmentsSelected={setSegmentsSelected}
            segments={segments}
            selectedSegment={selectedSegment}
            selectionMode={selectionMode}
            setSelectionMode={setSelectionMode}
          />
        </Allotment.Pane> */}

        <GraphCommunities1
          setSegmentsSelected={setSegmentsSelected}
          segments={segments}
          streamLines={streamLines}
        />

        {/* <Allotment.Pane>
          <div style2={{ display: "none", maxWidth: "0px" }}>
            <HugeCanvas
              {...{
                selectedSegment,
                layerProps,
                handleLayerChange,
                setSegmentsSelected,
                setGraphData,
                setDGraphData,
                pixelData,
                setPixelData,
                pixelMapData,
                canvasData,
                setCanvasData,
                setCSNG,
                manualStart,
                setDGraph,
              }}
              onLayerChange={handleLayerChange}
              ref={matRef}
              streamLines2={streamLines}
              segments2={segments}
              key="canvas1"
              cid={1}
            />
          </div>
        </Allotment.Pane> */}
      </Allotment>
    </div>
  );
};

export default App;
