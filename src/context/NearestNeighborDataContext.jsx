import React, { createContext, useState } from "react";
export const NearestNeighborDataContext = createContext();

export const NearestNeighborDataProvider = ({ children }) => {
  const [treeAlgorithm, setTreeAlgorithm] = useState("KNN");
  const [param, setParam] = useState("1");
  const [distanceMetric, setDistanceMetric] = useState("shortest");
  const [manualStart, setManualStart] = useState(false);
  const [exclude, setExclude] = useState(false);
  const [progress, setProgress] = useState(0);
  const [doSort, setDoSort] = useState(false);
  const [sortType, setSortType] = useState(1);

  return (
    <NearestNeighborDataContext.Provider
      value={{
        treeAlgorithm,
        setTreeAlgorithm,
        param,
        setParam,
        distanceMetric,
        setDistanceMetric,
        manualStart,
        setManualStart,
        exclude,
        setExclude,
        progress,
        setProgress,
        doSort,
        setDoSort,
        sortType,
        setSortType,
      }}
    >
      {children}
    </NearestNeighborDataContext.Provider>
  );
};
