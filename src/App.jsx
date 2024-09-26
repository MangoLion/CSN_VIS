import React, { useState } from "react";
import "rc-dock/dist/rc-dock.css";

import "./styles/App.css";
import "allotment/dist/style.css";

import { Box, Divider, Drawer, IconButton } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";

import Uploader from "./Uploader/Uploader";
import LineSegmentSettings from "./Line Segments/LineSegmentSettings";
import NearestNeighborSettings from "./Nearest Neighbor/NearestNeighborSettings";

import LineSegmentsRenderer from "./Line Segments/LineSegmentsRenderer";
import GraphCommunitiesSettings from "./Graph Community/GraphCommunitiesSettings";
import GraphCommunitiesRenderer from "./Graph Community/GraphCommunitiesRenderer";

const App = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="App" style={{ display: "flex" }}>
      <IconButton
        onClick={() => setOpen(true)}
        sx={{ margin: 2, height: "40px" }}
      >
        <SettingsIcon />
      </IconButton>
      <Divider orientation="vertical" flexItem />
      <Drawer open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: "800px" }}>
          <Uploader />
          <Divider variant="middle" />
          <LineSegmentSettings />
          <Divider variant="middle" />
          <NearestNeighborSettings />
          <Divider variant="middle" />
          <GraphCommunitiesSettings />
        </Box>
      </Drawer>
      <LineSegmentsRenderer />
      <GraphCommunitiesRenderer />
    </div>
  );
};

export default App;
