import React, { useState, useContext, useEffect } from "react";
import "rc-dock/dist/rc-dock.css";

import "./styles/App.css";
import "allotment/dist/style.css";

import {
  Box,
  Button,
  Divider,
  Drawer,
  Typography,
  Tab,
  Tabs,
  AppBar,
  IconButton,
  Tooltip,
  styled,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import SettingsIcon from "@mui/icons-material/Settings";

import Settings from "./Settings";

import LineSegmentsRenderer from "./Line Segments/LineSegmentsRenderer";
import GraphCommunitiesRenderer from "./Graph Community/GraphCommunitiesRenderer";
import AdjacencyMatrixRenderer from "./Adjacency Matrix/AdjacencyMatrixRenderer";
import { UniversalDataContext } from "./context/UniversalDataContext";
import { GraphCommunitiesDataContext } from "./context/GraphCommunitiesDataContext";
import { alignProperty } from "@mui/material/styles/cssUtils";

const universalTheme = createTheme({
  components: {
    MuiTooltip: {
      defaultProps: {
        followCursor: true,
        enterDelay: 500,
      },
    },
    MuiIconButton: {
      defaultProps: {
        color: "primary",
      },
    },
  },
});

const App = () => {
  const { selectedRenderingWindows, setSelectedRenderingWindows } =
    useContext(UniversalDataContext);
  const { graphData } = useContext(GraphCommunitiesDataContext);
  useEffect(() => {
    if (
      graphData.nodes &&
      graphData.nodes.length > 0 &&
      selectedRenderingWindows.indexOf("2") === -1
    ) {
      setSelectedRenderingWindows([...selectedRenderingWindows, "2"]);
    }
  }, [graphData]);

  return (
    <div
      className="App"
      style={{ display: "flex", height: "100vh", flexDirection: "column" }}
    >
      <ThemeProvider theme={universalTheme}>
        <AppBar
          sx={{
            position: "static",
            height: "75px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            paddingLeft: "20px",
            gap: "20px",
          }}
        >
          <Typography variant="h6" noWrap>
            Curve Segment Neighborhood-Based Vector Field Exploration
          </Typography>
          <ToggleButtonGroup
            value={selectedRenderingWindows}
            onChange={(e, newValue) => {
              if (newValue.length > 0) setSelectedRenderingWindows(newValue);
            }}
          >
            <ToggleButton value="0">Settings</ToggleButton>
            <ToggleButton value="1">Line Segments</ToggleButton>
            <ToggleButton value="2">Graph Community</ToggleButton>
            <ToggleButton value="3">Adjacency Matrix</ToggleButton>
          </ToggleButtonGroup>
        </AppBar>

        <Box
          sx={{
            width: "100%",
            flexGrow: 1,
            display: "flex",
          }}
        >
          <Box sx={{ height: "99.9%", flexGrow: 1, display: "flex" }}>
            <Box
              sx={{
                width: `${100 / selectedRenderingWindows.length - 0.01}%`,
                height: "99.9%",
                ...(selectedRenderingWindows.indexOf("0") === -1 && {
                  display: "none",
                }),
                overflow: "hidden",
              }}
            >
              <Settings />
            </Box>
            <Divider orientation="vertical" />
            <Box
              sx={{
                width: `${100 / selectedRenderingWindows.length - 0.01}%`,
                height: "99.9%",
                ...(selectedRenderingWindows.indexOf("1") === -1 && {
                  display: "none",
                }),
                overflow: "hidden",
              }}
            >
              <LineSegmentsRenderer />
            </Box>
            <Divider orientation="vertical" />
            <Box
              sx={{
                width: `${100 / selectedRenderingWindows.length - 0.01}%`,
                height: "99.9%",
                ...(selectedRenderingWindows.indexOf("2") === -1 && {
                  display: "none",
                }),
              }}
            >
              <GraphCommunitiesRenderer />
            </Box>
            <Divider orientation="vertical" />
            <Box
              sx={{
                width: `${100 / selectedRenderingWindows.length - 0.01}%`,
                height: "100%",
                ...(selectedRenderingWindows.indexOf("3") === -1 && {
                  display: "none",
                }),
              }}
            >
              {/* <AdjacencyMatrixRenderer /> */}
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    </div>
  );
};

export default App;
