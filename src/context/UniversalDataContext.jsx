import React, { createContext, useState } from "react";
export const UniversalDataContext = createContext();

export const UniversalDataProvider = ({ children }) => {
  const [segments, setSegments] = useState([]);
  const [streamLines, setStreamLines] = useState([]);
  const [coloredSegments, setColoredSegments] = useState([]);
  const [selectedSegments, setSelectedSegments] = useState([]);

  const [selectedSettingsWindow, setSelectedSettingsWindow] = useState("0");
  const [selectedRenderingWindow, setSelectedRenderingWindow] = useState("0");
  const [drawerOpen, setDrawerOpen] = useState(true);

  return (
    <UniversalDataContext.Provider
      value={{
        segments,
        setSegments,
        streamLines,
        setStreamLines,
        coloredSegments,
        setColoredSegments,
        selectedSegments,
        setSelectedSegments,
        selectedSettingsWindow,
        setSelectedSettingsWindow,
        selectedRenderingWindow,
        setSelectedRenderingWindow,
        drawerOpen,
        setDrawerOpen,
      }}
    >
      {children}
    </UniversalDataContext.Provider>
  );
};
