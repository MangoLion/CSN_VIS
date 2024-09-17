import React, { useState, useEffect } from "react";
import { Grid2, Box, Button, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import MemoryIcon from "@mui/icons-material/Memory";
import { CustomNumberInput } from "../components/CustomComponents";
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

const Uploader = ({ setSegments, setStreamLines }) => {
  const [file, setFile] = useState(null);
  const [skipLines, setSkipLines] = useState(0);
  const [skipSegments, setSkipSegments] = useState(0);
  const [numSegments, setNumSegments] = useState(0);
  const [numLines, setNumLines] = useState(0);

  const handleFileUpload = (event) => {
    setFile(event.target.files[0]);
  };

  useEffect(() => {
    UploaderWorker.addEventListener("message", (event) => {
      const { segments, streamlines, linesArray } = event.data;
      setSegments(segments);
      setStreamLines(streamlines);
      setNumSegments(segments.length);
      setNumLines(linesArray.length);
    });
  });

  const handleUpload = (event) => {
    UploaderWorker.postMessage({ file, skipLines, skipSegments });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid2 container spacing={1}>
        <Typography sx={{ fontWeight: "bold", width: "100%" }}>
          Upload Settings
        </Typography>
        <Typography sx={{ fontWeight: "bold", width: "100%" }}>
          Segments: {numSegments} Streamlines: {numLines}
        </Typography>
        <Grid2 container size={12} spacing={2}>
          <Grid2
            size={3}
            sx={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
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
          </Grid2>

          <Grid2
            size={3}
            sx={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            <Button
              component="label"
              onClick={handleUpload}
              variant="contained"
              fullWidth
              startIcon={<MemoryIcon />}
              sx={{ flexGrow: 1 }}
              disabled={!file}
            >
              Process
            </Button>
          </Grid2>

          <Grid2
            size={6}
            sx={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
              <Typography noWrap>
                {file ? file.name : "No file chosen"}
              </Typography>
            </Box>
          </Grid2>
        </Grid2>
        <Grid2 container size={12} spacing={2}>
          <Grid2 size={6}>
            <CustomNumberInput
              name="Merge X Segments Together"
              onChange={(e) => setSkipSegments(Number(e.target.value))}
              defaultValue={skipSegments}
            />
          </Grid2>
          <Grid2 size={6}>
            <CustomNumberInput
              name="Skip Every X Lines"
              onChange={(e) => setSkipLines(Number(e.target.value) + 1)}
              defaultValue={skipLines}
            />
          </Grid2>
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default Uploader;
