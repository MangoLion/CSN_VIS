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
      width: "200px",
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
      sx={{ height: "30px", width: "100%" }}
    >
      <Tooltip title={tooltip} followCursor>
        <Typography className={classes.label}>{name}</Typography>
      </Tooltip>
      <Box sx={{ flexGrow: 1 }}></Box>
      <TextField
        className={classes.smallInput}
        type="number"
        defaultValue={structuredClone(defaultValue)}
        onChange={onChange}
        slotProps={{ htmlInput: { step: stepValue } }}
      />
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
      sx={{ height: "30px", width: "100%" }}
    >
      <Tooltip title={tooltip} followCursor>
        <Typography className={classes.label}>{name}</Typography>
      </Tooltip>
      <Box sx={{ flexGrow: 1 }}></Box>
      <Box sx={{ width: "200px", display: "flex", justifyContent: "center" }}>
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
      sx={{ height: "30px", width: "100%" }}
    >
      <Tooltip title={tooltip} followCursor>
        <Typography className={classes.label}>{name}</Typography>
      </Tooltip>
      <Box sx={{ flexGrow: 1 }}></Box>
      <TextField
        className={classes.smallInput}
        select
        value={defaultValue}
        onChange={onChange}
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
  );
};

export const CustomColorInput = ({ name, onChange, value, tooltip = "" }) => {
  const classes = useStyles();
  return (
    <Box
      display="flex"
      alignItems="center"
      sx={{ height: "30px", width: "100%" }}
    >
      <Tooltip title={tooltip} followCursor>
        <Typography className={classes.label}>{name}</Typography>
      </Tooltip>
      <Box sx={{ flexGrow: 1 }}></Box>
      <MuiColorInput
        value={value}
        onChange={onChange}
        isAlphaHidden
        format="hex"
        className={classes.smallInput}
      />
    </Box>
  );
};
