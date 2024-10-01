import React, { useState, useContext, useEffect } from "react";
import "rc-dock/dist/rc-dock.css";

import "./styles/App.css";
import "allotment/dist/style.css";

import { Allotment } from "allotment";

import {
  Box,
  Divider,
  Drawer,
  Typography,
  Tab,
  Tabs,
  AppBar,
  IconButton,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import SettingsIcon from "@mui/icons-material/Settings";

import Uploader from "./Uploader/Uploader";
import LineSegmentSettings from "./Line Segments/LineSegmentSettings";
import NearestNeighborSettings from "./Nearest Neighbor/NearestNeighborSettings";

import LineSegmentsRenderer from "./Line Segments/LineSegmentsRenderer";
import GraphCommunitiesSettings from "./Graph Community/GraphCommunitiesSettings";
import GraphCommunitiesRenderer from "./Graph Community/GraphCommunitiesRenderer";
import { UniversalDataContext } from "./context/UniversalDataContext";
import { GraphCommunitiesDataContext } from "./context/GraphCommunitiesDataContext";

const drawerTabTheme = createTheme({
  components: {
    MuiTab: {
      styleOverrides: {
        root: {
          fontSize: "12px",
          width: "20%",
        },
      },
    },
  },
});

const renderingTabTheme = createTheme({
  components: {
    MuiTab: {
      styleOverrides: {
        root: {
          color: "lightGray",
          "&.Mui-selected": {
            color: "black",
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: "black",
        },
      },
    },
  },
});

const App = () => {
  const { segments } = useContext(UniversalDataContext);
  const { dGraphData } = useContext(GraphCommunitiesDataContext);

  const [selectedSettingsWindow, setSelectedSettingsWindow] = useState("0");
  const [selectedRenderingWindow, setSelectedRenderingWindow] = useState("0");
  const [open, setOpen] = useState(true);

  return (
    <div className="App" style={{ display: "flex", height: "100vh" }}>
      <Drawer open={open} onClose={() => setOpen(false)}>
        <ThemeProvider theme={drawerTabTheme}>
          <Box sx={{ width: "550px" }}>
            <Tabs
              value={selectedSettingsWindow}
              onChange={(e, newValue) => setSelectedSettingsWindow(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ zIndex: -1 }}
            >
              <Tab label="Uploader" value="0" />
              <Tab
                label="Rendering"
                value="1"
                disabled={segments.length === 0}
              />
              <Tab
                label="Nearest Neighbor"
                value="2"
                disabled={segments.length === 0}
              />
              <Tab
                label="Graph Communities"
                value="3"
                disabled={dGraphData.length === 0}
              />
            </Tabs>
            <Box hidden={selectedSettingsWindow !== "0"}>
              <Uploader />
            </Box>
            <Box hidden={selectedSettingsWindow !== "1"}>
              <LineSegmentSettings />
            </Box>
            <Box hidden={selectedSettingsWindow !== "2"}>
              <NearestNeighborSettings />
            </Box>
            <Box hidden={selectedSettingsWindow !== "3"}>
              <GraphCommunitiesSettings />
            </Box>
          </Box>
        </ThemeProvider>
      </Drawer>

      <AppBar
        position="fixed"
        sx={{
          height: "75px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          paddingLeft: "20px",
          gap: "20px",
        }}
      >
        <IconButton onClick={() => setOpen(true)}>
          <SettingsIcon sx={{ color: "white" }} />
        </IconButton>
        <Typography variant="h6" noWrap>
          Curve Segment Neighborhood-Based Vector Field Exploration
        </Typography>
        <ThemeProvider theme={renderingTabTheme}>
          <Tabs
            value={selectedRenderingWindow}
            onChange={(e, newValue) => setSelectedRenderingWindow(newValue)}
          >
            <Tab label="Line Segments" value="0" />
            <Tab label="Graph Communities" value="1" />
            <Tab label="Side by Side" value="2" />
          </Tabs>
        </ThemeProvider>
      </AppBar>

      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          paddingTop: "75px",
        }}
      >
        {selectedRenderingWindow === "0" && (
          <Box sx={{ width: "100%", height: "100%" }}>
            <LineSegmentsRenderer />
          </Box>
        )}
        {selectedRenderingWindow === "1" && (
          <Box sx={{ width: "100%", height: "100%" }}>
            <GraphCommunitiesRenderer />
          </Box>
        )}
        {selectedRenderingWindow === "2" && (
          <>
            <Box sx={{ width: "50%", height: "100%" }}>
              <LineSegmentsRenderer />
            </Box>
            <Divider orientation="vertical" />
            <Box sx={{ width: "50%", height: "100%" }}>
              <GraphCommunitiesRenderer />
            </Box>
          </>
        )}
      </Box>
    </div>
  );
};

export default App;
