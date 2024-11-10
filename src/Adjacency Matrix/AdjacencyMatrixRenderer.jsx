import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { Stage, Layer, Rect, Image } from "react-konva";
import Konva from "konva";
import { lineSegmentDistance } from "../Nearest Neighbor/knnHelper";
import { UniversalDataContext } from "../context/UniversalDataContext";
import { GraphCommunitiesDataContext } from "../context/GraphCommunitiesDataContext";
import { AdjacencyMatrixDataContext } from "../context/AdjacencyMatrixDataContext";

const AdjacencyMatrixRenderer = () => {
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });
  const layerRef = useRef();
  const divRef = useRef();
  const { segments, streamLines } = useContext(UniversalDataContext);
  const { dGraphData } = useContext(GraphCommunitiesDataContext);
  const { grid, setGrid, image, setImage, createWhiteImage } = useContext(
    AdjacencyMatrixDataContext
  );

  const Base64Image = ({ base64URL, ...props }) => {
    const [image, setImage] = useState(null);

    useEffect(() => {
      const img = new window.Image();
      img.src = base64URL;
      img.onload = () => {
        setImage(img);
      };
    }, [base64URL]);

    return <Image imageSmoothingEnabled={false} image={image} {...props} />;
  };

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });

    if (divRef.current) {
      resizeObserver.observe(divRef.current);
    }

    return () => {
      if (divRef.current) {
        resizeObserver.unobserve(divRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (dGraphData.length > 0) {
      setPixels(dGraphData);
    }
  }, [dGraphData]);

  useEffect(() => {
    updateView();
  }, [image]);

  const setPixels = useCallback((dGraphData) => {
    const tileSize = 1000;
    const cols = Math.ceil(segments.length / tileSize);
    const newPixels = [];
    const canvas = createWhiteImage(segments.length, segments.length, tileSize);
    let rects = [];
    for (let i = 0; i < streamLines.length; i++) {
      for (let j = 0; j < streamLines.length; j++) {
        let sl1 = streamLines[i];
        let sl2 = streamLines[j];
        if ((i + j) % 2 === 0) {
          rects.push([sl1[0], sl2[0], sl1[1] - sl1[0], sl2[1] - sl2[0]]);
          drawRectangle(
            canvas,
            sl1[0],
            sl2[0],
            sl1[1] - sl1[0],
            sl2[1] - sl2[0],
            "#f7f7f7",
            tileSize
          );
        } else {
          drawRectangle(
            canvas,
            sl1[0],
            sl2[0],
            sl1[1] - sl1[0],
            sl2[1] - sl2[0],
            "white",
            tileSize
          );
          //0
        }
      }
    }

    for (let i = 0; i < segments.length; i++) {
      dGraphData[i].forEach((idx) => {
        newPixels.push([i, idx, 1]);
      });
    }

    fillBlackPixels(canvas, newPixels, tileSize);

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < cols; j++) {
        const cv = canvas[i][j];
        const imageX = j * tileSize;
        const imageY = i * tileSize;
        canvas[i][j] = {
          width: tileSize,
          height: tileSize,
          x: imageX,
          y: imageY,
          url: cv.toDataURL(),
        };

        cv.width = 0; // set the width and height to 0 to release memory
        cv.height = 0;
      }
    }

    setImage(canvas);
  });

  function fillBlackPixels(canvases, pixelList, tileSize) {
    const samec = "rgb(227, 227, 227)";
    pixelList.forEach((pixel) => {
      const x = pixel[0];
      const y = pixel[1];
      let color = pixel[2];
      if (color == 0) color = "red";
      else if (color == 1) color = samec;
      else color = "blue";

      const row = Math.floor(y / tileSize);
      const col = Math.floor(x / tileSize);
      const canvas = canvases[row][col];
      const context = canvas.getContext("2d");
      context.fillStyle = color;
      context.fillRect(x % tileSize, y % tileSize, 1, 1);
    });
  }

  function renderCanvasGrid(canvases, tileSize, visibleArea) {
    const images = [];
    let ex = 0;
    let lasturl = "";
    for (let i = 0; i < canvases.length; i++) {
      for (let j = 0; j < canvases[i].length; j++) {
        const canvas = canvases[i][j];
        if (!canvas || canvas.width == 0 || canvas.height == 0) continue;
        let pass = true;

        if (visibleArea) {
          // Calculate the image position
          const imageX = j * tileSize;
          const imageY = i * tileSize;

          // Check if the image is within the visible area
          pass =
            imageX + canvas.width >= visibleArea.x &&
            imageX <= visibleArea.x + visibleArea.width &&
            imageY + canvas.height >= visibleArea.y &&
            imageY <= visibleArea.y + visibleArea.height;
        }
        if (!pass) {
          ex++;
          continue;
        }
        //console.log(canvas);
        //if (canvas.url == lasturl)
        //  console.log("same");
        lasturl = canvas.url;
        //console.log(`${i}-${j}`)
        images.push(
          <Base64Image
            key={`${i}-${j}`}
            base64URL={canvas.url}
            x={j * tileSize}
            y={i * tileSize}
            onload={handleLoad}
          />
        );
      }
    }
    console.log("excluded: ", ex);
    //console.log(canvases,images.length,images)
    //return images;
    setGrid(images);
  }

  const handleLoad = (image) => {
    // Disable image smoothing
    console.log("called");
    image.imageSmoothingEnabled(false);
  };

  function drawRectangle(canvases, x, y, width, height, color, tileSize) {
    const startX = Math.floor(x / tileSize);
    const startY = Math.floor(y / tileSize);
    const endX = Math.floor((x + width - 1) / tileSize);
    const endY = Math.floor((y + height - 1) / tileSize);

    for (let i = startY; i <= endY; i++) {
      for (let j = startX; j <= endX; j++) {
        if (!canvases[i]) continue;
        const canvas = canvases[i][j];
        if (!canvas) continue;
        const ctx = canvas.getContext("2d");

        const localX = j === startX ? x % tileSize : 0;
        const localY = i === startY ? y % tileSize : 0;
        const localWidth =
          j === endX ? (x + width) % tileSize || tileSize : tileSize - localX;
        const localHeight =
          i === endY ? (y + height) % tileSize || tileSize : tileSize - localY;

        ctx.fillStyle = color;
        ctx.fillRect(localX, localY, localWidth, localHeight);
      }
    }
  }

  const updateView = () => {
    let visibleArea = false;
    const layer = layerRef.current;
    if (layer)
      visibleArea = {
        x: -layer.x() / layer.scaleX(),
        y: -layer.y() / layer.scaleY(),
        width: dimensions.width / layer.scaleX(),
        height: dimensions.height / layer.scaleY(),
      };
    renderCanvasGrid(image, 1000, visibleArea);
  };

  const MemoizedRect = React.memo(({ selection }) => (
    <Rect
      x={selection.x}
      y={selection.y}
      width={selection.width}
      height={selection.height}
      fill="rgba(0, 0, 255, 0.5)"
      listening={false}
    />
  ));

  return (
    <div ref={divRef} style={{ width: "100%", height: "100%" }}>
      <Stage
        style={{
          backgroundColor: "white",
        }}
        width={dimensions.width}
        height={dimensions.height}
        imageSmoothingEnabled={false}
      >
        <Layer
          ref={layerRef}
          // onWheel={handleWheel}
          // onMouseDown={handleMouseDown}
          // onMouseMove={handleMouseMove}
          // onMouseUp={handleMouseUp}
          imageSmoothingEnabled={false}
        >
          {grid}
          {/* <MemoizedRect selection2={selection2} /> */}
        </Layer>
      </Stage>
    </div>
  );
};

export default AdjacencyMatrixRenderer;
