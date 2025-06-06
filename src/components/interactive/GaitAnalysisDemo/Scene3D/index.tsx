import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Text, Box } from '@react-three/drei';
import * as THREE from 'three';
import { useGaitAnalysisStore } from '../store';
import { HumanModel } from './HumanModel.tsx';
import { RobotSensors } from './RobotSensors.tsx';
import { Environment } from './Environment.tsx';

export const Scene3D: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  const { 
    animationState, 
    parameters, 
    robotSensors, 
    isPlaying 
  } = useGaitAnalysisStore();

  // Update scene based on animation state
  useFrame((state, delta) => {
    if (groupRef.current && isPlaying) {
      // Optional: Add subtle scene animations
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.02;
    }
  });

  return (
    <>
      {/* Camera Controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={15}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
        target={[0, 1, 0]}
      />

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[-10, 5, -10]} intensity={0.5} />

      {/* Main scene group */}
      <group ref={groupRef}>
        {/* Environment (treadmill, lab setting) */}
        <Environment />
        
        {/* Human figure with gait animation */}
        <HumanModel
          position={[0, 0, 0]}
          animationState={animationState}
          parameters={parameters}
          isPlaying={isPlaying}
        />
        
        {/* Robot sensor array */}
        <RobotSensors
          sensors={robotSensors}
          isActive={isPlaying}
          dataQuality={0.95}
        />
        
        {/* Ground grid for reference */}
        <Grid
          position={[0, 0, 0]}
          args={[10, 10]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#6366f1"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#4f46e5"
          fadeDistance={15}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={false}
        />
      </group>

      {/* Scene labels */}
      <Text
        position={[0, 3.5, 0]}
        fontSize={0.3}
        color="#374151"
        anchorX="center"
        anchorY="middle"
      >
        AI-Integrated Gait Analysis System
      </Text>
      
      {/* Status indicators */}
      {isPlaying && (
        <Text
          position={[-3, 2.5, 0]}
          fontSize={0.2}
          color="#10b981"
          anchorX="left"
          anchorY="middle"
        >
          ● ACTIVE - Analyzing Gait Pattern
        </Text>
      )}
      
      {!isPlaying && (
        <Text
          position={[-3, 2.5, 0]}
          fontSize={0.2}
          color="#6b7280"
          anchorX="left"
          anchorY="middle"
        >
          ● PAUSED - Click Start to Begin Analysis
        </Text>
      )}
    </>
  );
};
