import React, { useRef, useState } from "react";

const LineSegments = ({ segments, setSegments }) => {
  const [radius, setRadius] = useState(0.45);
  const [tubeRes, setTubeRes] = useState(20);
  const [showCaps, setShowCaps] = useState(true);
  const [opacity, setOpacity] = useState(0.4);
  const [cylinderHeight, setCylinderHeight] = useState(1.0);
  const [drawAll, setDrawAll] = useState(true);
};
