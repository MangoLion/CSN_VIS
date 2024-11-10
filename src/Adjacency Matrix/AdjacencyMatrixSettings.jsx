import React, { useState, useEffect, useContext } from "react";
import { Box, Grid2, Button } from "@mui/material";
import { CustomCheckBox, CustomSelect } from "../components/CustomComponents";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { AdjacencyMatrixDataContext } from "../context/AdjacencyMatrixDataContext";
const AdjacencyMatrixSettings = () => {
  const {
    grid,
    setGrid,
    snap,
    setSnap,
    selectMode,
    setSelectMode,
    selectColor,
    setSelectColor,
  } = useContext(AdjacencyMatrixDataContext);
  return (
    <Box sx={{ p: 3 }}>
      <Grid2 container spacing={2}>
        <CustomSelect
          name="Select Mode"
          defaultValue={selectMode}
          onChange={(e) => setSelectMode(e.target.value)}
          options={[
            { value: "single", label: "Single" },
            { value: "area", label: "Area" },
            { value: "row", label: "Row" },
            { value: "col", label: "Column" },
          ]}
        />
        <CustomSelect
          name="Select Color"
          defaultValue={selectColor}
          onChange={(e) => setSelectColor(e.target.value)}
          options={[
            { value: "one", label: "Single Color" },
            { value: "two", label: "Query + Neighbor" },
          ]}
        />
        <CustomCheckBox
          name="Snap"
          onChange={(e) => setSnap(!snap)}
          defaultValue={snap}
        />
        <Button
          component="label"
          variant="contained"
          tabIndex={-1}
          startIcon={<PlayArrowIcon />}
          fullWidth
          sx={{ flexGrow: 1 }}
        >
          Render
        </Button>
      </Grid2>
    </Box>
  );
};

export default AdjacencyMatrixSettings;
