import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Checkbox,
  Typography,
  MenuItem,
  Tooltip,
  Button,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { MuiColorInput } from "mui-color-input";

const useStyles = makeStyles({
  smallInput: {
    "& .MuiInputBase-root": {
      height: "30px",
      padding: "1px 1px",
      width: "243px",
    },
    "& input": {
      height: "22px",
    },
    "& .MuiInputAdornment-root": {
      marginLeft: "10px",
    },
  },
  label: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  labelContainer: {
    flex: "1 1 0",
    minWidth: 0,
  },
});

export const CustomNumberInput = ({
  name,
  onChange,
  defaultValue,
  stepValue = 1,
  tooltip = "",
}) => {
  const classes = useStyles();
  return (
    <Box
      display="flex"
      alignItems="center"
      gap={2}
      sx={{ height: "30px", width: "100%" }}
    >
      <Box className={classes.labelContainer}>
        <Tooltip title={tooltip} followCursor>
          <Typography className={classes.label}>{name}</Typography>
        </Tooltip>
      </Box>
      <Box className={classes.labelContainer}>
        <TextField
          className={classes.smallInput}
          type="number"
          defaultValue={structuredClone(defaultValue)}
          onChange={onChange}
          fullWidth
          slotProps={{ htmlInput: { step: stepValue } }}
        />
      </Box>
    </Box>
  );
};

export const CustomCheckBox = ({
  name,
  onChange,
  defaultValue,
  isDynamic = true,
  tooltip = "",
}) => {
  const classes = useStyles();
  return (
    <Box
      display="flex"
      alignItems="center"
      gap={2}
      sx={{ height: "30px", width: "100%" }}
    >
      <Box className={classes.labelContainer}>
        <Tooltip title={tooltip} followCursor>
          <Typography className={classes.label}>{name}</Typography>
        </Tooltip>
      </Box>
      <Box
        className={classes.labelContainer}
        sx={{ display: "flex", justifyContent: "center" }}
      >
        {isDynamic ? (
          <Checkbox onChange={onChange} checked={defaultValue} />
        ) : (
          <Checkbox onChange={onChange} defaultChecked={defaultValue} />
        )}
      </Box>
    </Box>
  );
};

export const CustomSelect = ({
  name,
  onChange,
  defaultValue,
  options,
  tooltip = "",
}) => {
  const classes = useStyles();
  return (
    <Box
      display="flex"
      alignItems="center"
      gap={2}
      sx={{ height: "30px", width: "100%" }}
    >
      <Box className={classes.labelContainer}>
        <Tooltip title={tooltip} followCursor>
          <Typography className={classes.label}>{name}</Typography>
        </Tooltip>
      </Box>
      <Box
        className={classes.labelContainer}
        sx={{ display: "flex", justifyContent: "center" }}
      >
        <TextField
          className={classes.smallInput}
          select
          value={defaultValue}
          onChange={onChange}
          fullWidth
        >
          {options.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              sx={{ fontSize: "12px" }}
            >
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>
    </Box>
  );
};

export const CustomColorInput = ({ name, onChange, value, tooltip = "" }) => {
  const classes = useStyles();
  return (
    <Box
      display="flex"
      alignItems="center"
      gap={2}
      sx={{ height: "30px", width: "100%" }}
    >
      <Box className={classes.labelContainer}>
        <Tooltip title={tooltip} followCursor>
          <Typography className={classes.label}>{name}</Typography>
        </Tooltip>
      </Box>
      <Box className={classes.labelContainer}>
        <MuiColorInput
          value={value}
          onChange={onChange}
          isAlphaHidden
          format="hex"
          className={classes.smallInput}
        />
      </Box>
    </Box>
  );
};
