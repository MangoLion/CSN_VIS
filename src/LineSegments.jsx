import React, { useRef, useState } from "react";
import { Allotment } from "allotment";
import Uploader from "./Uploader";
import LineSegmentUploader from "./LineSegmentUploader";
import LineSegmentsRenderer from "./LineSegmentsRenderer";
import { Canvas } from "@react-three/fiber";

const LineSegments = ({
  segments,
  setSegments,
  segmentsSelected,
  setSelectedSegment,
  setStreamLines,
}) => {
  const [radius, setRadius] = useState(0.45);
  const [tubeRes, setTubeRes] = useState(20);
  const [showCaps, setShowCaps] = useState(true);
  const [opacity, setOpacity] = useState(0.4);
  const [cylinderHeight, setCylinderHeight] = useState(1.0);
  const [drawAll, setDrawAll] = useState(true);
  const [intensity, setIntensity] = useState(2);

  return (
    <Allotment vertical={true} defaultSizes={[4, 5, 15]}>
      <Allotment.Pane>
        <Uploader {...{ setSegments, setStreamLines }} />
      </Allotment.Pane>
      <Allotment.Pane>
        <LineSegmentUploader
          {...{
            radius,
            setRadius,
            tubeRes,
            setTubeRes,
            drawAll,
            setDrawAll,
            intensity,
            setIntensity,
            opacity,
            setOpacity,
            showCaps,
            setShowCaps,
            cylinderHeight,
            setCylinderHeight,
          }}
          key="uploader"
        />
      </Allotment.Pane>
      <Allotment.Pane>
        <Canvas style={{ width: "100%", height: "100%" }}>
          <LineSegmentsRenderer
            {...{
              radius,
              tubeRes,
              drawAll,
              segments,
              segmentsSelected,
              setSelectedSegment,
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
  );
};

export default LineSegments;
