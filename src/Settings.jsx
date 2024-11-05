import React, { useState, useContext, useEffect } from "react";

import { Box, Tab, Tabs, Tooltip } from "@mui/material";

import Uploader from "./Uploader/Uploader";
import LineSegmentSettings from "./Line Segments/LineSegmentSettings";
import NearestNeighborSettings from "./Nearest Neighbor/NearestNeighborSettings";
import GraphCommunitiesSettings from "./Graph Community/GraphCommunitiesSettings";
import AdjacencyMatrixSettings from "./Adjacency Matrix/AdjacencyMatrixSettings";

import { UniversalDataContext } from "./context/UniversalDataContext";
import { GraphCommunitiesDataContext } from "./context/GraphCommunitiesDataContext";

const SmallDisabledTabWithTooltip = ({ tooltip, label, value }) => {
  return (
    <Tooltip title={tooltip}>
      <span style={{ width: "20%" }}>
        <Tab
          label={label}
          value={value}
          disabled
          sx={{ fontSize: "12px", width: "100%" }}
        />
      </span>
    </Tooltip>
  );
};
const Settings = () => {
  const { segments, selectedSettingsWindow, setSelectedSettingsWindow } =
    useContext(UniversalDataContext);
  const { dGraphData } = useContext(GraphCommunitiesDataContext);
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: "1000px" }}>
        <Tabs
          value={selectedSettingsWindow}
          onChange={(e, newValue) => setSelectedSettingsWindow(newValue)}
          sx={{ zIndex: -1 }}
        >
          <Tab
            label="Uploader"
            value="0"
            sx={{ fontSize: "12px", width: "20%" }}
          />

          {segments.length === 0 ? (
            <SmallDisabledTabWithTooltip
              tooltip="Please Upload a File"
              label="Rendering"
              value="1"
            />
          ) : (
            <Tab
              label="Rendering"
              value="1"
              sx={{ fontSize: "12px", width: "20%" }}
            />
          )}

          {segments.length === 0 ? (
            <SmallDisabledTabWithTooltip
              tooltip="Please Upload a File"
              label="Nearest Neighbor"
              value="2"
            />
          ) : (
            <Tab
              label="Nearest Neighbor"
              value="2"
              sx={{ fontSize: "12px", width: "20%" }}
            />
          )}

          {dGraphData.length === 0 ? (
            <SmallDisabledTabWithTooltip
              tooltip="Please run a Nearest Neighbor Algorithm"
              label="Graph Communities"
              value="3"
            />
          ) : (
            <Tab
              label="Graph Communities"
              value="3"
              sx={{ fontSize: "12px", width: "20%" }}
            />
          )}

          {dGraphData.length === 0 ? (
            <SmallDisabledTabWithTooltip
              tooltip="Please run a Nearest Neighbor Algorithm"
              label="Adjacency Matrix"
              value="4"
            />
          ) : (
            <Tab
              label="Adjacency Matrix"
              value="4"
              sx={{ fontSize: "12px", width: "20%" }}
            />
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
    </Box>
  );
};

export default Settings;
