import React from 'react';
import { Box, Cylinder, Plane } from '@react-three/drei';

export const Environment: React.FC = () => {
  return (
    <group>
      {/* Lab floor */}
      <Plane 
        args={[20, 20]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <meshLambertMaterial color="#f8fafc" />
      </Plane>
      
      {/* Treadmill base */}
      <Box args={[2, 0.2, 4]} position={[0, 0.1, 0]}>
        <meshLambertMaterial color="#374151" />
      </Box>
      
      {/* Treadmill belt */}
      <Box args={[1.8, 0.02, 3.8]} position={[0, 0.21, 0]}>
        <meshLambertMaterial color="#1f2937" />
      </Box>
      
      {/* Treadmill side rails */}
      <Cylinder args={[0.05, 0.05, 0.8]} position={[-1.0, 0.6, 1.5]} rotation={[0, 0, 0]}>
        <meshLambertMaterial color="#6b7280" />
      </Cylinder>
      <Cylinder args={[0.05, 0.05, 0.8]} position={[1.0, 0.6, 1.5]} rotation={[0, 0, 0]}>
        <meshLambertMaterial color="#6b7280" />
      </Cylinder>
      
      {/* Lab walls (distant) */}
      <Plane args={[40, 10]} position={[0, 5, -10]} rotation={[0, 0, 0]}>
        <meshLambertMaterial color="#e5e7eb" />
      </Plane>
      
      {/* Equipment racks */}
      <Box args={[0.6, 2, 0.3]} position={[-4, 1, 2]}>
        <meshLambertMaterial color="#4b5563" />
      </Box>
      <Box args={[0.6, 2, 0.3]} position={[4, 1, 2]}>
        <meshLambertMaterial color="#4b5563" />
      </Box>
      
      {/* Lab bench */}
      <Box args={[3, 0.8, 0.8]} position={[0, 0.4, -6]}>
        <meshLambertMaterial color="#d1d5db" />
      </Box>
      
      {/* Monitor stands */}
      <Cylinder args={[0.05, 0.05, 1.5]} position={[-2, 0.75, -3]} rotation={[0, 0, 0]}>
        <meshLambertMaterial color="#374151" />
      </Cylinder>
      <Cylinder args={[0.05, 0.05, 1.5]} position={[2, 0.75, -3]} rotation={[0, 0, 0]}>
        <meshLambertMaterial color="#374151" />
      </Cylinder>
      
      {/* Monitor screens */}
      <Box args={[0.8, 0.5, 0.05]} position={[-2, 1.2, -3]}>
        <meshLambertMaterial color="#1f2937" />
      </Box>
      <Box args={[0.8, 0.5, 0.05]} position={[2, 1.2, -3]}>
        <meshLambertMaterial color="#1f2937" />
      </Box>
      
      {/* Ceiling lights */}
      <Box args={[1, 0.1, 1]} position={[-2, 4, 0]}>
        <meshBasicMaterial color="#ffffff" />
      </Box>
      <Box args={[1, 0.1, 1]} position={[2, 4, 0]}>
        <meshBasicMaterial color="#ffffff" />
      </Box>
      
      {/* Cable management */}
      <Cylinder args={[0.02, 0.02, 2]} position={[-1.5, 0.5, -1]} rotation={[Math.PI / 2, 0, 0]}>
        <meshLambertMaterial color="#1f2937" />
      </Cylinder>
      <Cylinder args={[0.02, 0.02, 2]} position={[1.5, 0.5, -1]} rotation={[Math.PI / 2, 0, 0]}>
        <meshLambertMaterial color="#1f2937" />
      </Cylinder>
    </group>
  );
};
