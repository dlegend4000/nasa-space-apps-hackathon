"use client";

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

interface Satellite {
  id: string;
  name: string;
  position: [number, number, number];
  orbit: THREE.Vector3[];
  coverage: number;
  type: string;
}

interface GlobeVisualizationProps {
  satellites?: Satellite[];
  className?: string;
}

// Earth component
function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (earthRef.current) {
      earthRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <Sphere ref={earthRef} args={[1, 64, 64]}>
      <meshPhongMaterial
        color="#1e40af"
        transparent
        opacity={0.8}
        wireframe={false}
      />
    </Sphere>
  );
}

// Satellite component
function SatelliteDot({ position, type, coverage }: { position: [number, number, number], type: string, coverage: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  const getColor = (type: string) => {
    switch (type) {
      case 'imaging': return '#3b82f6';
      case 'communication': return '#10b981';
      case 'navigation': return '#f59e0b';
      case 'weather': return '#ef4444';
      default: return '#8b5cf6';
    }
  };

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial color={getColor(type)} />
      </mesh>
      {/* Coverage area */}
      <mesh>
        <sphereGeometry args={[coverage * 0.3, 16, 16]} />
        <meshBasicMaterial
          color={getColor(type)}
          transparent
          opacity={0.1}
          wireframe
        />
      </mesh>
    </group>
  );
}

// Orbit path component
function OrbitPath({ points }: { points: THREE.Vector3[] }) {
  const curvePoints = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points);
    return curve.getPoints(100);
  }, [points]);

  return (
    <Line
      points={curvePoints}
      color="#3b82f6"
      opacity={0.3}
      transparent
      lineWidth={1}
    />
  );
}

// Main globe scene
function GlobeScene({ satellites }: { satellites: Satellite[] }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <Earth />
      
      {satellites.map((satellite) => (
        <group key={satellite.id}>
          <SatelliteDot
            position={satellite.position}
            type={satellite.type}
            coverage={satellite.coverage}
          />
          <OrbitPath points={satellite.orbit} />
        </group>
      ))}
    </>
  );
}

export default function GlobeVisualization({ satellites = [], className = "" }: GlobeVisualizationProps) {
  // Mock satellite data if none provided
  const defaultSatellites: Satellite[] = useMemo(() => [
    {
      id: '1',
      name: 'Landsat-9',
      position: [1.2, 0.5, 0.8] as [number, number, number],
      orbit: [
        new THREE.Vector3(1.2, 0.5, 0.8),
        new THREE.Vector3(1.1, 0.7, 0.6),
        new THREE.Vector3(0.9, 0.8, 0.4),
        new THREE.Vector3(0.6, 0.7, 0.2),
        new THREE.Vector3(0.4, 0.5, 0.1),
        new THREE.Vector3(0.5, 0.3, 0.3),
        new THREE.Vector3(0.8, 0.2, 0.5),
        new THREE.Vector3(1.0, 0.3, 0.7),
        new THREE.Vector3(1.2, 0.5, 0.8),
      ],
      coverage: 0.4,
      type: 'imaging'
    },
    {
      id: '2',
      name: 'Starlink-1234',
      position: [0.8, -0.3, 1.1] as [number, number, number],
      orbit: [
        new THREE.Vector3(0.8, -0.3, 1.1),
        new THREE.Vector3(0.6, -0.1, 1.0),
        new THREE.Vector3(0.3, 0.1, 0.8),
        new THREE.Vector3(0.1, 0.2, 0.5),
        new THREE.Vector3(0.2, 0.1, 0.2),
        new THREE.Vector3(0.5, -0.1, 0.1),
        new THREE.Vector3(0.8, -0.2, 0.3),
        new THREE.Vector3(0.9, -0.3, 0.6),
        new THREE.Vector3(0.8, -0.3, 1.1),
      ],
      coverage: 0.6,
      type: 'communication'
    },
    {
      id: '3',
      name: 'GPS-III',
      position: [-0.5, 1.0, 0.3] as [number, number, number],
      orbit: [
        new THREE.Vector3(-0.5, 1.0, 0.3),
        new THREE.Vector3(-0.3, 0.8, 0.5),
        new THREE.Vector3(-0.1, 0.5, 0.6),
        new THREE.Vector3(0.1, 0.2, 0.5),
        new THREE.Vector3(0.2, -0.1, 0.3),
        new THREE.Vector3(0.1, -0.3, 0.1),
        new THREE.Vector3(-0.1, -0.4, -0.1),
        new THREE.Vector3(-0.3, -0.2, 0.1),
        new THREE.Vector3(-0.5, 1.0, 0.3),
      ],
      coverage: 0.8,
      type: 'navigation'
    },
    {
      id: '4',
      name: 'GOES-18',
      position: [0.2, -0.8, 0.9] as [number, number, number],
      orbit: [
        new THREE.Vector3(0.2, -0.8, 0.9),
        new THREE.Vector3(0.4, -0.6, 0.7),
        new THREE.Vector3(0.5, -0.3, 0.4),
        new THREE.Vector3(0.4, 0.0, 0.1),
        new THREE.Vector3(0.2, 0.2, -0.1),
        new THREE.Vector3(-0.1, 0.3, -0.2),
        new THREE.Vector3(-0.3, 0.1, 0.0),
        new THREE.Vector3(-0.2, -0.2, 0.3),
        new THREE.Vector3(0.2, -0.8, 0.9),
      ],
      coverage: 0.5,
      type: 'weather'
    }
  ], []);

  const displaySatellites = satellites.length > 0 ? satellites : defaultSatellites;

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [3, 3, 3], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={8}
        />
        <GlobeScene satellites={displaySatellites} />
      </Canvas>
    </div>
  );
}
