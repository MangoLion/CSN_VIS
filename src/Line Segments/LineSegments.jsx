import React, { useState } from "react";
import { Allotment } from "allotment";
import Uploader from "../Uploader/Uploader";
import LineSegmentSettings from "./LineSegmentSettings";
import LineSegmentsRenderer from "./LineSegmentsRenderer";

const LineSegments = () => {
  return (
    <Allotment vertical={true} defaultSizes={[187, 200, 607.1]}>
      <Allotment.Pane>
        <Uploader />
      </Allotment.Pane>
      <Allotment.Pane>
        <LineSegmentSettings key="uploader" />
      </Allotment.Pane>
      <Allotment.Pane>
        <LineSegmentsRenderer key="line3D" />
      </Allotment.Pane>
    </Allotment>
  );
};

export default LineSegments;
