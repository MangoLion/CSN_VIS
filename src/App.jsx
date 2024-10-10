import React, { useState, useContext, useEffect } from "react";
import "rc-dock/dist/rc-dock.css";

import "./styles/App.css";
import "allotment/dist/style.css";

import { Allotment } from "allotment";

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

const SmallTab = styled(Tab)({
  fontSize: "12px",
  width: "135px",
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

const BigDisabledTabWithTooltip = ({ tooltip, label, value }) => {
  return (
    <Tooltip title={tooltip}>
      <span>
        <BigTab label={label} value={value} disabled />
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
  const {
    segments,
    drawerOpen,
    setDrawerOpen,
    selectedRenderingWindow,
    setSelectedRenderingWindow,
    selectedSettingsWindow,
    setSelectedSettingsWindow,
  } = useContext(UniversalDataContext);
  const { dGraphData, graphData } = useContext(GraphCommunitiesDataContext);

  useEffect(() => {
    setSelectedRenderingWindow("0");
    if (segments.length === 0) setSelectedSettingsWindow("0");
  }, [segments]);

  useEffect(() => {
    if (graphData.nodes && graphData.nodes.length > 0) {
      if (selectedRenderingWindow === "0") setSelectedRenderingWindow("2");
    } else {
      setSelectedRenderingWindow("0");
      if (selectedSettingsWindow === "3") setSelectedSettingsWindow("0");
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
          <Tabs
            value={selectedRenderingWindow}
            onChange={(e, newValue) => setSelectedRenderingWindow(newValue)}
            textColor={"inherit"}
          >
            <BigTab label="Line Segments" value="0" />

            {graphData.nodes && graphData.nodes.length === 0 ? (
              <BigDisabledTabWithTooltip
                tooltip="Please run a Graph Community Algorithm"
                value="1"
                label="Graph Community"
              />
            ) : (
              <BigTab label="Graph Community" value="1" />
            )}

            {graphData.nodes && graphData.nodes.length === 0 ? (
              <BigDisabledTabWithTooltip
                tooltip="Please run a Graph Community Algorithm"
                value="2"
                label="Side by Side"
              />
            ) : (
              <BigTab label="Side by Side" value="2" />
            )}
          </Tabs>
        </AppBar>

        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
          }}
        >
          <Box
            sx={{
              ...(selectedRenderingWindow === "0" && { width: "100%" }),
              ...(selectedRenderingWindow === "1" && { display: "none" }),
              ...(selectedRenderingWindow === "2" && { width: "50%" }),
              height: "100%",
            }}
          >
            <LineSegmentsRenderer />
          </Box>
          <Divider orientation="vertical" />
          <Box
            sx={{
              ...(selectedRenderingWindow === "0" && { display: "none" }),
              ...(selectedRenderingWindow === "1" && { width: "100%" }),
              ...(selectedRenderingWindow === "2" && { width: "50%" }),
              height: "99.5%",
            }}
          >
            <GraphCommunitiesRenderer />
          </Box>
        </Box>
      </ThemeProvider>
    </div>
  );
};

export default App;
