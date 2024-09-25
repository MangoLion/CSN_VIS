import React, { useState, useEffect, useContext } from "react";
import { Allotment } from "allotment";
import GraphCommunitiesRenderer from "./GraphCommunitiesRenderer";
import GraphCommunitiesSettings from "./GraphCommunitiesSettings";
import NearestNeighborSettings from "../Nearest Neighbor/NearestNeighborSettings";

const GraphCommunities = () => {
  return (
    <Allotment vertical={true} defaultSizes={[245, 259, 480]}>
      <Allotment.Pane>
        <NearestNeighborSettings />
      </Allotment.Pane>
      <Allotment.Pane>
        <GraphCommunitiesSettings />
      </Allotment.Pane>
      <Allotment.Pane>
        <GraphCommunitiesRenderer />
      </Allotment.Pane>
    </Allotment>
  );
};

export default GraphCommunities;
