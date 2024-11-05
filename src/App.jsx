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

import Uploader from "./Uploader/Uploader";
import LineSegmentSettings from "./Line Segments/LineSegmentSettings";
import NearestNeighborSettings from "./Nearest Neighbor/NearestNeighborSettings";
import GraphCommunitiesSettings from "./Graph Community/GraphCommunitiesSettings";
import AdjacencyMatrixSettings from "./Adjacency Matrix/AdjacencyMatrixSettings";

import LineSegmentsRenderer from "./Line Segments/LineSegmentsRenderer";
import GraphCommunitiesRenderer from "./Graph Community/GraphCommunitiesRenderer";
import AdjacencyMatrixRenderer from "./Adjacency Matrix/AdjacencyMatrixRenderer";
import { UniversalDataContext } from "./context/UniversalDataContext";
import { GraphCommunitiesDataContext } from "./context/GraphCommunitiesDataContext";

const SmallTab = styled(Tab)({
  fontSize: "12px",
  width: "110px",
});
const BigTab = styled(Tab)({
  fontSize: "16px",
  width: "150px",
});

const SmallDisabledTabWithTooltip = ({ tooltip, label, value }) => {
  return (
    <Tooltip title={tooltip}>
      <span>
        <SmallTab label={label} value={value} disabled />
      </span>
    </Tooltip>
  );
};

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
  const { segments } = useContext(UniversalDataContext);
  const { dGraphData, graphData } = useContext(GraphCommunitiesDataContext);

  const [selectedSettingsWindow, setSelectedSettingsWindow] = useState("0");
  const [selectedRenderingWindows, setSelectedRenderingWindows] = useState(
    () => ["0"]
  );
  const [drawerOpen, setDrawerOpen] = useState(true);

  useEffect(() => {
    if (
      graphData.nodes &&
      graphData.nodes.length > 0 &&
      selectedRenderingWindows.indexOf("1") === -1
    ) {
      setSelectedRenderingWindows([...selectedRenderingWindows, "1"]);
    }
  }, [graphData]);

  return (
    <div
      className="App"
      style={{ display: "flex", height: "100vh", flexDirection: "column" }}
    >
      <ThemeProvider theme={universalTheme}>
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          keepMounted
        >
          <Box sx={{ width: "550px" }}>
            <Tabs
              value={selectedSettingsWindow}
              onChange={(e, newValue) => setSelectedSettingsWindow(newValue)}
              sx={{ zIndex: -1 }}
            >
              <SmallTab label="Uploader" value="0" />

              {segments.length === 0 ? (
                <SmallDisabledTabWithTooltip
                  tooltip="Please Upload a File"
                  label="Rendering"
                  value="1"
                />
              ) : (
                <SmallTab label="Rendering" value="1" />
              )}

              {segments.length === 0 ? (
                <SmallDisabledTabWithTooltip
                  tooltip="Please Upload a File"
                  label="Nearest Neighbor"
                  value="2"
                />
              ) : (
                <SmallTab label="Nearest Neighbor" value="2" />
              )}

              {dGraphData.length === 0 ? (
                <SmallDisabledTabWithTooltip
                  tooltip="Please run a Nearest Neighbor Algorithm"
                  label="Graph Communities"
                  value="3"
                />
              ) : (
                <SmallTab label="Graph Communities" value="3" />
              )}

              {dGraphData.length === 0 ? (
                <SmallDisabledTabWithTooltip
                  tooltip="Please run a Nearest Neighbor Algorithm"
                  label="Adjacency Matrix"
                  value="4"
                />
              ) : (
                <SmallTab label="Adjacency Matrix" value="4" />
              )}
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
            <Box hidden={selectedSettingsWindow !== "4"}>
              <AdjacencyMatrixSettings />
            </Box>
          </Box>
        </Drawer>

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
          <IconButton onClick={() => setDrawerOpen(true)}>
            <SettingsIcon sx={{ color: "white" }} />
          </IconButton>
          <Typography variant="h6" noWrap>
            Curve Segment Neighborhood-Based Vector Field Exploration
          </Typography>
          <ToggleButtonGroup
            value={selectedRenderingWindows}
            onChange={(e, newValue) => {
              if (newValue.length > 0) setSelectedRenderingWindows(newValue);
            }}
          >
            <ToggleButton value="0">Line Segments</ToggleButton>
            <ToggleButton value="1">Graph Community</ToggleButton>
            <ToggleButton value="2">Adjacency Matrix</ToggleButton>
          </ToggleButtonGroup>
        </AppBar>

        <Box
          sx={{
            width: "100%",
            flexGrow: 1,
            display: "flex",
          }}
        >
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
            <LineSegmentsRenderer />
          </Box>
          <Divider orientation="vertical" />
          <Box
            sx={{
              width: `${100 / selectedRenderingWindows.length - 0.01}%`,
              height: "99.9%",
              ...(selectedRenderingWindows.indexOf("1") === -1 && {
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
              ...(selectedRenderingWindows.indexOf("2") === -1 && {
                display: "none",
              }),
            }}
          >
            {/* <AdjacencyMatrixRenderer /> */}
          </Box>
        </Box>
      </ThemeProvider>
    </div>
  );
};

export default App;
