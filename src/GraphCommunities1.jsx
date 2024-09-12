import React, { useState, useEffect } from "react";
import { Allotment } from "allotment";
import GraphCommunitiesRenderer from "./GraphCommunitiesRenderer";
import GraphCommunitiesSettings from "./GraphCommunitiesSettings";
import NearestNeighborSettings from "./NearestNeighborSettings";

const GraphCommunities1 = ({ setSegmentsSelected, segments, streamLines }) => {
  const [dGraphData, setDGraphData] = useState([]);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [isEmpty, setIsEmpty] = useState(true);
  const [use3D, setUse3D] = useState(0);
  const [multiSelect, setMultiSelect] = useState(false);
  const [nodeScale, setNodeScale] = useState(1);

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
          }}
        />
      </Allotment.Pane>
      <Allotment.Pane>
        <GraphCommunitiesRenderer
          {...{
            dGraphData,
            isEmpty,
            use3D,
            graphData,
            setSegmentsSelected,
            nodeScale,
          }}
        />
      </Allotment.Pane>
    </Allotment>
  );
};

export default GraphCommunities1;
