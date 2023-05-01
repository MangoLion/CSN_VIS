import React, { useState,useRef,useEffect } from 'react';
import HugeCanvas from './HugeCanvas';
import LineSegments from './LineSegments';
import LineSegmentUploader from './LineSegmentUploader'

import DockLayout from 'rc-dock'
import "rc-dock/dist/rc-dock.css";


import "./App.css";
import { Allotment } from "allotment";
import "allotment/dist/style.css";

const segmentsBU = [
  {
    startPoint: [0, 0, 0],
    endPoint: [1, 1, 1],
    color: 'red',
  },
  {
    startPoint: [1, 0, 0],
    endPoint: [0, 1, 1],
    color: 'green',
  },
  {
    startPoint: [0, 1, 0],
    endPoint: [1, 0, 1],
    color: 'blue',
  },
];

const App = () => {

  const [streamLines, setStreamLines] = useState([]);
  const [exclude, setExclude] = useState(-1);
  const [manualUpdate, setManualUpdate] = useState(false);
  const [drawAll, setDrawAll] = useState(true);
  const [swapLayout, setSwapLayout] = useState(false);
  const [selectedSegment,setSelectedSegment] = useState(-1);
  const [radius,setRadius] = useState(0.12);
  const [tubeRes,setTubeRes] = useState(20);
  const [layerProps, setLayerProps] = useState({
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
  });

  const [segments, setSegments] = useState([]);
  const [segmentsSelected, setSegmentsSelected] = useState([]);

  const [selectRegion, setSelectRegion] = useState({
      start: null, end: null 
  });

  const defaultLayout = {
    dockbox: {
      mode: 'horizontal',
      children: [{
      mode: 'vertical',
      size: 300,
      children: [
        {
          size:100, tabs: [{ id: 'tab1', title: 'tab1',  content: <div><LineSegmentUploader setStreamLines={setStreamLines} setSegments={setSegments} />   </div>}]
        },
        {
          size:500,tabs: [
            { id: 'tab1', title: 'tab1', content: <div><HugeCanvas pixelData={[]} /> setStreamLines={setStreamLines}   </div>},
          ]
        },
        {
          size:500,tabs: [
            { id: 'tab1', title: 'tab1', content: <div><HugeCanvas pixelData={[]} /> setStreamLines={setStreamLines}  </div>},
          ]
        }
      ]
    },
    {
      size: 1000,
      tabs: [
        {id: 'tab1', title: 'tab1', content: <LineSegments segments={segments} selectRegion={setSelectRegion} />},
      ]
    }]}
  };

  const handleLayerChange = (newProps) => {
    setLayerProps(newProps);
  };

  let layout1 = (<Allotment key="main">
    <Allotment.Pane preferredSize={500} >
        <Allotment vertical={true}>
          <Allotment.Pane maxSize={100}>
          <div><LineSegmentUploader manualUpdate={manualUpdate}  key="uploader"
              setRadius={setRadius} setTubeRes={setTubeRes}
              setManualUpdate={setManualUpdate} setStreamLines={setStreamLines} 
              setSegments={setSegments} setExclude={setExclude} 
              drawAll={drawAll} setDrawAll={setDrawAll}
              swapLayout={swapLayout} setSwapLayout={setSwapLayout}/></div>
          </Allotment.Pane>
          <Allotment.Pane preferredSize={'40%'} >
            <div><HugeCanvas selectedSegment={selectedSegment} key="canvas1" cid={1} manualUpdate={manualUpdate} exclude={exclude} layerProps={layerProps} onLayerChange={handleLayerChange} setSegmentsSelected={setSegmentsSelected} streamLines2={streamLines} segments2={segments} /></div>
          </Allotment.Pane>
          <Allotment.Pane preferredSize={'45%'} >
            <div><HugeCanvas selectedSegment={selectedSegment} key="canvas2" cid={2} manualUpdate={manualUpdate} exclude={exclude} layerProps={layerProps} onLayerChange={handleLayerChange} setSegmentsSelected={setSegmentsSelected} streamLines2={streamLines} segments2={segments} /></div>
          </Allotment.Pane>
        </Allotment>
    </Allotment.Pane>
    <Allotment.Pane minSize={200}>
    <LineSegments radius={radius} tubeRes={tubeRes} setSelectedSegment={setSelectedSegment} key="line3D" drawAll={drawAll} segments={segments} selectRegion={setSelectRegion} segmentsSelected={segmentsSelected} />
    </Allotment.Pane>
  </Allotment>);

  let layout2 = (
    <Allotment key="main">
    <Allotment vertical={true}>
          <Allotment.Pane maxSize={100}>
            <div><LineSegmentUploader setRadius={setRadius} setTubeRes={setTubeRes} manualUpdate={manualUpdate}  key="uploader"
              setManualUpdate={setManualUpdate} setStreamLines={setStreamLines} 
              setSegments={setSegments} setExclude={setExclude} 
              drawAll={drawAll} setDrawAll={setDrawAll}
              swapLayout={swapLayout} setSwapLayout={setSwapLayout}/></div>
          </Allotment.Pane>
          <Allotment.Pane preferredSize={'40%'} >
          <LineSegments radius={radius} tubeRes={tubeRes} setSelectedSegment={setSelectedSegment} key="line3D" drawAll={drawAll} segments={segments} selectRegion={setSelectRegion} segmentsSelected={segmentsSelected} />
          </Allotment.Pane>
    </Allotment>
    <Allotment.Pane>
    <div><HugeCanvas selectedSegment={selectedSegment} key="canvas1" cid={1} manualUpdate={manualUpdate} exclude={exclude} layerProps={layerProps} onLayerChange={handleLayerChange} setSegmentsSelected={setSegmentsSelected} streamLines2={streamLines} segments2={segments} /></div>
    </Allotment.Pane>
    <Allotment.Pane>
    <div><HugeCanvas selectedSegment={selectedSegment} key="canvas2" cid={2} manualUpdate={manualUpdate} exclude={exclude} layerProps={layerProps} onLayerChange={handleLayerChange} setSegmentsSelected={setSegmentsSelected} streamLines2={streamLines} segments2={segments} /></div>
    </Allotment.Pane>
  </Allotment>
  )
  
  return <div className='App'>
    {(swapLayout)?layout1:layout2}
    </div>
};

export default App;
