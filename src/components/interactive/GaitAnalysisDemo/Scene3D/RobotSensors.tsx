import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere, Cylinder, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { RobotSensorData } from '../types';

interface RobotSensorsProps {
  sensors: RobotSensorData[];
  isActive: boolean;
  dataQuality: number;
}

interface SensorComponentProps {
  sensor: RobotSensorData;
  isActive: boolean;
}

const SensorComponent: React.FC<SensorComponentProps> = ({ sensor, isActive }) => {
  const sensorRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!sensorRef.current) return;

    // Subtle animation when active
    if (isActive) {
      sensorRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      
      // Pulsing glow effect
      if (glowRef.current) {
        const intensity = 0.5 + Math.sin(state.clock.elapsedTime * 4) * 0.3;
        glowRef.current.scale.setScalar(intensity);
        const material = glowRef.current.material as THREE.MeshBasicMaterial;
        if (material.opacity !== undefined) {
          material.opacity = intensity * 0.3;
        }
      }
    }
  });

  const getSensorGeometry = () => {
    switch (sensor.sensorType) {
      case 'force_plate':
        return (
          <Box args={[0.6, 0.05, 0.4]}>
            <meshLambertMaterial color={isActive ? "#10b981" : "#6b7280"} />
          </Box>
        );
      case 'imu':
        return (
          <Box args={[0.1, 0.1, 0.1]}>
            <meshLambertMaterial color={isActive ? "#3b82f6" : "#6b7280"} />
          </Box>
        );
      case 'camera':
        return (
          <Cylinder args={[0.08, 0.08, 0.15]}>
            <meshLambertMaterial color={isActive ? "#8b5cf6" : "#6b7280"} />
          </Cylinder>
        );
      case 'pressure':
        return (
          <Sphere args={[0.06]}>
            <meshLambertMaterial color={isActive ? "#f59e0b" : "#6b7280"} />
          </Sphere>
        );
      default:
        return (
          <Box args={[0.1, 0.1, 0.1]}>
            <meshLambertMaterial color="#6b7280" />
          </Box>
        );
    }
  };

  const getSensorLabel = () => {
    const labels = {
      force_plate: 'Force Plate',
      imu: 'IMU Sensor',
      camera: 'Camera',
      pressure: 'Pressure Sensor',
    };
    return labels[sensor.sensorType] || 'Sensor';
  };

  return (
    <group ref={sensorRef} position={sensor.position}>
      {/* Main sensor geometry */}
      {getSensorGeometry()}
      
      {/* Glow effect when active */}
      {isActive && (
        <Sphere ref={glowRef} args={[0.2]}>
          <meshBasicMaterial 
            color={sensor.sensorType === 'force_plate' ? "#10b981" : "#3b82f6"} 
            transparent 
            opacity={0.2} 
          />
        </Sphere>
      )}
      
      {/* Data quality indicator */}
      <Box 
        args={[0.02, sensor.dataQuality * 0.3, 0.02]} 
        position={[0.2, sensor.dataQuality * 0.15, 0]}
      >
        <meshLambertMaterial 
          color={sensor.dataQuality > 0.8 ? "#10b981" : sensor.dataQuality > 0.5 ? "#f59e0b" : "#ef4444"} 
        />
      </Box>
      
      {/* Sensor label */}
      <Text
        position={[0, -0.3, 0]}
        fontSize={0.08}
        color={isActive ? "#374151" : "#6b7280"}
        anchorX="center"
        anchorY="middle"
      >
        {getSensorLabel()}
      </Text>
      
      {/* Status indicator */}
      <Text
        position={[0, -0.4, 0]}
        fontSize={0.06}
        color={isActive ? "#10b981" : "#6b7280"}
        anchorX="center"
        anchorY="middle"
      >
        {isActive ? '● ACTIVE' : '○ STANDBY'}
      </Text>
    </group>
  );
};

export const RobotSensors: React.FC<RobotSensorsProps> = ({ 
  sensors, 
  isActive, 
  dataQuality 
}) => {
  const sensorsRef = useRef<THREE.Group>(null);

  // Animate sensor array
  useFrame((state) => {
    if (sensorsRef.current && isActive) {
      // Subtle coordinated movement
      sensorsRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  return (
    <group ref={sensorsRef}>
      {/* Individual sensors */}
      {sensors.map((sensor) => (
        <SensorComponent
          key={sensor.sensorId}
          sensor={sensor}
          isActive={isActive && sensor.isActive}
        />
      ))}
      
      {/* Data flow visualization */}
      {isActive && (
        <group>
          {sensors.map((sensor, index) => (
            <group key={`flow-${sensor.sensorId}`}>
              {/* Data stream particles */}
              <Sphere args={[0.01]} position={[
                sensor.position[0] + Math.sin(Date.now() * 0.001 + index) * 0.1,
                sensor.position[1] + 0.5 + Math.sin(Date.now() * 0.002 + index) * 0.2,
                sensor.position[2]
              ]}>
                <meshBasicMaterial color="#60a5fa" />
              </Sphere>
            </group>
          ))}
        </group>
      )}
      
      {/* Processing unit visualization */}
      <group position={[0, 2.8, -1]}>
        <Box args={[0.4, 0.2, 0.3]}>
          <meshLambertMaterial color={isActive ? "#5b21b6" : "#6b7280"} />
        </Box>
        <Text
          position={[0, -0.2, 0]}
          fontSize={0.08}
          color={isActive ? "#374151" : "#6b7280"}
          anchorX="center"
          anchorY="middle"
        >
          AI Processing Unit
        </Text>
        
        {/* Processing indicator */}
        {isActive && (
          <Sphere args={[0.02]} position={[0, 0.15, 0.16]}>
            <meshBasicMaterial color="#10b981" />
          </Sphere>
        )}
      </group>
      
      {/* System status display */}
      <Text
        position={[2.5, 2, 0]}
        fontSize={0.12}
        color={isActive ? "#10b981" : "#6b7280"}
        anchorX="left"
        anchorY="middle"
      >
        {isActive ? 'SENSOR ARRAY ACTIVE' : 'SENSOR ARRAY STANDBY'}
      </Text>
      
      <Text
        position={[2.5, 1.7, 0]}
        fontSize={0.1}
        color="#374151"
        anchorX="left"
        anchorY="middle"
      >
        Data Quality: {(dataQuality * 100).toFixed(0)}%
      </Text>
      
      <Text
        position={[2.5, 1.4, 0]}
        fontSize={0.1}
        color="#374151"
        anchorX="left"
        anchorY="middle"
      >
        Active Sensors: {sensors.filter(s => s.isActive).length}/{sensors.length}
      </Text>
    </group>
  );
};
