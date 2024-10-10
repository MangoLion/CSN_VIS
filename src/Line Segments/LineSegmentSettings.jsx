import React, { useContext, useEffect } from "react";
import { Grid2, Box, Button } from "@mui/material";
import {
  CustomNumberInput,
  CustomCheckBox,
  CustomSelect,
  CustomColorInput,
} from "../components/CustomComponents";
import { LineSegmentsDataContext } from "../context/LineSegmentsDataContext";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

const LineSegmentSettings = React.memo(() => {
  const {
    renderingMethod,
    setRenderingMethod,
    radius,
    setRadius,
    tubeRes,
    setTubeRes,
    autoUpdate,
    setAutoUpdate,
    intensity,
    setIntensity,
    opacity,
    setOpacity,
    showCaps,
    setShowCaps,
    cylinderHeight,
    setCylinderHeight,
    color,
    setColor,
  } = useContext(LineSegmentsDataContext);

  return (
    <Box sx={{ p: 3 }}>
      <Grid2 container spacing={2}>
        <CustomSelect
          name="Rendering Method"
          onChange={(e) => setRenderingMethod(e.target.value)}
          defaultValue={renderingMethod}
          options={[
            { value: "Tube", label: "Tube" },
            { value: "Cylinder", label: "Cylinder" },
          ]}
          tooltip="Controls the rendering method of the segments (Cylinder is typically faster)"
        />
        <CustomNumberInput
          name="Intensity"
          onChange={(e) => setIntensity(Number(e.target.value))}
          defaultValue={intensity}
          tooltip="Controls the light intensity in the scene"
        />
        <CustomNumberInput
          name="Tube Radius"
          onChange={(e) => setRadius(Number(e.target.value))}
          defaultValue={radius}
          stepValue={0.05}
          tooltip="Controls the radius of the segments (likely need to modify depending on your model)"
        />
        <CustomNumberInput
          name="Tube Resolution"
          onChange={(e) => setTubeRes(Number(e.target.value))}
          defaultValue={tubeRes}
          tooltip="Controls the resolution of the segments"
        />
        <CustomNumberInput
          name="Opacity"
          onChange={(e) => setOpacity(Number(e.target.value))}
          defaultValue={opacity}
          stepValue={0.05}
          tooltip="Controls the opacity of the segments"
        />
        <CustomColorInput
          name="Color"
          onChange={(value) => setColor(value)}
          value={color}
          tooltip="Controls the color of the segments"
        />
        {renderingMethod === "Cylinder" && (
          <CustomNumberInput
            name="Cylinder Height"
            onChange={(e) => setCylinderHeight(Number(e.target.value))}
            defaultValue={cylinderHeight}
            stepValue={0.05}
            tooltip="Controls the height of each cylinder (likely need to modify depending on your model)"
          />
        )}
        <CustomCheckBox
          name="Show Caps"
          onChange={() => setShowCaps(!showCaps)}
          defaultValue={showCaps}
          tooltip="Hide or show the caps of each segment"
        />
        <CustomCheckBox
          name="Auto Update"
          onChange={() => setAutoUpdate(!autoUpdate)}
          defaultValue={autoUpdate}
          tooltip="If on, the segments automatically render when the settings change"
        />
        <Button
          component="label"
          variant="contained"
          tabIndex={-1}
          startIcon={<PlayArrowIcon />}
          fullWidth
          sx={{ flexGrow: 1 }}
          onClick={() => window.dispatchEvent(new Event("render"))}
        >
          Render
        </Button>
      </Grid2>
    </Box>
  );
});

export default LineSegmentSettings;
