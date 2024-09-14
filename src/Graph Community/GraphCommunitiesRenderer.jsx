import React, { useRef, useState, useEffect } from "react";
import { ForceGraph2D } from "react-force-graph";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";

const GraphCommunitiesRenderer = ({
  graphData,
  isEmpty,
  use3D,
  setSegmentsSelected,
  nodeScale,
  selectedNode,
  setSelectedNode,
  selectedNodes,
  setSelectedNodes,
  communityAlgorithm,
}) => {
  const windowRef = useRef(null); // Ref to the parent box
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

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
          console.log(link);
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
      const updatedSegments = segments.map((seg) =>
        node.members.includes(seg.globalIdx) ? { ...seg, color: newColor } : seg
      );

      setSegmentsSelected(updatedSegments);
    } else {
      // Left click (existing behavior)
      if (multiSelect) {
        setSelectedNodes((prevSelectedNodes) => {
          const isNodeAlreadySelected = prevSelectedNodes.find(
            (selectedNode) => selectedNode.id === node.id
          );
          if (!isNodeAlreadySelected) {
            const newState = [...prevSelectedNodes, node];
            let selected = [];
            newState.forEach((node) => {
              node.members.forEach((idx) => {
                let seg = segments[parseInt(idx)];
                seg.color = node.color;
                selected.push(seg);
              });
            });
            setSegmentsSelected(selected);
            return newState;
          }
          return prevSelectedNodes;
        });
      } else {
        setSelectedNodes([]);
        if (selectedNode == node) {
          setSelectedNode(false);
          setSegmentsSelected(segments);
        } else {
          let selected = [];
          node.members.forEach((idx) => {
            let seg = segments[parseInt(idx)];
            if (!seg) console.log(`segment idx not found! ${idx}`);
            seg.color = node.color;
            selected.push(seg);
          });
          setSegmentsSelected(selected);
          setSelectedNode(node);
        }
      }
    }
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
    if (selectedNode) {
      if (selectedNode.id == node.id) alpha = 1;
    } else if (selectedNodes.length > 0) {
      if (selectedNodes.map((node) => node.id).includes(node.id)) alpha = 1;
    } else {
      //nothing is selected
      alpha = 1;
    }

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

  return (
    <div style={{ width: "100%", height: "100%" }} ref={windowRef}>
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
