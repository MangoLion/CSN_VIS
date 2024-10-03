import React, { useRef, useState, useEffect, useContext } from "react";
import { ForceGraph2D } from "react-force-graph";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import convexHull from "convex-hull";
import { UniversalDataContext } from "../context/UniversalDataContext";
import { GraphCommunitiesDataContext } from "../context/GraphCommunitiesDataContext";
import GraphCommunitiesButtons from "./GraphCommunitiesButtons";
import { Box } from "@mui/material";
const GraphCommunitiesRenderer = () => {
  const {
    dGraphData,
    setDGraphData,
    graphData,
    setGraphData,
    isEmpty,
    setIsEmpty,
    use3D,
    nodeScale,
    communityAlgorithm,
    multiSelect,
    allGroups,
    selectedNodes,
    setSelectedNodes,
  } = useContext(GraphCommunitiesDataContext);

  const { segments, setColoredSegments, coloredSegments, setSelectedSegments } =
    useContext(UniversalDataContext);
  const windowRef = useRef(null); // Ref to the parent box
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setDGraphData([]);
    setSelectedSegments([]);
    setIsEmpty(true);
    setSelectedNodes([]);
    setGraphData({ nodes: [], links: [] });
    setColoredSegments([]);
  }, [segments]);

  useEffect(() => {
    setSelectedSegments([]);
    setSelectedNodes([]);
    setGraphData({ nodes: [], links: [] });
    setColoredSegments([]);
  }, [dGraphData]);

  useEffect(() => {
    setSelectedSegments([]);
    setSelectedNodes([]);
  }, [graphData, allGroups]);

  const fgRef = useRef();

  useEffect(() => {
    const updateDimensions = () => {
      if (windowRef.current) {
        const { offsetWidth, offsetHeight } = windowRef.current;
        setDimensions({ width: offsetWidth, height: offsetHeight });
      }
    };

    const resizeObserver = new ResizeObserver(updateDimensions);
    if (windowRef.current) resizeObserver.observe(windowRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!isEmpty) {
      fgRef.current.d3Force("link").distance((link) => {
        if (
          link.source.groupID.length > 0 &&
          link.source.groupID[0] == link.target.groupID[0]
        ) {
          return -15;
        }

        return 30;
      });
      if (use3D) {
        const bloomPass = new UnrealBloomPass();
        bloomPass.strength = 1;
        bloomPass.radius = 1;
        bloomPass.threshold = 0;
        fgRef.current.postProcessingComposer().addPass(bloomPass);
      }
    }
  }, [isEmpty, use3D, graphData]);

  useEffect(() => {
    const newColoredSegments = structuredClone(segments);
    graphData.nodes.forEach((node) => {
      node.members.forEach((idx) => {
        newColoredSegments[idx].color = node.color;
      });
    });
    setColoredSegments(newColoredSegments);
  }, [graphData]);

  const handleNodeClick = (node, event) => {
    if (event.button === 2) {
      // Right click
      event.preventDefault(); // Prevent default right-click menu
      let newColor;
      if (event.ctrlKey) {
        newColor = promptForColor();
      } else {
        newColor = getRandomColor();
      }

      node.color = newColor;

      // Update associated segments' colors
      const updatedSegments = coloredSegments.map((seg) =>
        node.members.includes(seg.globalIdx) ? { ...seg, color: newColor } : seg
      );

      setColoredSegments(updatedSegments);
    } else {
      // Left click (existing behavior)
      if (multiSelect) {
        setSelectedNodes((prevSelectedNodes) => {
          const isNodeAlreadySelected = prevSelectedNodes.find(
            (selectedNode) => selectedNode.id === node.id
          );
          let newState = [];
          if (!isNodeAlreadySelected) {
            newState = [...prevSelectedNodes, node];
          } else {
            newState = prevSelectedNodes.filter(
              (selectedNode) => selectedNode.id !== node.id
            );
          }
          let selected = [];
          newState.forEach((node) => {
            node.members.forEach((idx) => {
              selected.push(coloredSegments[parseInt(idx)]);
            });
          });
          setSelectedSegments(selected);
          return newState;
        });
      } else {
        if (selectedNodes[0] == node) {
          setSelectedNodes([]);
          setSelectedSegments([]);
        } else {
          let selected = [];
          node.members.forEach((idx) => {
            let seg = structuredClone(coloredSegments[parseInt(idx)]);
            if (!seg) console.log(`segment idx not found! ${idx}`);
            seg.color = node.color;
            selected.push(seg);
          });
          setSelectedSegments(selected);
          setSelectedNodes([node]);
        }
      }
    }
  };

  const calculateCentroid = (pts) => {
    //console.log(pts)
    let firstPoint = pts[0],
      lastPoint = pts[pts.length - 1];
    if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1])
      pts.push(firstPoint);
    let twiceArea = 0,
      x = 0,
      y = 0,
      nPts = pts.length,
      p1,
      p2,
      f;

    for (let i = 0, j = nPts - 1; i < nPts; j = i++) {
      p1 = pts[i];
      p2 = pts[j];
      f = p1[0] * p2[1] - p2[0] * p1[1];
      twiceArea += f;
      x += (p1[0] + p2[0]) * f;
      y += (p1[1] + p2[1]) * f;
    }
    f = twiceArea * 3;
    return [x / f, y / f];
  };

  const drawHullOnCanvas = (points, ctx, color, stretchFactor = 1.5) => {
    points = JSON.parse(JSON.stringify(points)); //deepcopy
    if (points.length < 3 || !points[0]) return;
    let hullIndices = convexHull(points);

    let hull = hullIndices.map((edge) => {
      // edge is a pair of indices, like [0, 1]
      return points[edge[0]]; //[points[edge[0]], points[edge[1]]];
    });

    //console.log(hull)

    // Compute the centroid of the convex hull
    //const centroid = d3.polygonCentroid(hull);
    const centroid = calculateCentroid(hull);
    //console.log(centroid)
    //console.log(centroid)

    // Create a new hull array with points moved away from the centroid
    const expandedHull = hull.map((point) => {
      const vector = [point[0] - centroid[0], point[1] - centroid[1]];
      //console.log(`${point} ${vector} ${centroid}`)
      return [
        centroid[0] + vector[0] * stretchFactor,
        centroid[1] + vector[1] * stretchFactor,
      ];
    });

    hull = expandedHull;
    // Add first point at the end to close the loop for Bezier curves
    hull.push(hull[0]);

    ctx.beginPath();
    for (let i = 0; i < hull.length; i++) {
      const startPt = hull[i];
      const endPt = hull[(i + 1) % hull.length];
      const midPt = [(startPt[0] + endPt[0]) / 2, (startPt[1] + endPt[1]) / 2];

      if (i === 0) {
        // Move to the first midpoint
        ctx.moveTo(midPt[0], midPt[1]);
      } else {
        // Draw quadratic Bezier curve from previous midpoint
        const prevMidPt = [
          (hull[i - 1][0] + startPt[0]) / 2,
          (hull[i - 1][1] + startPt[1]) / 2,
        ];
        ctx.quadraticCurveTo(startPt[0], startPt[1], midPt[0], midPt[1]);
      }
    }

    // Close the path for the last curve
    const lastMidPt = [
      (hull[hull.length - 1][0] + hull[0][0]) / 2,
      (hull[hull.length - 1][1] + hull[0][1]) / 2,
    ];
    ctx.quadraticCurveTo(hull[0][0], hull[0][1], lastMidPt[0], lastMidPt[1]);

    ctx.closePath();

    // Set the style for the dashed line
    ctx.setLineDash([5, 5]); // Sets up the dash pattern, adjust the numbers for different patterns
    ctx.strokeStyle = "rgba(0, 0, 0, 0.7)"; // Color for the dashed line
    ctx.lineWidth = 1; // Width of the dashed line
    ctx.stroke(); // Apply the line style to the hull

    ctx.fillStyle = color; //'rgba(150, 150, 250, 0.1)'; // Fill color
    ctx.fill();

    // Reset the dashed line to default for any subsequent drawing
    ctx.setLineDash([]);

    return centroid;
  };

  const handleNodeCanvasObject = (node, ctx, globalScale) => {
    const label = node.id.toString();

    const fontSize = 12 / globalScale; // Adjust font size against zoom level
    let size = node.size / nodeScale;

    if (size < 8) size = 8;
    if (size > 45) size = 45;
    // Draw group background or outline if the node has a groupID
    if (node.groupID.length > 0 && node.x) {
      //size *= 1.5;
      //var groupID = ;
      node.groupID.forEach((groupID) => {
        if (!window.tempt) window.tempt = {};
        if (!window.tempt[groupID]) window.tempt[groupID] = [];
        window.tempt[groupID].push([node.x, node.y]);
        //console.log(node)
        //console.log(JSON.stringify(node));
        //console.log({...node}.x)
        if (window.tempt[groupID].length == allGroups[groupID]) {
          const centroid = drawHullOnCanvas(
            window.tempt[groupID],
            ctx,
            node.groupColor
          );
          window.tempt[groupID] = false;

          if (centroid) {
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.fillText((groupID - 1).toString(), centroid[0], centroid[1]);
          }
        }
      });
    }
    const hexColor = node.color;
    let alpha = 0.4; // 50% transparency
    if (!selectedNodes || selectedNodes.length === 0) alpha = 1;
    selectedNodes.forEach((selectedNode) => {
      if (selectedNode.id == node.id) alpha = 1;
    });

    // Parse the hex color into RGB components
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    var x = node.x; // x coordinate of the circle's center
    var y = node.y; // y coordinate of the circle's center

    if (x === undefined || y === undefined) {
      console.log("INVALID NODE XY: ", x, y);
      return;
    }

    if (!size) {
      console.log("INVALID NODE SIZE: ", size);
      return;
    }

    //shadow
    ctx.fillStyle = "rgba(200, 200, 200, 0.7)";

    var innerRadius = 0; // Radius of the inner circle (start of the gradient)
    var outerRadius = size; // Radius of the outer circle (end of the gradient)

    // Draw the shadow
    ctx.beginPath();
    ctx.arc(x + 1, y + 1, outerRadius, 0, 2 * Math.PI, false);
    ctx.fill();
    //--

    // Create gradient
    var gradient = ctx.createRadialGradient(
      x,
      y,
      innerRadius,
      x,
      y,
      outerRadius
    );
    //gradient.addColorStop(1, 'rgba(255, 255, 255, 1)'); // Start color: white
    gradient.addColorStop(0, `rgba(${r * 3}, ${g * 3}, ${b * 3}, ${alpha})`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${alpha})`);

    // Set the gradient as fill style
    ctx.fillStyle = gradient;

    // Draw the circle
    ctx.beginPath();
    ctx.arc(x, y, outerRadius, 0, 2 * Math.PI, false);
    ctx.fill();

    //console.log(outerRadius,gradient)

    let scolor = `rgba(${1}, ${1}, ${1}, ${alpha})`;
    if (node.groupColor) {
      scolor = node.groupColor;
      const r2 = parseInt(node.groupColor.slice(1, 3), 16);
      const g2 = parseInt(node.groupColor.slice(3, 5), 16);
      const b2 = parseInt(node.groupColor.slice(5, 7), 16);

      //scolor = `rgba(${r2}, ${g2}, ${b2}, ${1})`;
      //alert(scolor)
    }

    ctx.strokeStyle = scolor;

    //ctx.strokeStyle = node.groupColor; // Color for the dashed line
    ctx.lineWidth = 0.4; // Width of the dashed line
    ctx.stroke(); // Apply the line style to the hull

    //ctx.strokeStyle = 'black';

    // Draw labels for larger nodes
    if (size > 5 / globalScale) {
      let fontSize_ = Math.round(fontSize + size / globalScale);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "black"; //`rgba(255, 255, 255, ${alpha*2})`;
      ctx.font = `${fontSize_}px Sans-Serif`;
      ctx.fillText(label, node.x, node.y);
      //ctx.fillText(size.toString(), node.x, node.y);
    }
  };

  const linkVisibility = (link) => communityAlgorithm !== "PCA";

  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  return (
    <div
      style={{ position: "relative", width: "100%", height: "100%" }}
      ref={windowRef}
    >
      <Box
        sx={{
          position: "absolute",
          left: 10,
          top: 10,
          zIndex: 1000,
        }}
      >
        <GraphCommunitiesButtons />
      </Box>
      {!use3D && !isEmpty && (
        <ForceGraph2D
          width={dimensions.width}
          height={dimensions.height}
          linkVisibility={linkVisibility}
          graphData={graphData}
          nodeLabel="id"
          ref={fgRef}
          onNodeClick={handleNodeClick}
          onNodeRightClick={handleNodeClick} // Add this line
          nodeCanvasObject={handleNodeCanvasObject}
          linkDirectionalArrowLength={2.5}
          linkDirectionalArrowRelPos={0.6}
          linkDirectionalArrowColor={"black"}
          linkCurvature={0.25}
          linkOpacity={1}
          linkColor={"black"}
          linkWidth={4}
          d3Force="charge" // Modify the charge force
          d3ReheatSimulation={true}
          //d3AlphaDecay={0.0228} // Can tweak this for simulation cooling rate
          //d3VelocityDecay={0.4} // Can tweak this to adjust node movement inertia
          d3ForceConfig={{
            charge: {
              strength: -220,
              distanceMax: 300, // Optional: Increase to allow repulsion over larger distances
              //distanceMin: 1    // Optional: Decrease to enhance repulsion for closely positioned nodes
            },
            link: {
              // Adjust the strength of the link force based on groupID
              strength: (link) => {
                const sourceNode = graphData.nodes[link.source];
                const targetNode = graphData.nodes[link.target];
                alert("HERE");
                return sourceNode.groupID === targetNode.groupID ? 1 : 4; // Modify as needed
              },
              // You can also configure other link force parameters here
            },
          }}
        />
      )}
    </div>
  );
};

export default GraphCommunitiesRenderer;
