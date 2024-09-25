import React, { createContext, useState } from "react";
export const GraphCommunitiesDataContext = createContext();

export const GraphCommunitiesDataProvider = ({ children }) => {
  const [dGraphData, setDGraphData] = useState([]);
  const [isEmpty, setIsEmpty] = useState(true);
  const [use3D, setUse3D] = useState(false);
  const [multiSelect, setMultiSelect] = useState(false);
  const [nodeScale, setNodeScale] = useState(1);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [communityAlgorithm, setCommunityAlgorithm] = useState("Louvain");
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [allGroups, setAllGroups] = useState([]);

  return (
    <GraphCommunitiesDataContext.Provider
      value={{
        dGraphData,
        setDGraphData,
        isEmpty,
        setIsEmpty,
        use3D,
        setUse3D,
        multiSelect,
        setMultiSelect,
        nodeScale,
        setNodeScale,
        selectedNodes,
        setSelectedNodes,
        communityAlgorithm,
        setCommunityAlgorithm,
        graphData,
        setGraphData,
        allGroups,
        setAllGroups,
      }}
    >
      {children}
    </GraphCommunitiesDataContext.Provider>
  );
};
