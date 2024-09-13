import React from "react";
import "./styles/LineSegmentUploader.css";
import { Grid2, Box, Typography } from "@mui/material";
import {
  CustomNumberInput,
  CustomCheckBox,
} from "./components/CustomComponents";

const LineSegmentSettings = React.memo(
  ({
    radius,
    setRadius,
    tubeRes,
    setTubeRes,
    drawAll,
    setDrawAll,
    intensity,
    setIntensity,
    opacity,
    setOpacity,
    showCaps,
    setShowCaps,
    cylinderHeight,
    setCylinderHeight,
  }) => {
    return (
      <Box sx={{ p: 3 }}>
        <Grid2 container spacing={1}>
          <Typography sx={{ fontWeight: "bold" }}>
            Rendering Settings
          </Typography>

          <Grid2 container size={12} spacing={2}>
            <Grid2 size={6}>
              <CustomNumberInput
                name="Intensity"
                onChange={(e) => setIntensity(Number(e.target.value))}
                defaultValue={intensity}
              />
              <CustomNumberInput
                name="Tube Radius"
                onChange={(e) => setRadius(Number(e.target.value))}
                defaultValue={radius}
                stepValue={0.05}
              />
              <CustomNumberInput
                name="Tube Resolution"
                onChange={(e) => setTubeRes(Number(e.target.value))}
                defaultValue={tubeRes}
              />
              <CustomNumberInput
                name="Opacity"
                onChange={(e) => setOpacity(Number(e.target.value))}
                defaultValue={opacity}
                stepValue={0.05}
              />
            </Grid2>
            <Grid2 size={6}>
              <CustomNumberInput
                name="Cylinder Height"
                onChange={(e) => setCylinderHeight(Number(e.target.value))}
                defaultValue={cylinderHeight}
                stepValue={0.05}
              />
              <CustomCheckBox
                name="Show Caps"
                onChange={() => setShowCaps(!showCaps)}
                defaultValue={showCaps}
              />
              <CustomCheckBox
                name="Draw All Segments"
                onChange={() => setDrawAll(!drawAll)}
                defaultValue={drawAll}
              />
            </Grid2>
          </Grid2>
        </Grid2>
      </Box>
    );
  }
);

export default LineSegmentSettings;
