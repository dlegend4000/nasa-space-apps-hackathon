"use client";

import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { SatelliteData } from '@/lib/satellite-data';


interface GlobeVisualizationProps {
  satellites?: SatelliteData[];
  selectedSatellite?: SatelliteData | null;
  centerGlobe?: boolean;
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

// Camera controller for focusing on satellites
function CameraController({ selectedSatellite, centerGlobe }: { selectedSatellite?: SatelliteData | null; centerGlobe?: boolean }) {
  const { camera } = useThree();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (selectedSatellite && selectedSatellite.position && controlsRef.current) {
      const { latitude, longitude, altitude } = selectedSatellite.position;
      
      // Convert lat/lon/alt to 3D position
      const phi = (90 - latitude) * (Math.PI / 180);
      const theta = (longitude + 180) * (Math.PI / 180);
      const radius = 1 + (altitude / 1000) * 0.02; // Scale altitude - smaller factor = closer to globe
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);
      
      const targetPosition = new THREE.Vector3(x, y, z);
      const cameraPosition = new THREE.Vector3(
        x * 1.5,
        y * 1.5,
        z * 1.5
      );
      
      // Animate camera to focus on satellite
      const startPosition = camera.position.clone();
      const startTarget = controlsRef.current.target.clone();
      
      const duration = 2000; // 2 seconds
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        
        camera.position.lerpVectors(startPosition, cameraPosition, easeProgress);
        controlsRef.current.target.lerpVectors(startTarget, targetPosition, easeProgress);
        controlsRef.current.update();
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      animate();
    }
  }, [selectedSatellite, camera]);

  // Handle centering and zooming into the globe
  useEffect(() => {
    if (centerGlobe && controlsRef.current) {
      // Zoom into the globe with a closer camera position
      const startPosition = camera.position.clone();
      const startTarget = controlsRef.current.target.clone();
      
      const zoomedCameraPosition = new THREE.Vector3(0, 0, 2.5); // Closer to the globe
      const defaultTarget = new THREE.Vector3(0, 0, 0);
      
      const duration = 1500; // 1.5 seconds
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        
        camera.position.lerpVectors(startPosition, zoomedCameraPosition, easeProgress);
        controlsRef.current.target.lerpVectors(startTarget, defaultTarget, easeProgress);
        controlsRef.current.update();
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      animate();
    }
  }, [centerGlobe, camera]);

  return <OrbitControls ref={controlsRef} enablePan={true} enableZoom={true} enableRotate={true} minDistance={2} maxDistance={8} />;
}

// Satellite component
function SatelliteDot({ satellite, isSelected }: { satellite: SatelliteData, isSelected: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  const getColor = (type: string) => {
    switch (type) {
      case 'Earth Imaging': return '#3b82f6';
      case 'Atmospheric Monitoring': return '#10b981';
      case 'Weather Monitoring': return '#f59e0b';
      case 'Environmental Monitoring': return '#ef4444';
      default: return '#8b5cf6';
    }
  };

  // Convert lat/lon/alt to 3D position
  const getPosition = () => {
    if (satellite.position) {
      const { latitude, longitude, altitude } = satellite.position;
      const phi = (90 - latitude) * (Math.PI / 180);
      const theta = (longitude + 180) * (Math.PI / 180);
      const radius = 1 + (altitude / 1000) * 0.02;
      
      return [
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      ] as [number, number, number];
    }
    
    // Fallback to mock position
    return [1.2, 0.5, 0.8] as [number, number, number];
  };

  const position = getPosition();
  const size = isSelected ? 0.04 : 0.02;

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 8, 8]} />
        <meshBasicMaterial 
          color={getColor(satellite.type)} 
        />
      </mesh>
      {/* Coverage area */}
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial
          color={getColor(satellite.type)}
          transparent
          opacity={isSelected ? 0.2 : 0.1}
          wireframe
        />
      </mesh>
    </group>
  );
}


// Main globe scene
function GlobeScene({ satellites, selectedSatellite }: { satellites: SatelliteData[], selectedSatellite?: SatelliteData | null }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <Earth />
      
      {satellites.map((satellite) => (
        <SatelliteDot
          key={satellite.id}
          satellite={satellite}
          isSelected={selectedSatellite?.id === satellite.id}
        />
      ))}
    </>
  );
}

export default function GlobeVisualization({ satellites = [], selectedSatellite, centerGlobe, className = "" }: GlobeVisualizationProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [3, 3, 3], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <CameraController selectedSatellite={selectedSatellite} centerGlobe={centerGlobe} />
        <GlobeScene satellites={satellites} selectedSatellite={selectedSatellite} />
      </Canvas>
    </div>
  );
}
