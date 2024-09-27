import React, { useState, useContext, useEffect } from "react";
import "rc-dock/dist/rc-dock.css";

import "./styles/App.css";
import "allotment/dist/style.css";

import { Allotment } from "allotment";

import { Box, Divider, Drawer, IconButton, Typography } from "@mui/material";
import PersistentDrawerLeft from "./PersistentDrawer";

import Uploader from "./Uploader/Uploader";
import LineSegmentSettings from "./Line Segments/LineSegmentSettings";
import NearestNeighborSettings from "./Nearest Neighbor/NearestNeighborSettings";

import LineSegmentsRenderer from "./Line Segments/LineSegmentsRenderer";
import GraphCommunitiesSettings from "./Graph Community/GraphCommunitiesSettings";
import GraphCommunitiesRenderer from "./Graph Community/GraphCommunitiesRenderer";
import { UniversalDataContext } from "./context/UniversalDataContext";
import { GraphCommunitiesDataContext } from "./context/GraphCommunitiesDataContext";

const App = () => {
  const { segments } = useContext(UniversalDataContext);
  const { dGraphData } = useContext(GraphCommunitiesDataContext);

  useEffect(() => {
    console.log("dGraphData, " + dGraphData);
  }, [dGraphData]);

  return (
    <div className="App" style={{ display: "flex", height: "100vh" }}>
      <PersistentDrawerLeft
        drawerContent={
          <>
            <Uploader />
            <Divider variant="middle" />
            {segments && segments.length > 0 && (
              <>
                <LineSegmentSettings />
                <Divider variant="middle" />
                <NearestNeighborSettings />
                <Divider variant="middle" />
              </>
            )}
            {dGraphData && dGraphData.length > 0 && (
              <>
                <GraphCommunitiesSettings />
                <Divider variant="middle" />
              </>
            )}
          </>
        }
        mainContent={
          <Box sx={{ width: "100%", height: "100%" }}>
            <Allotment>
              <Allotment.Pane>
                <LineSegmentsRenderer />
              </Allotment.Pane>
              <Allotment.Pane>
                <GraphCommunitiesRenderer />
              </Allotment.Pane>
            </Allotment>
          </Box>
        }
      />
    </div>
  );
};

export default App;
