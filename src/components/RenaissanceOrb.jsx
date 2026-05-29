import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';

function ParticleHalo({ count = 400 }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.0 + Math.random() * 0.4;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, [count]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.15;
    const arr = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      arr[idx] += Math.sin(t + i * 0.1) * 0.001;
      arr[idx + 1] += Math.cos(t + i * 0.15) * 0.001;
      arr[idx + 2] += Math.sin(t + i * 0.2) * 0.0008;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.018} color="#2D35C8" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

function Orb() {
  const meshRef = useRef();
  const wireRef = useRef();

  useFrame(({ pointer }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003;
      meshRef.current.rotation.x += 0.001;
      meshRef.current.rotation.x += (pointer.y * 0.4 - meshRef.current.rotation.x) * 0.02;
      meshRef.current.rotation.y += (pointer.x * 0.6 - meshRef.current.rotation.y) * 0.02;
    }
    if (wireRef.current) {
      wireRef.current.rotation.y += 0.002;
      wireRef.current.rotation.x -= 0.001;
    }
  });

  return (
    <group>
      {/* Inner sphere */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.2, 3]} />
        <meshPhysicalMaterial
          roughness={0.12}
          metalness={0.7}
          transmission={0.4}
          thickness={1.2}
          color="#c8cce8"
          envMapIntensity={1.2}
        />
      </mesh>

      {/* Wireframe cage */}
      <mesh ref={wireRef}>
        <icosahedronGeometry args={[1.5, 2]} />
        <meshBasicMaterial
          color="#2D35C8"
          wireframe
          transparent
          opacity={0.2}
        />
      </mesh>

      <ParticleHalo />
    </group>
  );
}

export default function RenaissanceOrb() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight color="#e8e8f0" intensity={0.8} />
      <directionalLight color="#2D35C8" intensity={0.9} position={[5, 8, 3]} />
      <pointLight color="#4a52d4" intensity={0.6} position={[-4, -2, -3]} />
      <pointLight color="#8890ff" intensity={0.3} position={[0, -5, 5]} />
      <Orb />
      <Environment preset="studio" />
    </Canvas>
  );
}
