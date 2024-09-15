import React, { useState, useRef, useEffect } from "react";
import HugeCanvas from "./HugeCanvas";
import LineSegments from "./Line Segments/LineSegments";
import GraphCommunities from "./Graph Community/GraphCommunities";

import "rc-dock/dist/rc-dock.css";
import BarChart from "./PlotView";

import "./styles/App.css";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import Vis from "./components/Vis";

const App = () => {
  const [segments, setSegments] = useState([]);
  const [streamLines, setStreamLines] = useState([]);
  const [coloredSegments, setColoredSegments] = useState([]);
  const [selectedSegment, setSelectedSegment] = useState(-1);
  const [segmentsSelected, setSegmentsSelected] = useState([]);
  const [swapLayout, setSwapLayout] = useState(false);
  const [layerProps, setLayerProps] = useState({
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
  });

  const [canvasData, setCanvasData] = useState({});
  const [settings, setSettings] = useState({});

  const [selectRegion, setSelectRegion] = useState({
    start: null,
    end: null,
  });

  const [CSNG, setCSNG] = useState(false);
  const [pixelMapData, setPixelMapData] = useState(false);

  const [sphereRadius, setSphereRadius] = useState(1); // Default radius

  const [selectionMode, setSelectionMode] = useState("Add");
  const [shapeMode, setShapeMode] = useState("Sphere");
  const [transformMode, setTransformMode] = useState("translate");

  const [objFile, setObjFile] = useState(false);

  const matRef = React.createRef();

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
            coloredSegments,
          }}
        />

        <GraphCommunities
          {...{
            setSegmentsSelected,
            segments,
            streamLines,
            coloredSegments,
            setColoredSegments,
          }}
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
