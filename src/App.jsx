import React, { useState, useContext, useEffect } from "react";
import "rc-dock/dist/rc-dock.css";

import "./styles/App.css";
import "allotment/dist/style.css";

import { Allotment } from "allotment";

import {
  Box,
  Divider,
  Drawer,
  IconButton,
  Typography,
  Tab,
  Tabs,
} from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
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

  const [selectedWindow, setSelectedWindow] = useState("0");

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
        headerContent={
          <>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ color: "black" }}
            >
              Curve Segment Neighborhood-Based Vector Field Exploration
            </Typography>
            <Tabs
              value={selectedWindow}
              onChange={(e, v) => setSelectedWindow(v)}
              sx={{ marginLeft: "50px" }}
            >
              <Tab label="Line Segments" value="0" />
              <Tab label="Graph Communities" value="1" />
              <Tab label="Both Graphs" value="2" />
            </Tabs>
          </>
        }
      />
    </div>
  );
};

export default App;
