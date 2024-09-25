import React, { createContext, useState } from "react";
export const UniversalDataContext = createContext();

export const UniversalDataProvider = ({ children }) => {
  const [segments, setSegments] = useState([]);
  const [streamLines, setStreamLines] = useState([]);
  const [coloredSegments, setColoredSegments] = useState([]);
  const [selectedSegments, setSelectedSegments] = useState([]);

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
      }}
    >
      {children}
    </UniversalDataContext.Provider>
  );
};
