import React, { useState, useRef, useEffect } from "react";
import HugeCanvas from "./HugeCanvas";
import LineSegments from "./LineSegments";
import LineSegmentUploader from "./LineSegmentUploader";

import "rc-dock/dist/rc-dock.css";
import BarChart from "./PlotView";
import { Canvas } from "@react-three/fiber";

import "./styles/App.css";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import Vis from "./components/Vis";
import GraphCommunities from "./GraphComm";
import { Matrix3 } from "three";

const App = () => {
  const [streamLines, setStreamLines] = useState([]);
  const [dGraphData, setDGraphData] = useState([]);
  const [exclude, setExclude] = useState(-1);
  const [manualUpdate, setManualUpdate] = useState(false);
  const [drawAll, setDrawAll] = useState(true);
  const [swapLayout, setSwapLayout] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState(-1);
  const [radius, setRadius] = useState(0.45);
  const [tubeRes, setTubeRes] = useState(20);
  const [showCaps, setShowCaps] = useState(true);
  const [opacity, setOpacity] = useState(0.4);
  const [cylinderHeight, setCylinderHeight] = useState(1.0);
  const [showPlotView, setShowPlotView] = useState(true);
  const [layerProps, setLayerProps] = useState({
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
  });

  const [pixelData, setPixelData] = useState(false);

  const [segments, setSegments] = useState([]);
  const [segmentsSelected, setSegmentsSelected] = useState([]);

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
  const [manualProgress, setManualProgress] = useState(0);

  const [intensity, setIntensity] = useState(2);

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
        <Allotment vertical={true} defaultSizes={[1, 2]}>
          <Allotment.Pane>
            <div>
              <LineSegmentUploader
                {...{
                  setShowPlotView,
                  showPlotView,
                  setRadius,
                  setTubeRes,
                  manualUpdate,
                  setManualUpdate,
                  setStreamLines,
                  setSegments,
                  setExclude,
                  drawAll,
                  setDrawAll,
                  swapLayout,
                  setSwapLayout,
                  settings,
                  setSettings,
                  setSphereRadius,
                  sphereRadius,
                  selectionMode,
                  setSelectionMode,
                  shapeMode,
                  setShapeMode,
                  transformMode,
                  setTransformMode,
                  setObjFile,
                  setManualStart,
                  manualProgress,
                  intensity,
                  setIntensity,
                  setOpacity,
                  showCaps,
                  setShowCaps,
                  setCylinderHeight,
                }}
                key="uploader"
              />
            </div>
          </Allotment.Pane>
          <Allotment.Pane preferredSize={"40%"}>
            <Canvas style={{ width: "100%", height: "100%" }}>
              <LineSegments
                {...{
                  radius,
                  tubeRes,
                  setSelectedSegment,
                  drawAll,
                  segments,
                  setSelectRegion,
                  segmentsSelected,
                  setSegmentsSelected,
                  dGraphData,
                  dGraph,
                  sphereRadius,
                  selectionMode,
                  shapeMode,
                  transformMode,
                  setTransformMode,
                  objFile,
                  intensity,
                  opacity,
                  showCaps,
                  cylinderHeight,
                }}
                key="line3D"
              />
            </Canvas>
          </Allotment.Pane>
        </Allotment>

        <Allotment.Pane>
          {showPlotView ? (
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
          ) : (
            <div>
              <HugeCanvas
                {...{
                  selectedSegment,
                  manualUpdate,
                  exclude,
                  layerProps,
                  handleLayerChange,
                  setSegmentsSelected,
                }}
                streamLines2={streamLines}
                segments2={segments}
                key="canvas2"
                cid={2}
              />
            </div>
          )}
        </Allotment.Pane>

        <Allotment.Pane>
          <div style2={{ display: "none", maxWidth: "0px" }}>
            <HugeCanvas
              {...{
                selectedSegment,
                manualUpdate,
                exclude,
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
                setManualProgress,
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
        </Allotment.Pane>
      </Allotment>
    </div>
  );
};

export default App;
