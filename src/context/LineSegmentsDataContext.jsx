import React, { createContext, useState } from "react";
export const LineSegmentsDataContext = createContext();

export const LineSegmentsDataProvider = ({ children }) => {
  const [radius, setRadius] = useState(0.45);
  const [tubeRes, setTubeRes] = useState(20);
  const [showCaps, setShowCaps] = useState(true);
  const [opacity, setOpacity] = useState(0.4);
  const [cylinderHeight, setCylinderHeight] = useState(1.0);
  const [drawAll, setDrawAll] = useState(true);
  const [intensity, setIntensity] = useState(2);

  return (
    <LineSegmentsDataContext.Provider
      value={{
        radius,
        setRadius,
        tubeRes,
        setTubeRes,
        showCaps,
        setShowCaps,
        opacity,
        setOpacity,
        cylinderHeight,
        setCylinderHeight,
        drawAll,
        setDrawAll,
        intensity,
        setIntensity,
      }}
    >
      {children}
    </LineSegmentsDataContext.Provider>
  );
};
