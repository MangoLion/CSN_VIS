import React, { useEffect } from "react";
import { Box, TextField, Checkbox, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles({
  smallInput: {
    // Adjust padding to reduce height
    "& .MuiInputBase-root": {
      height: "30px",
      padding: "1px 1px", // Adjust padding to make the input smaller
    },
    "& input": {
      height: "22px", // Adjust height to make the input vertically shorter
    },
  },
  label: {
    overflow: "hidden",
    textOverflow: "ellipsis", // Truncate text with ellipsis
    whiteSpace: "nowrap", // Prevent text from wrapping
    fontSize: "0.75rem !important", // Adjust font size
  },
  labelContainer: {
    flex: "1 1 0", // Allow the container to shrink
    minWidth: 0, // Ensure the container can shrink to 0 width
  },
});

export const CustomNumberInput = ({
  name,
  onChange,
  defaultValue,
  stepValue = 1,
}) => {
  const classes = useStyles();
  return (
    <Box display="flex" alignItems="center" gap={2} sx={{ height: "30px" }}>
      <Box className={classes.labelContainer}>
        <Typography className={classes.label}>{name}</Typography>
      </Box>
      <Box className={classes.labelContainer}>
        <TextField
          className={classes.smallInput}
          type="number"
          defaultValue={defaultValue}
          onChange={onChange}
          fullWidth
          slotProps={{ htmlInput: { step: stepValue } }}
        />
      </Box>
    </Box>
  );
};

export const CustomCheckBox = ({ name, onChange, defaultValue }) => {
  const classes = useStyles();
  return (
    <Box display="flex" alignItems="center" gap={2} sx={{ height: "30px" }}>
      <Box className={classes.labelContainer}>
        <Typography className={classes.label}>{name}</Typography>
      </Box>
      <Box
        className={classes.labelContainer}
        sx={{ display: "flex", justifyContent: "center" }}
      >
        <Checkbox onChange={onChange} defaultChecked={defaultValue} />
      </Box>
    </Box>
  );
};
