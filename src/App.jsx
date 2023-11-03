import React, { useState,useRef,useEffect } from 'react';
import HugeCanvas from './HugeCanvas';
import LineSegments from './LineSegments';
import LineSegmentUploader from './LineSegmentUploader'

import "rc-dock/dist/rc-dock.css";
import BarChart from './PlotView';


import "./App.css";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import Vis from './components/Vis';

const App = () => {

  const [streamLines, setStreamLines] = useState([]);
  const [exclude, setExclude] = useState(-1);
  const [manualUpdate, setManualUpdate] = useState(false);
  const [drawAll, setDrawAll] = useState(true);
  const [swapLayout, setSwapLayout] = useState(false);
  const [selectedSegment,setSelectedSegment] = useState(-1);
  const [radius,setRadius] = useState(0.12);
  const [tubeRes,setTubeRes] = useState(20);
  const [showPlotView,setShowPlotView] = useState(true);
  const [layerProps, setLayerProps] = useState({
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
  });

  const [segments, setSegments] = useState([]);
  const [segmentsSelected, setSegmentsSelected] = useState([]);

  const [canvasData, setCanvasData] = useState({});
  const [settings, setSettings] = useState({});

  const [selectRegion, setSelectRegion] = useState({
      start: null, end: null 
  });

  const [graphData,setGraphData] = useState(null);

  /**
   * description
   * @param {*} newProps 
   */
  const handleLayerChange = (newProps) => {
    setLayerProps(newProps);
  };

  
  return <div className='App'>
    <Allotment key="main">
    <Allotment vertical={true}>
          <Allotment.Pane maxSize={100}>
            <div><LineSegmentUploader {
              ...{setShowPlotView, showPlotView, 
                  setRadius, 
                  setTubeRes, 
                  manualUpdate, setManualUpdate, 
                  setStreamLines, 
                  setSegments, 
                  setExclude, 
                  drawAll, setDrawAll, 
                  swapLayout, setSwapLayout,
                  settings, setSettings
                }} key="uploader" /></div>
          </Allotment.Pane>
          <Allotment.Pane preferredSize={'40%'} >
          <LineSegments {...{radius, tubeRes, setSelectedSegment, drawAll, segments, setSelectRegion, segmentsSelected}} key="line3D" />

          </Allotment.Pane>
    </Allotment>
    <Allotment.Pane>
    <div><HugeCanvas {
      ...{selectedSegment, 
          manualUpdate, 
          exclude, 
          layerProps, 
          handleLayerChange, 
          setSegmentsSelected, 
          setGraphData,
          canvasData, setCanvasData}}
          onLayerChange={handleLayerChange}
           streamLines2={streamLines} segments2={segments} key="canvas1" cid={1} />
    </div>
    </Allotment.Pane>
    <Allotment.Pane>
    {(showPlotView)?<Vis graphData={graphData} setSegmentsSelected={setSegmentsSelected} segments={segments}/>:<div><HugeCanvas {...{selectedSegment, manualUpdate, exclude, layerProps, handleLayerChange, setSegmentsSelected}} streamLines2={streamLines} segments2={segments} key="canvas2" cid={2} /></div>}
    </Allotment.Pane>
  </Allotment>
    </div>
};

export default App;
