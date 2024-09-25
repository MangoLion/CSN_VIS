import React, { useState, useEffect, useContext } from "react";
import { Allotment } from "allotment";
import GraphCommunitiesRenderer from "./GraphCommunitiesRenderer";
import GraphCommunitiesSettings from "./GraphCommunitiesSettings";
import NearestNeighborSettings from "../Nearest Neighbor/NearestNeighborSettings";
import { UniversalDataContext } from "../context/UniversalDataContext";

const GraphCommunities = () => {
  const { segments, setSelectedSegments, setColoredSegments } =
    useContext(UniversalDataContext);

  const [dGraphData, setDGraphData] = useState([]);
  const [isEmpty, setIsEmpty] = useState(true);
  const [use3D, setUse3D] = useState(false);
  const [multiSelect, setMultiSelect] = useState(false);
  const [nodeScale, setNodeScale] = useState(1);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [communityAlgorithm, setCommunityAlgorithm] = useState("Louvain");
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [allGroups, setAllGroups] = useState([]);

  useEffect(() => {
    setDGraphData([]);
    setSelectedSegments([]);
    setIsEmpty(true);
    setSelectedNodes([]);
    setGraphData({ nodes: [], links: [] });
    setColoredSegments([]);
  }, [segments]);

  useEffect(() => {
    setSelectedSegments([]);
    setSelectedNodes([]);
    setGraphData({ nodes: [], links: [] });
    setColoredSegments([]);
  }, [dGraphData]);

  useEffect(() => {
    setSelectedSegments([]);
    setSelectedNodes([]);
  }, [graphData, allGroups]);

  return (
    <Allotment vertical={true} defaultSizes={[245, 259, 480]}>
      <Allotment.Pane>
        <NearestNeighborSettings setDGraphData={setDGraphData} />
      </Allotment.Pane>
      <Allotment.Pane>
        <GraphCommunitiesSettings
          {...{
            multiSelect,
            setMultiSelect,
            nodeScale,
            setNodeScale,
            dGraphData,
            setDGraphData,
            isEmpty,
            setIsEmpty,
            selectedNodes,
            communityAlgorithm,
            setCommunityAlgorithm,
            graphData,
            setGraphData,
            allGroups,
            setAllGroups,
          }}
        />
      </Allotment.Pane>
      <Allotment.Pane>
        <GraphCommunitiesRenderer
          {...{
            graphData,
            isEmpty,
            use3D,
            nodeScale,
            communityAlgorithm,
            multiSelect,
            allGroups,
            selectedNodes,
            setSelectedNodes,
          }}
        />
      </Allotment.Pane>
    </Allotment>
  );
};

export default GraphCommunities;
