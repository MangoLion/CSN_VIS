import React, {
  useMemo,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { Canvas, extend, useThree, useFrame } from "@react-three/fiber";
import { TubeGeometry, BufferGeometry } from "three";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2";
extend({ LineSegments2 });
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";
import { OrbitControls, TrackballControls } from "@react-three/drei";
import * as THREE from "three";
import {
  mergeGeometries,
  mergeBufferGeometries,
} from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { distance3D } from "./knnHelper.js";

import { Vector3 } from "three";
import {
  InstancedMesh,
  Matrix4,
  MeshPhongMaterial,
  Color,
  Quaternion,
} from "three";

extend({ TrackballControls });

const ComplexSegments = ({
  segments,
  radius,
  tubeRes,
  opacity,
  showCaps,
  cylinderHeight,
}) => {
  const { scene } = useThree();
  const meshesRef = useRef([]);

  useEffect(() => {
    const material = new THREE.MeshPhongMaterial({
      transparent: true,
      opacity: opacity,
    });

    const tubeGeometry = new THREE.CylinderGeometry(
      radius,
      radius,
      cylinderHeight,
      tubeRes,
      1,
      true
    );

    const tubeMesh = new THREE.InstancedMesh(
      tubeGeometry,
      material,
      segments.length
    );

    const dummy = new THREE.Object3D();

    segments.forEach((segment, i) => {
      const startPoint = new Vector3(...segment.startPoint);
      const endPoint = new Vector3(...segment.endPoint);

      const direction = new THREE.Vector3().subVectors(endPoint, startPoint);

      // Axis and angle for the cylinder orientation
      const axis = new THREE.Vector3(0, 1, 0).cross(direction).normalize();
      const angle = Math.acos(
        new THREE.Vector3(0, 1, 0).dot(direction.normalize())
      );

      // Set cylinder mesh position and orientation
      dummy.position.set(...segment.midPoint);
      const quaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle);
      dummy.setRotationFromQuaternion(quaternion);

      const distance = new THREE.Vector3()
        .subVectors(startPoint, endPoint)
        .length();
      dummy.scale.set(1, distance, 1);
      dummy.updateMatrix();
      tubeMesh.setMatrixAt(i, dummy.matrix);

      // Update the color of the cylinder
      tubeMesh.setColorAt(i, new Color(segment.color));
    });

    tubeMesh.instanceMatrix.needsUpdate = true;
    tubeMesh.instanceColor.needsUpdate = true;
    scene.add(tubeMesh);
    meshesRef.current.push(tubeMesh);

    if (showCaps) {
      const capGeometry = new THREE.CircleGeometry(radius, tubeRes);

      const startCapMesh = new THREE.InstancedMesh(
        capGeometry,
        material,
        segments.length
      );
      const endCapMesh = new THREE.InstancedMesh(
        capGeometry,
        material,
        segments.length
      );

      const dummy = new THREE.Object3D();

      segments.forEach((segment, i) => {
        const startPoint = new THREE.Vector3(...segment.startPoint);
        const endPoint = new THREE.Vector3(...segment.endPoint);

        const direction = new THREE.Vector3().subVectors(endPoint, startPoint);

        // Axis and angle for the cylinder orientation
        const axis = new THREE.Vector3(0, 1, 0).cross(direction).normalize();
        const angle = Math.acos(
          new THREE.Vector3(0, 1, 0).dot(direction.normalize())
        );

        // Set cylinder mesh position and orientation
        const quaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle);

        if (i === 0 || segment.lineIDx !== segments[i - 1].lineIDx) {
          const startCap = new THREE.Mesh(
            new THREE.CircleGeometry(radius, tubeRes), // Adjust radius and segments as needed
            new THREE.MeshStandardMaterial({
              color: segment.color,
              opacity: opacity,
              transparent: true,
            }) // Adjust material properties
          );
          startCap.position.copy(startPoint);
          startCap.rotation.setFromQuaternion(quaternion);
          startCap.rotateX(Math.PI / 2); // Rotate to face the cylinder direction
          scene.add(startCap);
          meshesRef.current.push(startCap); // Add to scene or group
        }

        if (
          i === segments.length - 1 ||
          segment.lineIDx !== segments[i + 1].lineIDx
        ) {
          const endCap = new THREE.Mesh(
            new THREE.CircleGeometry(radius, tubeRes), // Adjust radius and segments as needed
            new THREE.MeshStandardMaterial({
              color: segment.color,
              opacity: opacity,
              transparent: true,
            }) // Adjust material properties
          );
          endCap.position.copy(endPoint);
          endCap.rotation.setFromQuaternion(quaternion);
          endCap.rotateX(-Math.PI / 2); // Rotate to face the cylinder direction
          scene.add(endCap);
          meshesRef.current.push(endCap); // Add to scene or group
        }
      });
    }

    // Cleanup function to remove the previous instanced mesh
    return () => {
      if (meshesRef.current) {
        for (let i = 0; i < meshesRef.current.length; i++) {
          scene.remove(meshesRef.current[i]);
          meshesRef.current[i].geometry.dispose();
          meshesRef.current[i].material.dispose();
          meshesRef.current[i] = null;
        }
      }
      meshesRef.current = [];
    };
  }, [segments, radius, tubeRes, scene, opacity, showCaps, cylinderHeight]);

  return null;
};

const SimpleLineSegments = ({
  radius,
  tubeRes,
  segments,
  setSelectedSegment,
  opacity,
  showCaps,
  cylinderHeight,
}) => {
  const groupRef = useRef();
  const { camera, raycaster, gl } = useThree();
  const [mouse, setMouse] = useState(new THREE.Vector2());
  const prevLineMeshesRef = useRef();

  const handleClick = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.button !== 2) return;

      const rect = gl.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(
        groupRef.current.children,
        true
      );

      if (intersects.length > 0) {
        const intersection = intersects[0];
        const intersectedLine = intersection.object;
        const intersectionPoint = intersection.point;

        let closestSegmentIndex = -1;
        let minDistance = Infinity;

        let idx = 0;
        segments.forEach((segment) => {
          const startPoint = new THREE.Vector3(...segment.startPoint);
          const endPoint = new THREE.Vector3(...segment.endPoint);

          const centerPoint = new THREE.Vector3()
            .addVectors(startPoint, endPoint)
            .multiplyScalar(0.5);

          const distance = centerPoint.distanceTo(intersectionPoint);
          if (distance < minDistance) {
            minDistance = distance;
            closestSegmentIndex = idx;
          }
          idx++;
        });

        setSelectedSegment(closestSegmentIndex);
      }
    },
    [camera, raycaster, gl.domElement, setSelectedSegment, segments, mouse]
  );

  const lineMeshes = useMemo(() => {
    if (!segments || segments.length === 0) {
      return null;
    }

    const tubeGeometry = new THREE.CylinderGeometry(
      radius,
      radius,
      cylinderHeight,
      tubeRes,
      1,
      true
    );

    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color(segments[0].color),
      transparent: true,
      opacity: opacity,
    });

    const tubeMesh = new THREE.InstancedMesh(
      tubeGeometry,
      material,
      segments.length
    );

    const dummy = new THREE.Object3D();

    segments.forEach((segment, i) => {
      const startPoint = new THREE.Vector3(...segment.startPoint);
      const endPoint = new THREE.Vector3(...segment.endPoint);

      const direction = new THREE.Vector3().subVectors(endPoint, startPoint);

      // Axis and angle for the cylinder orientation
      const axis = new THREE.Vector3(0, 1, 0).cross(direction).normalize();
      const angle = Math.acos(
        new THREE.Vector3(0, 1, 0).dot(direction.normalize())
      );

      // Set cylinder mesh position and orientation
      dummy.position.set(...segment.midPoint);
      const quaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle);
      dummy.setRotationFromQuaternion(quaternion);

      const distance = new THREE.Vector3()
        .subVectors(startPoint, endPoint)
        .length();
      dummy.scale.set(1, distance, 1);
      dummy.updateMatrix();
      tubeMesh.setMatrixAt(i, dummy.matrix);
    });

    if (showCaps) {
      const res = [tubeMesh];
      for (let i = 0; i < segments.length; i++) {
        const startPoint = new THREE.Vector3(...segments[i].startPoint);
        const endPoint = new THREE.Vector3(...segments[i].endPoint);

        const direction = new THREE.Vector3().subVectors(endPoint, startPoint);

        // Calculate axis and angle for the cylinder orientation
        const axis = new THREE.Vector3(0, 1, 0).cross(direction).normalize();
        const angle = Math.acos(
          new THREE.Vector3(0, 1, 0).dot(direction.normalize())
        );

        // Create a quaternion for the cylinder rotation
        const quaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle);

        // Create start cap
        if (i === 0 || segments[i].lineIDx !== segments[i - 1].lineIDx) {
          const startCap = new THREE.Mesh(
            new THREE.CircleGeometry(radius, tubeRes), // Adjust radius and segments as needed
            new THREE.MeshStandardMaterial({
              color: segments[i].color,
              opacity: opacity,
              transparent: true,
            }) // Adjust material properties
          );
          startCap.position.copy(startPoint);
          startCap.rotation.setFromQuaternion(quaternion);
          startCap.rotateX(Math.PI / 2); // Rotate to face the cylinder direction
          res.push(startCap); // Add to scene or group
        }

        // Create end cap
        if (
          i === segments.length - 1 ||
          segments[i].lineIDx !== segments[i + 1].lineIDx
        ) {
          const endCap = new THREE.Mesh(
            new THREE.CircleGeometry(radius, tubeRes), // Adjust radius and segments as needed
            new THREE.MeshStandardMaterial({
              color: segments[i].color,
              opacity: opacity,
              transparent: true,
            }) // Adjust material properties
          );
          endCap.position.copy(endPoint);
          endCap.rotation.setFromQuaternion(quaternion);
          endCap.rotateX(-Math.PI / 2); // Rotate to face the cylinder direction
          res.push(endCap); // Add to scene or group
        }
      }
      return res;
    }

    return [tubeMesh];
  }, [segments, radius, tubeRes, opacity, showCaps, cylinderHeight]);

  useEffect(() => {
    if (prevLineMeshesRef.current) {
      prevLineMeshesRef.current.map((mesh) => {
        mesh.geometry.dispose();
        mesh.material.dispose();
      });
    }
    prevLineMeshesRef.current = lineMeshes;
  }, [lineMeshes]);

  useEffect(() => {
    gl.domElement.addEventListener("contextmenu", handleClick);
    return () => {
      gl.domElement.removeEventListener("contextmenu", handleClick);
    };
  }, [gl.domElement, handleClick]);

  return (
    <group ref={groupRef}>
      {lineMeshes &&
        lineMeshes.map((mesh, idx) => <primitive key={idx} object={mesh} />)}
    </group>
  );
};

const DirectionalLightWithCamera = ({ intensity }) => {
  const directionalLightRef = useRef();
  const { camera } = useThree();

  useFrame(() => {
    if (directionalLightRef.current && camera) {
      //console.log("synced")
      directionalLightRef.current.position.copy(camera.position);
      directionalLightRef.current.rotation.copy(camera.rotation);
    }
  });

  return <directionalLight ref={directionalLightRef} intensity={intensity} />;
};

const LineSegments = ({
  radius,
  tubeRes,
  drawAll,
  segments,
  segmentsSelected,
  setSelectedSegment,
  intensity,
  opacity,
  showCaps,
  cylinderHeight,
}) => {
  return (
    <Canvas style={{ width: "100%", height: "100%" }}>
      <ambientLight intensity={0.5} />
      <DirectionalLightWithCamera intensity={intensity} />
      <TrackballControls makeDefault />
      {segmentsSelected.length === 0 && drawAll && (
        <SimpleLineSegments
          radius={radius}
          tubeRes={tubeRes}
          setSelectedSegment={setSelectedSegment}
          segments={segments}
          opacity={opacity}
          showCaps={showCaps}
          cylinderHeight={cylinderHeight}
        />
      )}
      {segmentsSelected.length > 0 && (
        <ComplexSegments
          radius={radius}
          tubeRes={tubeRes}
          segments={segmentsSelected}
          opacity={opacity}
          showCaps={showCaps}
          cylinderHeight={cylinderHeight}
        />
      )}
    </Canvas>
  );
};

export default LineSegments;
