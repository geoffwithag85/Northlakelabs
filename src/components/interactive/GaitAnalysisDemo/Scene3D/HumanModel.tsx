import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere, Cylinder } from '@react-three/drei';
import * as THREE from 'three';
import type { AnimationState, GaitParameters } from '../types';

interface HumanModelProps {
  position: [number, number, number];
  animationState: AnimationState;
  parameters: GaitParameters;
  isPlaying: boolean;
}

export const HumanModel: React.FC<HumanModelProps> = ({
  position,
  animationState,
  parameters,
  isPlaying,
}) => {
  const modelRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftFootRef = useRef<THREE.Mesh>(null);
  const rightFootRef = useRef<THREE.Mesh>(null);

  // Animate the human model based on gait cycle
  useFrame((state, delta) => {
    if (!modelRef.current || !isPlaying) return;

    const { gaitCycleProgress, leftFootContact, rightFootContact } = animationState;
    const { asymmetryFactor, perturbationActive } = parameters;    // Calculate leg positions based on gait cycle
    const leftPhase = gaitCycleProgress;
    const rightPhase = (gaitCycleProgress + 0.5) % 1; // Opposite phase

    // Position model so feet touch treadmill surface
    // Treadmill surface is at y=0.21
    // Foot box center should be at y=0.21 + 0.04 (half of foot height 0.08)
    // Since feet end up at model.position.y, we set it to 0.25
    const treadmillSurface = 0.21;
    const footHalfHeight = 0.04; // Half the foot box height (0.08/2)
    const baseHeight = treadmillSurface + footHalfHeight;
    const hipHeight = baseHeight + Math.sin(gaitCycleProgress * Math.PI * 4) * 0.02;
    modelRef.current.position.y = hipHeight;

    // Leg swing animations
    if (leftLegRef.current) {
      const leftSwing = Math.sin(leftPhase * Math.PI * 2) * 0.3;
      leftLegRef.current.rotation.x = leftSwing * (1 - asymmetryFactor * 0.3);
    }

    if (rightLegRef.current) {
      const rightSwing = Math.sin(rightPhase * Math.PI * 2) * 0.3;
      rightLegRef.current.rotation.x = rightSwing * (1 + asymmetryFactor * 0.3);
    }    // Foot contact visualization
    if (leftFootRef.current) {
      const material = leftFootRef.current.material as THREE.MeshLambertMaterial;
      if (material.color) {
        material.color.setHex(leftFootContact ? 0xff4444 : 0x4444ff);
      }
      leftFootRef.current.scale.y = leftFootContact ? 0.8 : 1.0;
    }

    if (rightFootRef.current) {
      const material = rightFootRef.current.material as THREE.MeshLambertMaterial;
      if (material.color) {
        material.color.setHex(rightFootContact ? 0xff4444 : 0x4444ff);
      }
      rightFootRef.current.scale.y = rightFootContact ? 0.8 : 1.0;
    }

    // Perturbation effects
    if (perturbationActive) {
      const perturbAmount = Math.sin(state.clock.elapsedTime * 10) * 0.1;
      modelRef.current.rotation.z = perturbAmount;
      modelRef.current.position.x = Math.sin(state.clock.elapsedTime * 8) * 0.05;
    } else {
      modelRef.current.rotation.z = THREE.MathUtils.lerp(modelRef.current.rotation.z, 0, 0.1);
      modelRef.current.position.x = THREE.MathUtils.lerp(modelRef.current.position.x, 0, 0.1);
    }
  });

  return (
    <group ref={modelRef} position={position}>
      {/* Torso */}
      <Box args={[0.4, 0.8, 0.2]} position={[0, 1.5, 0]}>
        <meshLambertMaterial color="#8b5cf6" />
      </Box>

      {/* Head */}
      <Sphere args={[0.15]} position={[0, 2.1, 0]}>
        <meshLambertMaterial color="#f3e8ff" />
      </Sphere>

      {/* Arms */}
      <Cylinder args={[0.05, 0.05, 0.6]} position={[-0.3, 1.5, 0]} rotation={[0, 0, 0.2]}>
        <meshLambertMaterial color="#8b5cf6" />
      </Cylinder>
      <Cylinder args={[0.05, 0.05, 0.6]} position={[0.3, 1.5, 0]} rotation={[0, 0, -0.2]}>
        <meshLambertMaterial color="#8b5cf6" />
      </Cylinder>

      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.15, 1.0, 0]}>
        {/* Thigh */}
        <Cylinder args={[0.08, 0.08, 0.5]} position={[0, -0.25, 0]}>
          <meshLambertMaterial color="#6366f1" />
        </Cylinder>
        {/* Shin */}
        <Cylinder args={[0.06, 0.06, 0.5]} position={[0, -0.75, 0]}>
          <meshLambertMaterial color="#4f46e5" />
        </Cylinder>        {/* Foot */}
        <Box 
          ref={leftFootRef}
          args={[0.12, 0.08, 0.25]} 
          position={[0, -1.0, 0.1]}
        >
          <meshLambertMaterial color="#4444ff" />
        </Box>
      </group>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.15, 1.0, 0]}>
        {/* Thigh */}
        <Cylinder args={[0.08, 0.08, 0.5]} position={[0, -0.25, 0]}>
          <meshLambertMaterial color="#6366f1" />
        </Cylinder>
        {/* Shin */}
        <Cylinder args={[0.06, 0.06, 0.5]} position={[0, -0.75, 0]}>
          <meshLambertMaterial color="#4f46e5" />
        </Cylinder>        {/* Foot */}
        <Box 
          ref={rightFootRef}
          args={[0.12, 0.08, 0.25]} 
          position={[0, -1.0, 0.1]}
        >
          <meshLambertMaterial color="#4444ff" />
        </Box>
      </group>

      {/* Gait cycle progress indicator */}
      <group position={[0, 2.5, 0]}>
        <Cylinder args={[0.02, 0.02, 0.1]} rotation={[0, 0, Math.PI / 2]}>
          <meshLambertMaterial color="#10b981" />
        </Cylinder>
        <Box 
          args={[0.02, 0.02, 0.02]} 
          position={[Math.sin(animationState.gaitCycleProgress * Math.PI * 2) * 0.05, 0, 0]}
        >
          <meshLambertMaterial color="#ef4444" />
        </Box>
      </group>
    </group>
  );
};
