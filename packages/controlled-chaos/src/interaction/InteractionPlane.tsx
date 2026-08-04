"use client";

import { useMemo, useRef, type MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Plane, Vector2, Vector3, type Mesh } from "three";
import type { ForceMode, PointerForce } from "../systems/types";

type InteractionPlaneProps = {
  forceRef: MutableRefObject<PointerForce>;
  mode: ForceMode;
  radius: number;
  strength: number;
  enabled?: boolean;
};

/**
 * Invisible poster-space plane for pointer/touch forces.
 * Updates a ref every frame — never React state.
 */
export function InteractionPlane({
  forceRef,
  mode,
  radius,
  strength,
  enabled = true,
}: InteractionPlaneProps) {
  const meshRef = useRef<Mesh>(null);
  const { camera, gl } = useThree();
  const raycaster = useThree((state) => state.raycaster);
  const pointer = useThree((state) => state.pointer);
  const hitPoint = useMemo(() => new Vector3(), []);
  const prev = useMemo(() => new Vector3(), []);
  const plane = useMemo(() => new Plane(new Vector3(0, 0, 1), -0.07), []);
  const ndc = useMemo(() => new Vector2(), []);
  const activeRef = useRef(false);

  useFrame(() => {
    const force = forceRef.current;
    if (!enabled) {
      force.active = false;
      return;
    }

    ndc.copy(pointer);
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.ray.intersectPlane(plane, hitPoint);
    if (!hit) {
      force.active = activeRef.current;
      return;
    }

    prev.set(force.position[0], force.position[1], force.position[2]);
    force.previousPosition = [
      force.position[0],
      force.position[1],
      force.position[2],
    ];
    force.position = [hitPoint.x, hitPoint.y, hitPoint.z];
    force.velocity = [
      hitPoint.x - prev.x,
      hitPoint.y - prev.y,
      hitPoint.z - prev.z,
    ];
    force.radius = radius;
    force.strength = strength;
    force.mode = mode;
    force.active = activeRef.current;
    force.pressure = activeRef.current ? 1 : 0;
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, 0, 0.07]}
      onPointerDown={(event) => {
        event.stopPropagation();
        activeRef.current = true;
        gl.domElement.setPointerCapture(event.pointerId);
      }}
      onPointerUp={(event) => {
        activeRef.current = false;
        try {
          gl.domElement.releasePointerCapture(event.pointerId);
        } catch {
          // ignore
        }
      }}
      onPointerLeave={() => {
        activeRef.current = false;
      }}
      onPointerMove={(event) => {
        if (!activeRef.current) return;
        event.stopPropagation();
      }}
    >
      <planeGeometry args={[1.08, 1.92]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}
