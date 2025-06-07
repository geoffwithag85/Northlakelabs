import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, Plane, Text } from '@react-three/drei';
import * as THREE from 'three';

export const Environment: React.FC = () => {
  const treadmillBeltRef = useRef<THREE.Mesh>(null);
  
  // Animate treadmill belt
  useFrame((state, delta) => {
    if (treadmillBeltRef.current) {      // Moving belt texture effect
      const material = treadmillBeltRef.current.material as THREE.MeshLambertMaterial;
      if (material.map) {
        material.map.offset.y += delta * 0.5;
      }
    }
  });

  return (
    <group>
      {/* Lab floor with subtle grid pattern */}
      <Plane 
        args={[20, 20]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <meshLambertMaterial 
          color="#f8fafc" 
          transparent 
          opacity={0.9}
        />
      </Plane>
      
      {/* Professional treadmill base */}
      <Box args={[2.2, 0.3, 4.2]} position={[0, 0.05, 0]}>
        <meshLambertMaterial color="#2d3748" />
      </Box>
      
      {/* Treadmill belt with movement indication */}
      <Box 
        ref={treadmillBeltRef}
        args={[1.8, 0.02, 3.8]} 
        position={[0, 0.21, 0]}
      >
        <meshLambertMaterial 
          color="#1a202c" 
          transparent
          opacity={0.9}
        />
      </Box>
      
      {/* Belt movement indicators */}
      {Array.from({ length: 8 }, (_, i) => (
        <Box
          key={i}
          args={[0.1, 0.01, 0.02]}
          position={[0, 0.22, -1.8 + (i * 0.5)]}
        >
          <meshLambertMaterial 
            color="#4a5568" 
            emissive="#111111"
          />
        </Box>
      ))}
      
      {/* Professional handrails */}
      <group>
        {/* Left rail */}
        <Cylinder args={[0.03, 0.03, 1.2]} position={[-1.2, 0.8, 1.5]}>
          <meshLambertMaterial color="#718096" />
        </Cylinder>
        <Cylinder args={[0.03, 0.03, 1.2]} position={[-1.2, 0.8, -1.5]}>
          <meshLambertMaterial color="#718096" />
        </Cylinder>
        <Box args={[0.05, 0.05, 3.2]} position={[-1.2, 1.0, 0]}>
          <meshLambertMaterial color="#718096" />
        </Box>
        
        {/* Right rail */}
        <Cylinder args={[0.03, 0.03, 1.2]} position={[1.2, 0.8, 1.5]}>
          <meshLambertMaterial color="#718096" />
        </Cylinder>
        <Cylinder args={[0.03, 0.03, 1.2]} position={[1.2, 0.8, -1.5]}>
          <meshLambertMaterial color="#718096" />
        </Cylinder>
        <Box args={[0.05, 0.05, 3.2]} position={[1.2, 1.0, 0]}>
          <meshLambertMaterial color="#718096" />
        </Box>
      </group>
      
      {/* Force plates under treadmill */}
      <Box args={[0.8, 0.05, 1.8]} position={[-0.4, 0.15, 0]}>
        <meshLambertMaterial 
          color="#3182ce" 
          emissive="#1a365d"
          transparent
          opacity={0.8}
        />
      </Box>
      <Box args={[0.8, 0.05, 1.8]} position={[0.4, 0.15, 0]}>
        <meshLambertMaterial 
          color="#3182ce" 
          emissive="#1a365d"
          transparent
          opacity={0.8}
        />
      </Box>
      
      {/* Lab environment */}
      <Plane args={[40, 10]} position={[0, 5, -10]}>
        <meshLambertMaterial 
          color="#edf2f7" 
          transparent 
          opacity={0.7}
        />
      </Plane>
      
      {/* Equipment racks with scientific appearance */}
      <group position={[-4, 1, 2]}>
        <Box args={[0.6, 2, 0.3]}>
          <meshLambertMaterial color="#4a5568" />
        </Box>
        {/* Equipment panels */}
        <Box args={[0.05, 0.3, 0.2]} position={[0.3, 0.5, 0]}>
          <meshLambertMaterial color="#68d391" emissive="#22543d" />
        </Box>
        <Box args={[0.05, 0.2, 0.15]} position={[0.3, 0, 0]}>
          <meshLambertMaterial color="#f56565" emissive="#742a2a" />
        </Box>
      </group>
      
      <group position={[4, 1, 2]}>
        <Box args={[0.6, 2, 0.3]}>
          <meshLambertMaterial color="#4a5568" />
        </Box>
        {/* Equipment panels */}
        <Box args={[0.05, 0.3, 0.2]} position={[-0.3, 0.5, 0]}>
          <meshLambertMaterial color="#63b3ed" emissive="#2c5282" />
        </Box>
        <Box args={[0.05, 0.2, 0.15]} position={[-0.3, 0, 0]}>
          <meshLambertMaterial color="#fbb6ce" emissive="#97266d" />
        </Box>
      </group>
      
      {/* Professional workstation */}
      <group position={[0, 0.4, -6]}>
        <Box args={[3, 0.8, 0.8]}>
          <meshLambertMaterial color="#e2e8f0" />
        </Box>
        {/* Computer monitors */}
        <Box args={[0.8, 0.5, 0.05]} position={[-0.8, 0.65, 0.4]}>
          <meshLambertMaterial color="#1a202c" />
        </Box>
        <Box args={[0.8, 0.5, 0.05]} position={[0.8, 0.65, 0.4]}>
          <meshLambertMaterial color="#1a202c" />
        </Box>
        {/* Active screens */}
        <Box args={[0.75, 0.45, 0.01]} position={[-0.8, 0.65, 0.46]}>
          <meshLambertMaterial 
            color="#4299e1" 
            emissive="#2b6cb0"
            transparent
            opacity={0.8}
          />
        </Box>
        <Box args={[0.75, 0.45, 0.01]} position={[0.8, 0.65, 0.46]}>
          <meshLambertMaterial 
            color="#48bb78" 
            emissive="#2f855a"
            transparent
            opacity={0.8}
          />
        </Box>
      </group>
      
      {/* Lab lighting fixtures */}
      <group position={[0, 4.5, 0]}>
        <Box args={[4, 0.1, 1]} rotation={[0, 0, 0]}>
          <meshLambertMaterial 
            color="#f7fafc" 
            emissive="#e2e8f0"
          />
        </Box>
      </group>
      
      {/* Information labels */}
      <Text
        position={[-2, 0.5, -3]}
        rotation={[0, Math.PI / 4, 0]}
        fontSize={0.2}
        color="#4a5568"
        anchorX="center"
        anchorY="middle"
      >
        FORCE PLATES
      </Text>
        <Text
        position={[2, 0.5, -3]}
        rotation={[0, -Math.PI / 4, 0]}
        fontSize={0.2}
        color="#4a5568"
        anchorX="center"
        anchorY="middle"
      >
        MOTION CAPTURE
      </Text>
    </group>
  );
};
