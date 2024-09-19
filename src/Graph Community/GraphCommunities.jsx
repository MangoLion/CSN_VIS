import React, { useState, useEffect } from "react";
import { Allotment } from "allotment";
import GraphCommunitiesRenderer from "./GraphCommunitiesRenderer";
import GraphCommunitiesSettings from "./GraphCommunitiesSettings";
import NearestNeighborSettings from "../Nearest Neighbor/NearestNeighborSettings";

const GraphCommunities = ({
  setSegmentsSelected,
  segments,
  streamLines,
  coloredSegments,
  setColoredSegments,
  selectedSegments,
}) => {
  const [dGraphData, setDGraphData] = useState([]);
  const [isEmpty, setIsEmpty] = useState(true);
  const [use3D, setUse3D] = useState(false);
  const [multiSelect, setMultiSelect] = useState(false);
  const [nodeScale, setNodeScale] = useState(1);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [communityAlgorithm, setCommunityAlgorithm] = useState("Louvain");
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [allGroups, setAllGroups] = useState([]);
  const [undoState, setUndoState] = useState(false);
  const [orgCommunities, setOrgCommunities] = useState({
    nodes: [],
    links: [],
  });

  useEffect(() => {
    setDGraphData([]);
    setSegmentsSelected([]);
    setIsEmpty(true);
    setSelectedNodes([]);
    setGraphData({ nodes: [], links: [] });
    setColoredSegments([]);
  }, [segments]);

  useEffect(() => {
    setSegmentsSelected([]);
    setSelectedNodes([]);
    setGraphData({ nodes: [], links: [] });
    setColoredSegments([]);
  }, [dGraphData]);

  useEffect(() => {
    setSelectedNodes([]);
  }, [graphData]);

  return (
    <Allotment vertical={true} defaultSizes={[245, 215, 524]}>
      <Allotment.Pane>
        <NearestNeighborSettings
          setDGraphData={setDGraphData}
          unmodifiedSegments={segments}
          unmodifiedStreamLines={streamLines}
        />
      </Allotment.Pane>
      <Allotment.Pane>
        <GraphCommunitiesSettings
          {...{
            segments,
            setSegmentsSelected,
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
            setColoredSegments,
            allGroups,
            setAllGroups,
            setUndoState,
            setOrgCommunities,
          }}
        />
      </Allotment.Pane>
      <Allotment.Pane>
        <GraphCommunitiesRenderer
          {...{
            graphData,
            setGraphData,
            isEmpty,
            use3D,
            setSegmentsSelected,
            nodeScale,
            selectedNodes,
            setSelectedNodes,
            communityAlgorithm,
            multiSelect,
            setMultiSelect,
            coloredSegments,
            setColoredSegments,
            undoState,
            setUndoState,
            orgCommunities,
            setOrgCommunities,
            allGroups,
            setAllGroups,
          }}
        />
      </Allotment.Pane>
    </Allotment>
  );
};

export default GraphCommunities;
