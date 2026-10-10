"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { FLOORS, type Unit, type LightColor, LIGHT_COLORS } from "@/data/units";

const FLOOR_COLORS = ["#7DE7FF", "#00D68F", "#F5A623", "#A855F7", "#FF6B8A", "#4D7CFE"];

function CrystalFloorBand({ floor, y, color }: { floor: number; y: number; color: string }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ringRef.current) {
      ringRef.current.rotation.z = t * (floor % 2 === 0 ? -0.12 : 0.12);
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.18 + Math.sin(t * 1.6 + floor) * 0.06;
    }
    if (beamRef.current) {
      const mat = beamRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.035 + Math.sin(t * 1.2 + floor) * 0.015;
    }
  });

  return (
    <group position={[0, y, 0]}>
      <mesh ref={beamRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.03, 1.42, 6]} />
        <meshBasicMaterial color={color} transparent opacity={0.04} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.23, 1.27, 6]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.36, 1.365, 6]} />
        <meshBasicMaterial color={color} transparent opacity={0.42} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

interface HexTowerProps {
  lightColor: LightColor;
  onUnitClick: (unit: Unit, position: THREE.Vector3) => void;
}

// ===== 漂浮粒子系統 =====
function FloatingParticles({ count, color, radius }: { count: number; color: string; radius: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    let seed = count * radius * 1000;
    const seededRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    for (let i = 0; i < count; i++) {
      const theta = seededRandom() * Math.PI * 2;
      const phi = seededRandom() * Math.PI;
      const r = radius * (0.3 + seededRandom() * 0.7);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return pos;
  }, [count, radius]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color={color}
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
}

// ===== 金庫核心 (C面金流, F面機密) — 參考圖2: 藍色金屬保險箱 =====
function VaultCore({ color }: { color: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const doorRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ringRef.current) ringRef.current.rotation.z = t * 0.6;
    if (ring2Ref.current) ring2Ref.current.rotation.z = -t * 0.4;
    if (groupRef.current) groupRef.current.rotation.y = t * 0.12;
    if (doorRef.current) {
      const mat = doorRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.1 + Math.sin(t * 2) * 0.05;
    }
  });

  return (
    <group ref={groupRef} scale={0.32}>
      {/* 中央金屬方塊 — 保險箱主體 */}
      <mesh ref={doorRef}>
        <boxGeometry args={[0.7, 0.7, 0.7]} />
        <meshStandardMaterial
          color="#111122"
          metalness={0.95}
          roughness={0.12}
          emissive={color}
          emissiveIntensity={0.08}
        />
      </mesh>
      {/* 外層旋轉環 */}
      <mesh ref={ringRef} position={[0, 0, 0]}>
        <torusGeometry args={[0.5, 0.025, 16, 32]} />
        <meshStandardMaterial
          color={color}
          metalness={1}
          roughness={0.08}
          emissive={color}
          emissiveIntensity={0.9}
        />
      </mesh>
      {/* 內層反向旋轉環 */}
      <mesh ref={ring2Ref} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.42, 0.02, 16, 32]} />
        <meshStandardMaterial
          color={color}
          metalness={1}
          roughness={0.1}
          emissive={color}
          emissiveIntensity={0.6}
        />
      </mesh>
      {/* 四角螺絲 */}
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([x, y], i) => (
        <mesh key={i} position={[x * 0.3, y * 0.3, 0.36]}>
          <cylinderGeometry args={[0.035, 0.035, 0.04, 8]} />
          <meshStandardMaterial color="#666" metalness={1} roughness={0.15} />
        </mesh>
      ))}
      {/* 側面管道 */}
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((rot, i) => (
        <mesh key={`pipe-${i}`} position={[Math.cos(rot) * 0.36, 0, Math.sin(rot) * 0.36]} rotation={[0, -rot, 0]}>
          <boxGeometry args={[0.06, 0.5, 0.03]} />
          <meshStandardMaterial
            color="#0a0a1a"
            metalness={0.8}
            roughness={0.2}
            emissive={color}
            emissiveIntensity={0.15}
          />
        </mesh>
      ))}
      {/* 保險箱門把手 */}
      <mesh position={[0.2, 0, 0.36]}>
        <cylinderGeometry args={[0.06, 0.06, 0.02, 16]} />
        <meshStandardMaterial color="#444" metalness={1} roughness={0.1} />
      </mesh>
      <FloatingParticles count={18} color={color} radius={0.55} />
    </group>
  );
}

// ===== 能量核心 (A面科技, D面AI) — 參考圖1: 藍色能量柱 =====
function EnergyCore({ color }: { color: string }) {
  const coreRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Group>(null);
  const platesRef = useRef<THREE.Group>(null);
  const beamRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (coreRef.current) {
      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.8 + Math.sin(t * 3) * 0.4;
    }
    if (ringsRef.current) ringsRef.current.rotation.y = t * 0.9;
    if (platesRef.current) platesRef.current.rotation.y = -t * 0.3;
    if (beamRef.current) {
      const mat = beamRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.15 + Math.sin(t * 4) * 0.08;
    }
  });

  return (
    <group scale={0.32}>
      {/* 中央能量柱 */}
      <mesh ref={coreRef}>
        <cylinderGeometry args={[0.12, 0.12, 1.3, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.2}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* 垂直能量光束 */}
      <mesh ref={beamRef}>
        <cylinderGeometry args={[0.02, 0.02, 1.8, 8]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.15}
        />
      </mesh>
      {/* 外層能量光柱 */}
      <mesh>
        <cylinderGeometry args={[0.18, 0.18, 1.1, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>
      {/* 環繞管道環 */}
      <group ref={ringsRef}>
        {[0.35, 0, -0.35].map((y, i) => (
          <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.32, 0.018, 8, 24]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.7}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        ))}
      </group>
      {/* 電路板 */}
      <group ref={platesRef}>
        {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((rot, i) => (
          <mesh key={i} position={[Math.cos(rot) * 0.42, 0, Math.sin(rot) * 0.42]} rotation={[0, -rot, 0]}>
            <boxGeometry args={[0.12, 0.7, 0.015]} />
            <meshStandardMaterial
              color="#0a1a2a"
              metalness={0.7}
              roughness={0.25}
              emissive={color}
              emissiveIntensity={0.2}
            />
          </mesh>
        ))}
      </group>
      <FloatingParticles count={14} color={color} radius={0.5} />
    </group>
  );
}

// ===== 量子核心 (B面品牌, E面GEO) — 參考圖3: 紫色量子軌道 =====
function QuantumCore({ color }: { color: string }) {
  const ringsRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const spheresRef = useRef<THREE.Group>(null);
  const starburstRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ringsRef.current) {
      ringsRef.current.rotation.x = t * 0.45;
      ringsRef.current.rotation.z = t * 0.3;
    }
    if (coreRef.current) {
      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 1.2 + Math.sin(t * 2.5) * 0.6;
    }
    if (spheresRef.current) spheresRef.current.rotation.y = t * 0.55;
    if (starburstRef.current) {
      const mat = starburstRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.1 + Math.sin(t * 3) * 0.06;
      starburstRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.1);
    }
  });

  return (
    <group scale={0.32}>
      {/* 中央發光球 */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.5}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* 中心星爆光暈 */}
      <mesh ref={starburstRef}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>
      {/* 外層光暈球 */}
      <mesh>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          transparent
          opacity={0.12}
          side={THREE.BackSide}
        />
      </mesh>
      {/* 三環軌道 — 對齊參考圖3的原子軌道 */}
      <group ref={ringsRef}>
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[0.42, 0.018, 16, 48]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.8}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
        <mesh rotation={[0, Math.PI / 3, Math.PI / 4]}>
          <torusGeometry args={[0.48, 0.014, 16, 48]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.6}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
        <mesh rotation={[Math.PI / 6, Math.PI / 2, 0]}>
          <torusGeometry args={[0.38, 0.012, 16, 48]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.5}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      </group>
      {/* 懸浮發光球體 */}
      <group ref={spheresRef}>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (i / 6) * Math.PI * 2;
          const r = 0.38;
          return (
            <mesh key={i} position={[Math.cos(angle) * r, Math.sin(angle * 2) * 0.15, Math.sin(angle) * r]}>
              <sphereGeometry args={[0.045, 16, 16]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={1.2}
                transparent
                opacity={0.85}
              />
            </mesh>
          );
        })}
      </group>
      <FloatingParticles count={12} color={color} radius={0.5} />
    </group>
  );
}

// ===== 空置戶核心：微弱脈動 =====
function EmptyCore({ color }: { color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.15 + Math.sin(t * 1.5) * 0.1;
      ref.current.rotation.y = t * 0.2;
      ref.current.rotation.x = t * 0.1;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y = -t * 0.3;
    }
  });

  return (
    <group scale={0.28}>
      <mesh ref={ref}>
        <octahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.2}
          transparent
          opacity={0.3}
          wireframe
        />
      </mesh>
      <mesh ref={innerRef}>
        <octahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.15}
        />
      </mesh>
    </group>
  );
}

// ===== 選擇核心類型 =====
function getCoreType(unit: Unit): "vault" | "energy" | "quantum" | "empty" {
  if (unit.status === "available") return "empty";
  if (unit.face === "C" || unit.face === "F") return "vault";
  if (unit.face === "A" || unit.face === "D") return "energy";
  return "quantum";
}

function InnerCore({ unit, color }: { unit: Unit; color: string }) {
  const coreType = getCoreType(unit);
  switch (coreType) {
    case "vault":
      return <VaultCore color={color} />;
    case "energy":
      return <EnergyCore color={color} />;
    case "quantum":
      return <QuantumCore color={color} />;
    default:
      return <EmptyCore color={color} />;
  }
}

// ===== 單一晶體方塊戶別單元 — 對齊參考圖: 玻璃方塊展示櫃 + 機械核心 =====
function CrystalUnit({
  unit,
  position,
  lightColor,
  floorColor,
  onClick,
}: {
  unit: Unit;
  position: [number, number, number];
  lightColor: LightColor;
  floorColor: string;
  onClick: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const edgeRef = useRef<THREE.LineSegments>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const baseColor = LIGHT_COLORS[lightColor].hex;
  const unitColor = unit.color || floorColor || baseColor;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current && hovered) {
      groupRef.current.scale.lerp(new THREE.Vector3(1.08, 1.08, 1.08), 0.08);
    } else if (groupRef.current) {
      groupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.08);
    }
    // 邊框脈動發光
    if (edgeRef.current) {
      const mat = edgeRef.current.material as THREE.LineBasicMaterial;
      const baseOpacity = unit.status === "available" ? 0.3 : unit.status === "isolated" ? 0.7 : 0.5;
      mat.opacity = baseOpacity + Math.sin(t * 2) * 0.15;
    }
    // 外層光暈脈動
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      const base = unit.status === "occupied" ? 0.06 : unit.status === "isolated" ? 0.08 : 0.03;
      mat.opacity = base + Math.sin(t * 1.5) * 0.02;
    }
  });

  const getStatusEmissive = () => {
    if (unit.status === "isolated") return "#ff2222";
    if (unit.status === "occupied") return unitColor;
    return "#4488ff";
  };

  const emissiveIntensity = unit.status === "available" ? 0.02 : unit.status === "isolated" ? 0.25 : 0.12;

  // 晶體方塊尺寸
  const cubeSize = 0.72;
  const gap = 0.02;

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "crosshair";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {/* === 外殼：高透光玻璃方塊 — 對齊參考圖的透明展示櫃 === */}
      <mesh>
        <boxGeometry args={[cubeSize - gap, cubeSize - gap, cubeSize - gap]} />
        <meshPhysicalMaterial
          color={unit.status === "available" ? "#aaddff" : "#eeeeff"}
          transparent
          transmission={unit.status === "available" ? 0.95 : 0.88}
          thickness={0.3}
          roughness={0.01}
          metalness={0.0}
          clearcoat={1}
          clearcoatRoughness={0.01}
          reflectivity={1}
          ior={1.52}
          emissive={getStatusEmissive()}
          emissiveIntensity={emissiveIntensity}
          side={THREE.DoubleSide}
          envMapIntensity={2.5}
        />
      </mesh>

      {/* === 方塊邊框發光線條 — 對齊參考圖的邊緣光暈 === */}
      <lineSegments ref={edgeRef}>
        <edgesGeometry args={[new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize)]} />
        <lineBasicMaterial
          color={unit.status === "available" ? floorColor : unitColor}
          transparent
          opacity={unit.status === "available" ? 0.3 : 0.55}
        />
      </lineSegments>

      {/* === 外層光暈框 — 參考圖的 edge glow === */}
      <mesh ref={glowRef}>
        <boxGeometry args={[cubeSize + 0.02, cubeSize + 0.02, cubeSize + 0.02]} />
        <meshBasicMaterial
          color={unit.status === "available" ? floorColor : unitColor}
          transparent
          opacity={0.04}
          side={THREE.BackSide}
        />
      </mesh>

      {/* === 內部核心 — 對齊參考圖的機械核心 === */}
      <InnerCore unit={unit} color={unitColor} />

      {/* === 內部點光源 — 更強的發光 === */}
      <pointLight
        position={[0, 0, 0]}
        color={unitColor}
        intensity={unit.status === "available" ? 0.3 : unit.status === "isolated" ? 2.2 : 1.2}
        distance={2.8}
        decay={2}
      />

      {/* === 底部 LED 底座光 — 對齊參考圖的底部打光 === */}
      <mesh position={[0, -cubeSize / 2 - 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[cubeSize * 0.95, cubeSize * 0.95]} />
        <meshBasicMaterial
          color={unitColor}
          transparent
          opacity={unit.status === "available" ? 0.08 : 0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* === 頂部微光 — 模擬聚光燈反射 === */}
      <mesh position={[0, cubeSize / 2 + 0.005, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[cubeSize * 0.6, cubeSize * 0.6]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.04}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// ===== 主六角大樓 =====
export default function HexTower({ lightColor, onUnitClick }: HexTowerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const coreGlowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0006;
    }
    if (coreRef.current) {
      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.5 + Math.sin(t * 2) * 0.2;
    }
    if (coreGlowRef.current) {
      const mat = coreGlowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.08 + Math.sin(t * 1.5) * 0.03;
    }
  });

  const FLOOR_HEIGHT = 1.05;
  const HEX_RADIUS = 0.95;

  const unitPositions = useMemo(() => {
    const positions: { unit: Unit; pos: [number, number, number] }[] = [];
    FLOORS.forEach((floor) => {
      floor.units.forEach((unit, i) => {
        const angle = (Math.PI / 3) * i;
        const x = Math.cos(angle) * HEX_RADIUS;
        const z = Math.sin(angle) * HEX_RADIUS;
        const y = (floor.floor - 1) * FLOOR_HEIGHT - 2.5;
        positions.push({ unit, pos: [x, y, z] });
      });
    });
    return positions;
  }, []);

  return (
    <group ref={groupRef}>
      {/* === 中央核心柱 — 對齊參考圖的青藍能量柱 === */}
      <mesh ref={coreRef} position={[0, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 7.5, 6]} />
        <meshStandardMaterial
          color={LIGHT_COLORS[lightColor].hex}
          transparent
          opacity={0.3}
          emissive={LIGHT_COLORS[lightColor].hex}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* === 中央柱外層光暈 === */}
      <mesh ref={coreGlowRef} position={[0, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 7.5, 16]} />
        <meshBasicMaterial
          color={LIGHT_COLORS[lightColor].hex}
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>

      {/* === 中央柱最外層微弱光暈 === */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 7.2, 16]} />
        <meshBasicMaterial
          color={LIGHT_COLORS[lightColor].hex}
          transparent
          opacity={0.02}
          side={THREE.BackSide}
        />
      </mesh>

      {/* === 逐層晶體能量環：讓六個營運中心在空間中被辨識 === */}
      {FLOORS.map((floor) => (
        <CrystalFloorBand
          key={`floor-band-${floor.floor}`}
          floor={floor.floor}
          y={(floor.floor - 1) * FLOOR_HEIGHT - 2.5}
          color={FLOOR_COLORS[floor.floor - 1]}
        />
      ))}

      {/* === 晶體方塊單元 === */}
      {unitPositions.map(({ unit, pos }) => (
        <CrystalUnit
          key={unit.id}
          unit={unit}
          position={pos}
          lightColor={lightColor}
          floorColor={FLOOR_COLORS[unit.floor - 1]}
          onClick={() => {
            const worldPos = new THREE.Vector3(...pos);
            if (groupRef.current) {
              worldPos.applyMatrix4(groupRef.current.matrixWorld);
            }
            onUnitClick(unit, worldPos);
          }}
        />
      ))}

      {/* === 頂樓天線 === */}
      <mesh position={[0, 4.2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 2.0, 8]} />
        <meshStandardMaterial
          color={LIGHT_COLORS[lightColor].hex}
          emissive={LIGHT_COLORS[lightColor].hex}
          emissiveIntensity={2.0}
        />
      </mesh>

      {/* 天線頂端發光球 */}
      <mesh position={[0, 5.2, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial
          color={LIGHT_COLORS[lightColor].hex}
          transparent
          opacity={0.9}
        />
      </mesh>

      <pointLight
        position={[0, 5.2, 0]}
        color={LIGHT_COLORS[lightColor].hex}
        intensity={3.0}
        distance={8}
        decay={2}
      />

      {/* === 黑曜石反射地面 — 對齊參考圖的黑色大理石反射 === */}
      <mesh position={[0, -3.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[20, 64]} />
        <meshPhysicalMaterial
          color="#060608"
          metalness={0.98}
          roughness={0.02}
          envMapIntensity={2.0}
          clearcoat={1}
          clearcoatRoughness={0.05}
        />
      </mesh>

      {/* === 地面中心發光環 === */}
      <mesh position={[0, -3.79, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 1.8, 6]} />
        <meshBasicMaterial
          color={LIGHT_COLORS[lightColor].hex}
          transparent
          opacity={0.06}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* === 漂浮粒子 === */}
      <FloatingParticles count={60} color={LIGHT_COLORS[lightColor].hex} radius={3.5} />
    </group>
  );
}
