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

// Enhanced gait kinematics constants based on biomechanical research
const GAIT_KINEMATICS = {
  STEP_LENGTH: 0.65,
  HIP_FLEXION_MAX: 25 * (Math.PI / 180), // 25 degrees in radians
  HIP_EXTENSION_MAX: 15 * (Math.PI / 180), // 15 degrees hip extension
  KNEE_FLEXION_MAX: 65 * (Math.PI / 180), // 65 degrees in radians
  ANKLE_DORSIFLEXION_MAX: 20 * (Math.PI / 180), // 20 degrees in radians
  ANKLE_PLANTARFLEXION_MAX: 45 * (Math.PI / 180), // 45 degrees plantarflexion
  ARM_SWING_MAX: 20 * (Math.PI / 180), // 20 degrees arm swing
  TORSO_ROTATION_MAX: 8 * (Math.PI / 180), // 8 degrees torso rotation
  SHOULDER_COUNTER_ROTATION: 5 * (Math.PI / 180), // 5 degrees shoulder counter-rotation
  VERTICAL_DISPLACEMENT: 0.04, // 4cm vertical hip displacement
  STRIDE_WIDTH: 0.1, // 10cm stride width
  HEEL_STRIKE_ANGLE: 5 * (Math.PI / 180), // 5 degrees heel strike
  TOE_OFF_ANGLE: -15 * (Math.PI / 180), // -15 degrees toe off
};

export const HumanModel: React.FC<HumanModelProps> = ({
  position,
  animationState,
  parameters,
  isPlaying,
}) => {
  const modelRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftShoulderRef = useRef<THREE.Group>(null);
  const rightShoulderRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftThighRef = useRef<THREE.Group>(null);
  const rightThighRef = useRef<THREE.Group>(null);
  const leftShinRef = useRef<THREE.Group>(null);
  const rightShinRef = useRef<THREE.Group>(null);
  const leftFootRef = useRef<THREE.Mesh>(null);
  const rightFootRef = useRef<THREE.Mesh>(null);
    // Walking progression state
  const walkingProgressRef = useRef(0);
  const pelvicTiltRef = useRef(0);
  const pelvicRotationRef = useRef(0);
  // Walking trail state
  const walkingTrailRef = useRef<number[]>([]);

  // Enhanced gait animation with realistic biomechanics
  useFrame((state, delta) => {
    if (!modelRef.current || !isPlaying) return;

    const { gaitCycleProgress, leftFootContact, rightFootContact } = animationState;
    const { asymmetryFactor, perturbationActive, walkingSpeed } = parameters;    // Update walking progression for forward movement
    walkingProgressRef.current += delta * walkingSpeed * 0.5;
    
    // Track walking trail for visualization
    if (isPlaying && Math.floor(state.clock.elapsedTime * 10) % 5 === 0) {
      walkingTrailRef.current.push(
        modelRef.current.position.x,
        modelRef.current.position.y - 1,
        modelRef.current.position.z
      );
      // Keep only last 20 trail points
      if (walkingTrailRef.current.length > 60) {
        walkingTrailRef.current = walkingTrailRef.current.slice(-60);
      }
    }
    
    // Calculate phases for each leg with asymmetry
    const leftPhase = (gaitCycleProgress + parameters.leftLegTiming * 0.1) % 1;
    const rightPhase = (gaitCycleProgress + 0.5 + parameters.rightLegTiming * 0.1) % 1;
      // Vertical hip displacement with realistic center of mass movement
    const leftVertical = Math.sin(leftPhase * Math.PI * 2) * GAIT_KINEMATICS.VERTICAL_DISPLACEMENT;
    const rightVertical = Math.sin(rightPhase * Math.PI * 2) * GAIT_KINEMATICS.VERTICAL_DISPLACEMENT;
    const hipHeight = 0.25 + (leftVertical + rightVertical) * 0.5;
      // Add realistic pelvic tilt and rotation
    const pelvicTilt = (leftVertical - rightVertical) * 0.5;
    const pelvicRotation = Math.sin((leftPhase - rightPhase) * Math.PI) * 0.05;
    
    // Store values for use in JSX
    pelvicTiltRef.current = pelvicTilt;
    pelvicRotationRef.current = pelvicRotation;
    
    modelRef.current.position.y = hipHeight;
    modelRef.current.position.z = Math.sin(walkingProgressRef.current) * 0.3; // Treadmill walking
    modelRef.current.rotation.x = pelvicTilt * 0.3; // Subtle pelvic tilt
    modelRef.current.rotation.z = pelvicRotation; // Pelvic rotation for balance
      // Enhanced torso dynamics with shoulder counter-rotation
    if (torsoRef.current) {
      // Natural torso rotation opposite to legs
      const torsoRotation = (Math.sin(leftPhase * Math.PI * 2) - Math.sin(rightPhase * Math.PI * 2)) * 
                           GAIT_KINEMATICS.TORSO_ROTATION_MAX * 0.5;
      torsoRef.current.rotation.y = torsoRotation;
      
      // Slight forward lean when walking faster
      torsoRef.current.rotation.x = Math.max(0, (walkingSpeed - 1) * 0.1);
      
      // Subtle side-to-side sway for natural walking
      const lateralSway = Math.sin((leftPhase + rightPhase) * Math.PI * 2) * 0.02;
      torsoRef.current.position.x = lateralSway;
    }
    
    // Enhanced leg kinematics
    animateLeg(leftLegRef, leftThighRef, leftShinRef, leftFootRef, leftPhase, true, asymmetryFactor);
    animateLeg(rightLegRef, rightThighRef, rightShinRef, rightFootRef, rightPhase, false, asymmetryFactor);    // Enhanced arm swing with shoulder counter-rotation (opposite to legs)
    if (leftArmRef.current && leftShoulderRef.current) {
      // Left arm swings forward when right leg steps forward
      const leftArmSwing = Math.sin(rightPhase * Math.PI * 2) * GAIT_KINEMATICS.ARM_SWING_MAX;
      leftArmRef.current.rotation.x = leftArmSwing * walkingSpeed;
      
      // Shoulder counter-rotation
      leftShoulderRef.current.rotation.z = leftArmSwing * 0.3;
      leftShoulderRef.current.position.y = 1.8 + Math.abs(leftArmSwing) * 0.02;
      
      // Natural elbow bend during swing
      leftArmRef.current.rotation.z = Math.abs(leftArmSwing) * 0.3;
    }
    
    if (rightArmRef.current && rightShoulderRef.current) {
      // Right arm swings forward when left leg steps forward
      const rightArmSwing = Math.sin(leftPhase * Math.PI * 2) * GAIT_KINEMATICS.ARM_SWING_MAX;
      rightArmRef.current.rotation.x = rightArmSwing * walkingSpeed;
      
      // Shoulder counter-rotation
      rightShoulderRef.current.rotation.z = -rightArmSwing * 0.3;
      rightShoulderRef.current.position.y = 1.8 + Math.abs(rightArmSwing) * 0.02;
      
      // Natural elbow bend during swing
      rightArmRef.current.rotation.z = -Math.abs(rightArmSwing) * 0.3;
    }
    
    // Foot contact visualization with realistic color coding
    updateFootVisualization(leftFootRef, leftFootContact, leftPhase);
    updateFootVisualization(rightFootRef, rightFootContact, rightPhase);

    // Perturbation effects
    if (perturbationActive) {
      const perturbTime = state.clock.elapsedTime;
      const perturbAmount = Math.sin(perturbTime * 12) * 0.15;
      modelRef.current.rotation.z = perturbAmount;
      modelRef.current.position.x = Math.sin(perturbTime * 8) * 0.08;
      
      // Exaggerated arm movements during perturbation
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x += Math.sin(perturbTime * 15) * 0.3;
        rightArmRef.current.rotation.x += Math.sin(perturbTime * 15 + Math.PI) * 0.3;
      }
    } else {
      // Smooth return to normal posture
      modelRef.current.rotation.z = THREE.MathUtils.lerp(modelRef.current.rotation.z, 0, 0.1);
      modelRef.current.position.x = THREE.MathUtils.lerp(modelRef.current.position.x, 0, 0.1);
    }
  });  // Enhanced leg animation function with realistic biomechanical gait phases
  const animateLeg = (
    legRef: React.RefObject<THREE.Group | null>,
    thighRef: React.RefObject<THREE.Group | null>,
    shinRef: React.RefObject<THREE.Group | null>,
    footRef: React.RefObject<THREE.Mesh | null>,
    phase: number,
    isLeft: boolean,
    asymmetry: number
  ) => {
    if (!legRef.current || !thighRef.current || !shinRef.current || !footRef.current) return;
    
    // Apply asymmetry factor
    const asymmetryMultiplier = isLeft ? (1 - asymmetry * 0.2) : (1 + asymmetry * 0.2);
    
    // Define gait phases more precisely
    const heelStrikePhase = 0.0;
    const midStancePhase = 0.3;
    const toeOffPhase = 0.6;
    const midSwingPhase = 0.8;
    
    let hipAngle = 0;
    let kneeAngle = 0;
    let ankleAngle = 0;
    
    if (phase <= toeOffPhase) {
      // STANCE PHASE (0% to 60% of gait cycle)
      const stanceProgress = phase / toeOffPhase;
      
      // Hip: Extension to slight flexion
      hipAngle = THREE.MathUtils.lerp(
        GAIT_KINEMATICS.HIP_FLEXION_MAX * 0.3, 
        -GAIT_KINEMATICS.HIP_EXTENSION_MAX, 
        stanceProgress
      );
      
      // Knee: Loading response and midstance
      if (stanceProgress < 0.3) {
        // Loading response: slight flexion for shock absorption
        kneeAngle = Math.sin(stanceProgress * Math.PI / 0.3) * 0.3;
      } else {
        // Terminal stance: prepare for toe-off
        kneeAngle = (stanceProgress - 0.3) * 0.2;
      }
      
      // Ankle: Heel strike to toe-off preparation
      if (stanceProgress < 0.1) {
        // Heel strike: dorsiflexion
        ankleAngle = GAIT_KINEMATICS.HEEL_STRIKE_ANGLE;
      } else if (stanceProgress < 0.8) {
        // Midstance: progressive plantarflexion
        ankleAngle = THREE.MathUtils.lerp(
          GAIT_KINEMATICS.HEEL_STRIKE_ANGLE,
          0,
          (stanceProgress - 0.1) / 0.7
        );
      } else {
        // Pre-swing: plantarflexion for push-off
        ankleAngle = THREE.MathUtils.lerp(
          0,
          GAIT_KINEMATICS.TOE_OFF_ANGLE,
          (stanceProgress - 0.8) / 0.2
        );
      }
      
    } else {
      // SWING PHASE (60% to 100% of gait cycle)
      const swingProgress = (phase - toeOffPhase) / (1 - toeOffPhase);
      
      // Hip: Extension to flexion for limb advancement
      hipAngle = THREE.MathUtils.lerp(
        -GAIT_KINEMATICS.HIP_EXTENSION_MAX,
        GAIT_KINEMATICS.HIP_FLEXION_MAX,
        swingProgress
      );
      
      // Knee: Flexion for ground clearance, then extension for heel strike prep
      if (swingProgress < 0.6) {
        // Initial and mid-swing: maximum flexion for clearance
        kneeAngle = Math.sin(swingProgress * Math.PI / 0.6) * GAIT_KINEMATICS.KNEE_FLEXION_MAX;
      } else {
        // Terminal swing: extension for heel strike preparation
        const terminalProgress = (swingProgress - 0.6) / 0.4;
        kneeAngle = THREE.MathUtils.lerp(
          GAIT_KINEMATICS.KNEE_FLEXION_MAX * 0.3,
          0,
          terminalProgress
        );
      }
      
      // Ankle: Dorsiflexion for clearance and heel strike preparation
      ankleAngle = THREE.MathUtils.lerp(
        GAIT_KINEMATICS.TOE_OFF_ANGLE,
        GAIT_KINEMATICS.ANKLE_DORSIFLEXION_MAX,
        swingProgress
      );
    }
    
    // Apply angles with asymmetry
    thighRef.current.rotation.x = hipAngle * asymmetryMultiplier;
    shinRef.current.rotation.x = kneeAngle * asymmetryMultiplier;
    footRef.current.rotation.x = ankleAngle * asymmetryMultiplier;
    
    // Leg positioning for stride width
    const strideOffset = isLeft ? -GAIT_KINEMATICS.STRIDE_WIDTH : GAIT_KINEMATICS.STRIDE_WIDTH;
    legRef.current.position.x = strideOffset;
  };
  // Enhanced foot visualization with heel strike and toe-off mechanics
  const updateFootVisualization = (
    footRef: React.RefObject<THREE.Mesh | null>,
    isContact: boolean,
    phase: number
  ) => {
    if (!footRef.current) return;
    
    const material = footRef.current.material as THREE.MeshLambertMaterial;
    
    // Determine gait phase for color coding
    const isHeelStrike = phase < 0.1;
    const isMidStance = phase >= 0.1 && phase < 0.4;
    const isToeOff = phase >= 0.4 && phase < 0.6;
    const isSwing = phase >= 0.6;
    
    if (isContact) {
      if (isHeelStrike) {
        // Heel strike: bright red with impact visualization
        material.color.setHex(0xff0000);
        material.emissive.setHex(0x440000);
        footRef.current.scale.set(1.1, 0.6, 1.0); // Compressed and wider
      } else if (isMidStance) {
        // Mid-stance: orange for full contact
        material.color.setHex(0xff6600);
        material.emissive.setHex(0x331100);
        footRef.current.scale.set(1.0, 0.7, 1.0);
      } else if (isToeOff) {
        // Toe-off: yellow for push-off
        material.color.setHex(0xffff00);
        material.emissive.setHex(0x333300);
        footRef.current.scale.set(0.9, 0.8, 1.1); // Elongated for push-off
      }
    } else {
      if (isSwing) {
        // Swing phase: blue with normal size
        material.color.setHex(0x4444ff);
        material.emissive.setHex(0x000000);
        footRef.current.scale.set(1.0, 1.0, 1.0);
      }
    }
    
    // Add subtle bounce effect during heel strike
    if (isHeelStrike && isContact) {
      const bounceIntensity = Math.sin((phase / 0.1) * Math.PI);
      footRef.current.position.y = -0.5 - bounceIntensity * 0.02;
    } else {
      footRef.current.position.y = -0.5;
    }
  };
  return (
    <group ref={modelRef} position={position}>
      {/* Torso group with rotation */}
      <group ref={torsoRef}>
        {/* Main torso */}
        <Box args={[0.4, 0.8, 0.2]} position={[0, 1.5, 0]}>
          <meshLambertMaterial color="#8b5cf6" />
        </Box>        {/* Head */}
        <Sphere args={[0.15]} position={[0, 2.1, 0]}>
          <meshLambertMaterial color="#f3e8ff" />
        </Sphere>

        {/* Neck */}
        <Cylinder args={[0.08, 0.08, 0.15]} position={[0, 1.95, 0]}>
          <meshLambertMaterial color="#8b5cf6" />
        </Cylinder>

        {/* Left Shoulder */}
        <group ref={leftShoulderRef} position={[-0.35, 1.8, 0]}>
          <Sphere args={[0.08]} position={[0, 0, 0]}>
            <meshLambertMaterial color="#7c3aed" />
          </Sphere>
          
          {/* Left Arm */}
          <group ref={leftArmRef} position={[0, -0.1, 0]}>
            {/* Upper arm */}
            <Cylinder args={[0.05, 0.05, 0.3]} position={[0, -0.15, 0]}>
              <meshLambertMaterial color="#8b5cf6" />
            </Cylinder>
            {/* Forearm */}
            <Cylinder args={[0.04, 0.04, 0.3]} position={[0, -0.45, 0]}>
              <meshLambertMaterial color="#7c3aed" />
            </Cylinder>
            {/* Hand */}
            <Sphere args={[0.05]} position={[0, -0.65, 0]}>
              <meshLambertMaterial color="#f3e8ff" />
            </Sphere>
          </group>
        </group>

        {/* Right Shoulder */}
        <group ref={rightShoulderRef} position={[0.35, 1.8, 0]}>
          <Sphere args={[0.08]} position={[0, 0, 0]}>
            <meshLambertMaterial color="#7c3aed" />
          </Sphere>
          
          {/* Right Arm */}
          <group ref={rightArmRef} position={[0, -0.1, 0]}>
            {/* Upper arm */}
            <Cylinder args={[0.05, 0.05, 0.3]} position={[0, -0.15, 0]}>
              <meshLambertMaterial color="#8b5cf6" />
            </Cylinder>
            {/* Forearm */}
            <Cylinder args={[0.04, 0.04, 0.3]} position={[0, -0.45, 0]}>
              <meshLambertMaterial color="#7c3aed" />
            </Cylinder>
            {/* Hand */}
            <Sphere args={[0.05]} position={[0, -0.65, 0]}>
              <meshLambertMaterial color="#f3e8ff" />
            </Sphere>
          </group>
        </group>
      </group>      {/* Left Leg with proper joint hierarchy */}
      <group ref={leftLegRef} position={[-0.15, 1.0, 0]}>
        {/* Hip joint */}
        <Sphere args={[0.06]} position={[0, 0, 0]}>
          <meshLambertMaterial color="#5b21b6" />
        </Sphere>
        
        {/* Thigh (hip joint) */}
        <group ref={leftThighRef}>
          <Cylinder args={[0.08, 0.08, 0.5]} position={[0, -0.25, 0]}>
            <meshLambertMaterial color="#6366f1" />
          </Cylinder>
          
          {/* Knee joint */}
          <Sphere args={[0.05]} position={[0, -0.5, 0]}>
            <meshLambertMaterial color="#5b21b6" />
          </Sphere>
          
          {/* Shin (knee joint) */}
          <group ref={leftShinRef} position={[0, -0.5, 0]}>
            <Cylinder args={[0.06, 0.06, 0.5]} position={[0, -0.25, 0]}>
              <meshLambertMaterial color="#4f46e5" />
            </Cylinder>
            
            {/* Ankle joint */}
            <Sphere args={[0.04]} position={[0, -0.5, 0]}>
              <meshLambertMaterial color="#5b21b6" />
            </Sphere>
            
            {/* Foot (ankle joint) */}
            <Box 
              ref={leftFootRef}
              args={[0.12, 0.08, 0.25]} 
              position={[0, -0.5, 0.1]}
            >
              <meshLambertMaterial color="#4444ff" />
            </Box>
          </group>
        </group>
      </group>

      {/* Right Leg with proper joint hierarchy */}
      <group ref={rightLegRef} position={[0.15, 1.0, 0]}>
        {/* Hip joint */}
        <Sphere args={[0.06]} position={[0, 0, 0]}>
          <meshLambertMaterial color="#5b21b6" />
        </Sphere>
        
        {/* Thigh (hip joint) */}
        <group ref={rightThighRef}>
          <Cylinder args={[0.08, 0.08, 0.5]} position={[0, -0.25, 0]}>
            <meshLambertMaterial color="#6366f1" />
          </Cylinder>
          
          {/* Knee joint */}
          <Sphere args={[0.05]} position={[0, -0.5, 0]}>
            <meshLambertMaterial color="#5b21b6" />
          </Sphere>
          
          {/* Shin (knee joint) */}
          <group ref={rightShinRef} position={[0, -0.5, 0]}>
            <Cylinder args={[0.06, 0.06, 0.5]} position={[0, -0.25, 0]}>
              <meshLambertMaterial color="#4f46e5" />
            </Cylinder>
            
            {/* Ankle joint */}
            <Sphere args={[0.04]} position={[0, -0.5, 0]}>
              <meshLambertMaterial color="#5b21b6" />
            </Sphere>
            
            {/* Foot (ankle joint) */}
            <Box 
              ref={rightFootRef}
              args={[0.12, 0.08, 0.25]} 
              position={[0, -0.5, 0.1]}
            >
              <meshLambertMaterial color="#4444ff" />
            </Box>
          </group>
        </group>
      </group>      {/* Center of Mass indicator */}
      <group position={[0, 1.2, 0]}>
        <Sphere args={[0.03]} position={[pelvicRotationRef.current * 2, pelvicTiltRef.current * 2, 0]}>
          <meshLambertMaterial 
            color="#22d3ee" 
            emissive="#0e7490"
            transparent={true}
            opacity={0.8}
          />
        </Sphere>
        {/* COM trajectory trail */}
        <group position={[pelvicRotationRef.current * 2, pelvicTiltRef.current * 2, 0]}>
          <Box args={[0.01, 0.01, 0.1]}>
            <meshLambertMaterial color="#0891b2" transparent={true} opacity={0.3} />
          </Box>
        </group>
      </group>
      
      {/* Enhanced gait cycle progress indicator */}
      <group position={[0, 2.5, 0]}>
        <Cylinder args={[0.02, 0.02, 0.1]} rotation={[0, 0, Math.PI / 2]}>
          <meshLambertMaterial color="#10b981" />
        </Cylinder>
        <Sphere 
          args={[0.03]} 
          position={[Math.sin(animationState.gaitCycleProgress * Math.PI * 2) * 0.08, 0, 0]}
        >
          <meshLambertMaterial 
            color="#ef4444" 
            emissive="#220000"
          />
        </Sphere>
        
        {/* Phase labels */}
        <group position={[-0.12, 0.08, 0]}>
          <Box args={[0.02, 0.02, 0.02]}>
            <meshLambertMaterial color="#22c55e" />
          </Box>
        </group>
        <group position={[0.12, 0.08, 0]}>
          <Box args={[0.02, 0.02, 0.02]}>
            <meshLambertMaterial color="#f59e0b" />
          </Box>
        </group>
      </group>
      
      {/* Asymmetry visualization */}
      {parameters.asymmetryFactor > 0.1 && (
        <group position={[0, 2.8, 0]}>
          <Box args={[0.1 * parameters.asymmetryFactor, 0.02, 0.02]}>
            <meshLambertMaterial 
              color="#dc2626" 
              emissive="#220000"
            />
          </Box>
        </group>
      )}

      {/* Ground Reaction Force Visualization */}
      {animationState.leftFootContact && (
        <group position={[-0.15, -0.02, 0]}>
          <Cylinder args={[0.15, 0.15, 0.02]} position={[0, 0, 0]}>
            <meshLambertMaterial 
              color="#ff4444" 
              emissive="#220000" 
              transparent={true} 
              opacity={0.6} 
            />
          </Cylinder>
          {/* Force vector indicator */}
          <Cylinder args={[0.02, 0.02, 0.3]} position={[0, 0.15, 0]}>
            <meshLambertMaterial color="#ff0000" emissive="#440000" />
          </Cylinder>
        </group>
      )}
      
      {animationState.rightFootContact && (
        <group position={[0.15, -0.02, 0]}>
          <Cylinder args={[0.15, 0.15, 0.02]} position={[0, 0, 0]}>
            <meshLambertMaterial 
              color="#ff4444" 
              emissive="#220000" 
              transparent={true} 
              opacity={0.6} 
            />
          </Cylinder>
          {/* Force vector indicator */}
          <Cylinder args={[0.02, 0.02, 0.3]} position={[0, 0.15, 0]}>
            <meshLambertMaterial color="#ff0000" emissive="#440000" />
          </Cylinder>
        </group>
      )}

      {/* Walking trail visualization */}
      {walkingTrailRef.current.length > 3 && (
        <group>
          {Array.from({ length: Math.floor(walkingTrailRef.current.length / 3) - 1 }, (_, i) => {
            const index = i * 3;
            const opacity = (i + 1) / Math.floor(walkingTrailRef.current.length / 3);
            return (
              <Sphere 
                key={i}
                args={[0.02]} 
                position={[
                  walkingTrailRef.current[index] || 0,
                  walkingTrailRef.current[index + 1] || 0,
                  walkingTrailRef.current[index + 2] || 0
                ]}
              >
                <meshLambertMaterial 
                  color="#10b981" 
                  transparent={true} 
                  opacity={opacity * 0.5} 
                />
              </Sphere>
            );
          })}
        </group>
      )}
    </group>
  );
};
