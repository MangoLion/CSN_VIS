import React, { useState, useEffect } from "react";
import { Allotment } from "allotment";
import GraphCommunitiesRenderer from "./GraphCommunitiesRenderer";
import GraphCommunitiesSettings from "./GraphCommunitiesSettings";
import NearestNeighborSettings from "./NearestNeighborSettings";

const GraphCommunities1 = ({ setSegmentsSelected, segments, streamLines }) => {
  const [dGraphData, setDGraphData] = useState([]);
  const [isEmpty, setIsEmpty] = useState(true);
  const [use3D, setUse3D] = useState(false);
  const [multiSelect, setMultiSelect] = useState(false);
  const [nodeScale, setNodeScale] = useState(1);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [communityAlgorithm, setCommunityAlgorithm] = useState("Louvain");
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  return (
    <Allotment vertical={true} defaultSizes={[4, 3, 7]}>
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
            selectedNode,
            selectedNodes,
            communityAlgorithm,
            setCommunityAlgorithm,
            graphData,
            setGraphData,
          }}
        />
      </Allotment.Pane>
      <Allotment.Pane>
        <GraphCommunitiesRenderer
          {...{
            graphData,
            isEmpty,
            use3D,
            setSegmentsSelected,
            nodeScale,
            selectedNode,
            setSelectedNode,
            selectedNodes,
            setSelectedNodes,
            communityAlgorithm,
          }}
        />
      </Allotment.Pane>
    </Allotment>
  );
};

export default GraphCommunities1;