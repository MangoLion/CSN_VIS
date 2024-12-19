import React, { useState, useEffect, useContext } from "react";
import {
  Grid2,
  Box,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import MemoryIcon from "@mui/icons-material/Memory";
import { LoadingButton } from "@mui/lab";
import { CustomNumberInput } from "../components/CustomComponents";
import { UniversalDataContext } from "../context/UniversalDataContext";
const UploaderWorker = new Worker(
  new URL("./UploaderWorker.jsx", import.meta.url),
  { type: "module" }
);

const VisuallyHiddenInput = styled("input")({
  accept: ".txt",
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const Uploader = ({}) => {
  const { setStreamLines, setSegments } = useContext(UniversalDataContext);
  const [file, setFile] = useState(null);
  const [skipLines, setSkipLines] = useState(0);
  const [skipSegments, setSkipSegments] = useState(0);
  const [numSegments, setNumSegments] = useState(0);
  const [numLines, setNumLines] = useState(0);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = (event) => {
    setFile(event.target.files[0]);
  };

  useEffect(() => {
    UploaderWorker.addEventListener("message", (event) => {
      if (event.data.type === "progress") {
        setProgress(event.data.progress);
      } else {
        const { segments, streamlines, linesArray } = event.data;
        setProgress(0);
        setSegments(segments);
        setStreamLines(streamlines);
        setNumSegments(segments.length);
        setNumLines(linesArray.length);
      }
    });
  });

  const handleUpload = (event) => {
    UploaderWorker.postMessage({ file, skipLines, skipSegments });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid2 container spacing={2}>
        <Typography sx={{ fontWeight: "bold", width: "100%" }}>
          Segments: {numSegments} Streamlines: {numLines}
        </Typography>
        <Button
          component="label"
          role={undefined}
          variant="contained"
          tabIndex={-1}
          startIcon={<CloudUploadIcon />}
          fullWidth
          sx={{ flexGrow: 1 }}
        >
          Upload
          <VisuallyHiddenInput
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
          />
        </Button>
        <LoadingButton
          component="label"
          onClick={handleUpload}
          variant="contained"
          fullWidth
          startIcon={<MemoryIcon />}
          sx={{ flexGrow: 1 }}
          disabled={!file}
          loading={progress !== 0 && progress !== 100}
          loadingIndicator={
            <CircularProgress
              variant="determinate"
              value={progress}
              size={20}
            />
          }
        >
          Process
        </LoadingButton>
        <Typography noWrap textAlign="center" sx={{ width: "100%" }}>
          {file ? file.name : "No file chosen"}
        </Typography>
        <CustomNumberInput
          name="Merge X Segments Together"
          onChange={(e) => setSkipSegments(Number(e.target.value))}
          defaultValue={skipSegments}
        />
        <CustomNumberInput
          name="Skip Every X Lines"
          onChange={(e) => setSkipLines(Number(e.target.value) + 1)}
          defaultValue={skipLines}
        />
      </Grid2>
    </Box>
  );
};

export default Uploader;
