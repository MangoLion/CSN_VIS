import React, { useState } from 'react';

const LineSegmentUploader= React.memo(({setRadius,setTubeRes,swapLayout,setSwapLayout,drawAll, setDrawAll, manualUpdate,setManualUpdate,setStreamLines,setSegments, setExclude}) => {
  const [lines, setLines] = useState([]);
  const [skipLines, setSkipLines] = useState(0);
  const [skipSegments, setSkipSegments] = useState(0);
  const [file, setFile] = useState(null);
  const [exclude, setExclude2] = useState(-1);

  const handleFileUpload = (event) => {
    setFile(event.target.files[0]);
  };

  function createZeroMatrix(n) {
    let matrix = new Array(n);
    for (let i = 0; i < n; i++) {
      matrix[i] = new Array(n);
      for (let j = 0; j < n; j++) {
        matrix[i][j] = 0;
      }
    }
    return matrix;
  }
  

  const handleUpload  = (event) => {
    const reader = new FileReader();
    let segments = [];
    reader.readAsText(file);
    reader.onload = (event) => {
      let globalIdx = 0, lineIDx = 0;
      const text = event.target.result;
      const streamlines = [];
      let endIDx = 0;
      let lineSkipCount = 0;
      let linesArray = text.trim().split('\n').map(line => {
        lineSkipCount++;
        if (lineSkipCount > 1 && lineSkipCount % skipLines === 0){
          //console.log(lineSkipCount,skipLines,lineSkipCount % skipLines);
          return [];
      }
        //console.log("HHHHERR");
        const coords = line.trim().split(' ').map(parseFloat);
        const streamline = [endIDx];
        const points = [];
        //let segSkipCount = 0;
        let ss = 1;
        if (skipSegments > 1)
          ss = skipSegments;
        for (let i = 0; i < coords.length; i += 4*ss) {
          //segSkipCount++;
          //if (segSkipCount > 0 && segSkipCount % skipSegments === 0)
          //  continue;

            let start = [coords[i], coords[i+1], coords[i+2]];
            let end = [coords[i+4*ss], coords[i+4*ss+1], coords[i+4*ss+2]];
            let midpoint = [  (start[0] + end[0]) / 2,
              (start[1] + end[1]) / 2,
              (start[2] + end[2]) / 2
            ];
            if (!(start.every((num) => !isNaN(num)) &&
              end.every((num) => !isNaN(num)) ))
              continue;

            segments.push({
                startPoint: start,
                endPoint: end,
                midPoint: midpoint,
                color: 'yellow',
                lineIDx:lineIDx,
                globalIdx: globalIdx,
              neighbors: []
            });
          points.push(start);
          points.push(end);

          globalIdx++;
          endIDx = globalIdx;
        }
        streamline.push(endIDx);
        streamlines.push(streamline);
        endIDx++;
        //console.log(points);
        //console.log(points);
        lineIDx++;
        return [points];
      }); 

      linesArray = linesArray.filter(l=>l.length>0);

      //setMatrix(createZeroMatrix(segments.length));
      setSegments(segments);
      //console.log(segments);
      //console.log("Streamlines:", streamlines);
      
      setStreamLines(streamlines);
      //console.log(linesArray.length)
      setLines(linesArray);
    };
  };

  const handleExcludeChange = (event) => {
      setExclude2(event.target.value);
      setExclude(Number(event.target.value));
  };

  return (
    <div>
      <input type="file" onChange={handleFileUpload} />
      <button onClick={handleUpload}>Upload</button>
      <button onClick={()=>{setSwapLayout(!swapLayout)}}>Swap Layout</button>
      <br/>
      Streamlines: {lines.length}
      {/* {lines.map((line, i) => (
        <div key={i}>
          {line.map((point, j) => (
            <span key={j}>[{point.join(', ')}]</span>
          ))}
        </div>
      ))} */}
      <br/>
      <label>
          Skip every x lines:
          <input style={{ maxWidth: '45px' }} type="number" value={skipLines} onChange={((e)=>{setSkipLines(Number(e.target.value)+1)})} />
        </label>&nbsp;
        <label>
          Merge x segments together:
          <input style={{ maxWidth: '45px' }} type="number" value={skipSegments} onChange={((e)=>{setSkipSegments(Number(e.target.value))})} />
        </label> <br/>
      <label>
          Exclude close segments:
          <input style={{ maxWidth: '45px' }} type="number" value={exclude} onChange={(handleExcludeChange)} />
        </label><br/>
        <label>
          Tube Radius:
          <input defaultValue={0.012} style={{ maxWidth: '45px' }} type="number" onChange={(e)=>{setRadius(Number(e.target.value));}} />
        </label>
        <label>
          Tube Resolution:
          <input defaultValue={20} style={{ maxWidth: '45px' }} type="number" onChange={(e)=>{setTubeRes(Number(e.target.value));}} />
        </label>
        <label>
      <input
        type="checkbox"
        checked={manualUpdate}
        onChange={()=>{
            setManualUpdate(!manualUpdate);
        }}
      />
      Manual Update
      </label>
      <label>
      <input
        type="checkbox"
        checked={drawAll}
        onChange={()=>{
            setDrawAll(!drawAll);
        }}
      />
      Draw all segments
      </label>
      
    </div>
  );
});

export default LineSegmentUploader;
