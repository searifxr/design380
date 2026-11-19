import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, type ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls, RoundedBox } from "@react-three/drei";
import { Maximize2, Minus, MousePointer2, Plus, RotateCcw } from "lucide-react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { VehicleType } from "@/lib/studio/catalog";
import {
  CABIN_SPECS,
  materialPreset,
  type ComponentStyle,
  type InteriorComponentId,
  type InteriorCustomization,
  type InteriorMaterialId,
  type ScreenAccessory,
} from "@/lib/studio/interior";

export const CAMERA_PRESETS = [
  { id: "driver", name: "Driver" },
  { id: "passenger", name: "Passenger" },
  { id: "rear", name: "Rear seat" },
  { id: "dashboard", name: "Dashboard" },
  { id: "cabin", name: "Full cabin" },
  { id: "door", name: "Door detail" },
] as const;
export type CameraPreset = (typeof CAMERA_PRESETS)[number]["id"];
type Vec3 = [number, number, number];
type Textures = Record<InteriorMaterialId, THREE.CanvasTexture>;

function makeTexture(material: InteriorMaterialId) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  const image = ctx.createImageData(128, 128);
  for (let y = 0; y < 128; y += 1) {
    for (let x = 0; x < 128; x += 1) {
      const i = (y * 128 + x) * 4;
      const noise = ((x * 17 + y * 31 + ((x * y) % 23)) % 19) - 9;
      let v = 218 + noise;
      if (material === "fabric" || material === "suede") v = 190 + ((x + y) % 4 === 0 ? 30 : 0) + noise;
      if (material === "leather") v = 205 + ((x * 3 + y * 5) % 11) + noise;
      if (material === "carbon") v = (Math.floor(x / 8) + Math.floor(y / 8)) % 2 ? 150 : 215;
      if (material === "aluminum") v = 205 + (y % 5 === 0 ? 28 : 0) + noise / 3;
      if (material === "wood") v = 175 + Math.sin(x * 0.16 + Math.sin(y * 0.08) * 2) * 42 + noise / 2;
      if (material === "gloss" || material === "matte") v = 225 + noise / 4;
      image.data[i] = material === "wood" ? v + 22 : v;
      image.data[i + 1] = material === "wood" ? v : v;
      image.data[i + 2] = material === "wood" ? v - 28 : v;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.anisotropy = 4;
  return texture;
}

function useTextureSet(): Textures {
  const textures = useMemo(() => Object.fromEntries(
    (["leather", "fabric", "suede", "matte", "gloss", "carbon", "aluminum", "wood"] as const).map((id) => [id, makeTexture(id)]),
  ) as Textures, []);
  useEffect(() => () => Object.values(textures).forEach((texture) => texture.dispose()), [textures]);
  return textures;
}

function Surface({ style, selected, textures }: { style: ComponentStyle; selected: boolean; textures: Textures }) {
  const preset = materialPreset(style.material);
  return (
    <meshStandardMaterial
      color={style.color}
      map={textures[style.material]}
      roughness={Math.min(1, Math.max(0.05, style.roughness))}
      metalness={preset.metalness}
      emissive={selected ? "#a77822" : "#000000"}
      emissiveIntensity={selected ? 0.16 : 0}
    />
  );
}

function PartBox({
  size, position, rotation, radius = 0.04, style, selected, textures,
}: {
  size: Vec3; position: Vec3; rotation?: Vec3; radius?: number;
  style: ComponentStyle; selected: boolean; textures: Textures;
}) {
  return (
    <RoundedBox args={size} position={position} rotation={rotation ?? [0, 0, 0]} radius={radius} smoothness={3} castShadow receiveShadow>
      <Surface style={style} selected={selected} textures={textures} />
    </RoundedBox>
  );
}

interface SelectionProps {
  onClick?: (event: ThreeEvent<MouseEvent>) => void;
  onPointerOver?: (event: ThreeEvent<PointerEvent>) => void;
  onPointerOut?: (event: ThreeEvent<PointerEvent>) => void;
}

function Seat({
  id, x, z, width, style, selected, textures, selection,
}: {
  id: InteriorComponentId; x: number; z: number; width: number; style: ComponentStyle;
  selected: boolean; textures: Textures; selection: SelectionProps;
}) {
  const accent = useMemo(() => new THREE.Color(style.stitchingColor), [style.stitchingColor]);
  return (
    <group position={[x, 0, z]} {...selection}>
      <PartBox size={[width, 0.2, 0.76]} position={[0, 0.48, 0]} radius={0.09} style={style} selected={selected} textures={textures} />
      <PartBox size={[width * 0.7, 0.08, 0.58]} position={[0, 0.59, -0.02]} radius={0.04} style={{ ...style, color: style.secondaryColor }} selected={selected} textures={textures} />
      <PartBox size={[width, 0.94, 0.2]} position={[0, 1.02, 0.3]} rotation={[-0.1, 0, 0]} radius={0.09} style={style} selected={selected} textures={textures} />
      <PartBox size={[width * 0.68, 0.66, 0.055]} position={[0, 1.03, 0.405]} rotation={[-0.1, 0, 0]} radius={0.025} style={{ ...style, color: style.secondaryColor }} selected={selected} textures={textures} />
      <PartBox size={[width * 0.62, 0.3, 0.18]} position={[0, 1.65, 0.35]} radius={0.07} style={style} selected={selected} textures={textures} />
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * width * 0.28, 1.04, 0.445]} rotation={[-0.1, 0, 0]}>
          <boxGeometry args={[0.012, 0.58, 0.012]} />
          <meshStandardMaterial color={accent} roughness={0.75} />
        </mesh>
      ))}
      <mesh position={[0, 1.33, 0.46]} rotation={[-0.1, 0, Math.PI / 2]}>
        <boxGeometry args={[0.012, width * 0.56, 0.012]} />
        <meshStandardMaterial color={accent} roughness={0.75} />
      </mesh>
    </group>
  );
}

function HeadrestScreen({ x, accessory }: { x: number; accessory: ScreenAccessory }) {
  if (!accessory.enabled) return null;
  const width = accessory.size * 0.047;
  const height = width * 0.62;
  return (
    <group position={[x, 1.29, 0.53]} onClick={(event) => event.stopPropagation()}>
      <RoundedBox args={[width + 0.055, height + 0.055, 0.055]} radius={0.035} smoothness={3} castShadow>
        <meshStandardMaterial color={accessory.frameColor} roughness={0.28} metalness={0.2} />
      </RoundedBox>
      <mesh position={[0, 0, 0.031]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color={accessory.on ? "#28465a" : "#08090a"}
          emissive={accessory.on ? "#447e9d" : "#000000"}
          emissiveIntensity={accessory.on ? 0.7 : 0}
          roughness={0.22}
        />
      </mesh>
      {accessory.on && (
        <mesh position={[0, 0, 0.034]}>
          <planeGeometry args={[width * 0.7, 0.018]} />
          <meshBasicMaterial color="#b9d9df" transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  );
}

function cameraView(preset: CameraPreset, vehicle: VehicleType): { position: Vec3; target: Vec3 } {
  const spec = CABIN_SPECS[vehicle];
  const driverX = -spec.width * 0.24;
  switch (preset) {
    case "driver": return { position: [driverX, 1.43, -0.03], target: [driverX * 0.4, 1.05, spec.dashZ] };
    case "passenger": return { position: [-driverX, 1.43, -0.03], target: [0, 1.0, spec.dashZ] };
    case "rear": return { position: [0, 1.5, spec.rearZ - 0.15], target: [0, 1.05, -0.65] };
    case "dashboard": return { position: [0, 1.6, 0.38], target: [0, 1.08, spec.dashZ] };
    case "door": return { position: [-0.25, 1.22, 0.15], target: [-spec.width / 2, 0.95, 0.05] };
    case "cabin": return { position: [0, 1.72, spec.rearZ + (spec.thirdRowZ ? 1.65 : 1.1)], target: [0, 0.95, -0.45] };
  }
}

function CameraRig({ vehicle, preset, resetKey, zoom }: {
  vehicle: VehicleType; preset: CameraPreset; resetKey: number; zoom: { direction: number; nonce: number };
}) {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  useEffect(() => {
    const view = cameraView(preset, vehicle);
    camera.position.set(...view.position);
    camera.lookAt(...view.target);
    if (controls.current) {
      controls.current.target.set(...view.target);
      controls.current.update();
    }
  }, [camera, preset, resetKey, vehicle]);
  useEffect(() => {
    if (!zoom.nonce || !controls.current) return;
    const target = controls.current.target.clone();
    const offset = camera.position.clone().sub(target);
    const length = THREE.MathUtils.clamp(offset.length() * (zoom.direction > 0 ? 0.78 : 1.28), 0.22, 8);
    camera.position.copy(target.add(offset.normalize().multiplyScalar(length)));
    controls.current.update();
  }, [camera, zoom]);
  return <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={0.08} minDistance={0.18} maxDistance={7} maxPolarAngle={Math.PI * 0.94} enablePan />;
}

function ReadySignal({ container }: { container: React.RefObject<HTMLDivElement | null> }) {
  const ready = useRef(false);
  useFrame(() => {
    if (!ready.current && container.current) {
      container.current.dataset["sceneReady"] = "true";
      ready.current = true;
    }
  });
  return null;
}

function CabinWorld({ vehicle, customization, selected, onSelect }: {
  vehicle: VehicleType; customization: InteriorCustomization; selected: InteriorComponentId | null;
  onSelect: (id: InteriorComponentId) => void;
}) {
  const spec = CABIN_SPECS[vehicle];
  const textures = useTextureSet();
  const styles = customization.components;
  const light = customization.lighting;
  const accessories = customization.accessories;
  const selection = (id: InteriorComponentId): SelectionProps => ({
    onClick: (event) => { event.stopPropagation(); onSelect(id); },
    onPointerOver: (event) => { event.stopPropagation(); document.body.style.cursor = "pointer"; },
    onPointerOut: () => { document.body.style.cursor = "auto"; },
  });
  const box = (id: InteriorComponentId, size: Vec3, position: Vec3, radius = 0.04, color?: string, rotation?: Vec3) => (
    <group {...selection(id)}>
      <PartBox size={size} position={position} rotation={rotation} radius={radius} style={{ ...styles[id], color: color ?? styles[id].color }} selected={selected === id} textures={textures} />
    </group>
  );
  const frontX = spec.width * 0.24;
  const rearLength = spec.thirdRowZ ? 3.15 : 1.85;
  const rearCenter = spec.thirdRowZ ? 1.65 : spec.rearZ;
  const emissiveStrip = (position: Vec3, size: Vec3, color: string, intensity = 2.2) => (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} toneMapped={false} />
    </mesh>
  );

  return (
    <>
      <color attach="background" args={["#111315"]} />
      <fog attach="fog" args={["#111315", 7, 14]} />
      <hemisphereLight args={["#e8e1d2", "#272a30", 0.75]} />
      <directionalLight position={[1.5, 5, 3]} intensity={2.1} color="#fff0d7" castShadow shadow-mapSize={[1024, 1024]} />
      <Environment resolution={64}>
        <Lightformer intensity={1.7} position={[0, 4, 0]} scale={[6, 6, 1]} />
        <Lightformer intensity={0.8} color="#9eb8ca" position={[-4, 1, 1]} rotation-y={Math.PI / 2} scale={[5, 2, 1]} />
      </Environment>

      {box("frontFloor", [spec.width - 0.12, 0.09, 1.95], [0, 0.02, -0.6], 0.03)}
      {box("rearFloor", [spec.width - 0.12, 0.09, rearLength], [0, 0.02, rearCenter], 0.03)}
      {box("roof", [spec.width + 0.08, 0.09, spec.doorLength + 0.7], [0, spec.roofHeight, 0.45], 0.04)}

      {[-1, 1].map((side) => (
        <group key={side}>
          {box("pillars", [0.12, spec.roofHeight - 0.2, 0.16], [side * spec.width / 2, spec.roofHeight / 2, spec.dashZ + 0.05], 0.035)}
          {box("pillars", [0.12, spec.roofHeight - 0.2, 0.16], [side * spec.width / 2, spec.roofHeight / 2, spec.thirdRowZ ? 2.9 : spec.rearZ + 0.7], 0.035)}
          {box(side < 0 ? "doorLeft" : "doorRight", [0.13, 1.06, spec.doorLength], [side * (spec.width / 2 - 0.02), 0.83, 0.25], 0.06)}
          {box(side < 0 ? "doorLeft" : "doorRight", [0.055, 0.38, spec.doorLength * 0.62], [side * (spec.width / 2 - 0.105), 1.1, 0.08], 0.04, styles[side < 0 ? "doorLeft" : "doorRight"].secondaryColor)}
          {box(side < 0 ? "armrestLeft" : "armrestRight", [0.25, 0.2, 1.02], [side * (spec.width / 2 - 0.17), 0.77, -0.02], 0.08)}
          <mesh position={[side * (spec.width / 2 - 0.305), 0.82, -0.02]}>
            <boxGeometry args={[0.012, 0.012, 0.8]} />
            <meshStandardMaterial color={styles[side < 0 ? "armrestLeft" : "armrestRight"].stitchingColor} roughness={0.8} />
          </mesh>
          <mesh position={[side * (spec.width / 2 - 0.16), 1.2, -0.62]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.095, 0.018, 8, 24, Math.PI]} />
            <meshStandardMaterial color="#a7a8a5" metalness={0.85} roughness={0.3} />
          </mesh>
          {light.enabled && light.doorStrips && (
            <>
              {emissiveStrip([side * (spec.width / 2 - 0.14), 1.02, -0.58], [0.025, 0.025, 1.15], light.frontColor)}
              {emissiveStrip([side * (spec.width / 2 - 0.14), 1.02, 0.9], [0.025, 0.025, 1.0], light.rearColor)}
            </>
          )}
          {accessories.doorSillLighting && emissiveStrip([side * (spec.width / 2 - 0.12), 0.12, 0.15], [0.07, 0.025, 2.15], light.frontColor, 1.8)}
        </group>
      ))}

      <Seat id="driverSeat" x={-frontX} z={0} width={spec.seatWidth} style={styles.driverSeat} selected={selected === "driverSeat"} textures={textures} selection={selection("driverSeat")} />
      <Seat id="passengerSeat" x={frontX} z={0} width={spec.seatWidth} style={styles.passengerSeat} selected={selected === "passengerSeat"} textures={textures} selection={selection("passengerSeat")} />
      <Seat id="rearLeftSeat" x={-frontX} z={spec.rearZ} width={spec.seatWidth} style={styles.rearLeftSeat} selected={selected === "rearLeftSeat"} textures={textures} selection={selection("rearLeftSeat")} />
      <Seat id="rearRightSeat" x={frontX} z={spec.rearZ} width={spec.seatWidth} style={styles.rearRightSeat} selected={selected === "rearRightSeat"} textures={textures} selection={selection("rearRightSeat")} />
      {spec.thirdRowZ && (
        <>
          <Seat id="thirdRowSeat" x={-frontX} z={spec.thirdRowZ} width={spec.seatWidth} style={styles.thirdRowSeat} selected={selected === "thirdRowSeat"} textures={textures} selection={selection("thirdRowSeat")} />
          <Seat id="thirdRowSeat" x={frontX} z={spec.thirdRowZ} width={spec.seatWidth} style={styles.thirdRowSeat} selected={selected === "thirdRowSeat"} textures={textures} selection={selection("thirdRowSeat")} />
        </>
      )}

      {box("dashboardUpper", [spec.width - 0.22, 0.36, 0.54], [0, 1.28, spec.dashZ], 0.1)}
      {box("dashboardLower", [spec.width - 0.28, 0.52, 0.38], [0, 0.89, spec.dashZ + 0.11], 0.07)}
      {box("dashboardTrim", [spec.width - 0.48, 0.065, 0.07], [0, 1.09, spec.dashZ + 0.34], 0.018)}
      {box("centerConsole", [0.44, 0.5, 1.18], [0, 0.54, -0.35], 0.08)}
      {box("centerConsole", [0.32, 0.05, 0.48], [0, 0.815, -0.65], 0.03, styles.centerConsole.secondaryColor)}
      <group {...selection("steeringWheel")}>
        <mesh position={[-frontX, 1.25, spec.dashZ + 0.52]} rotation={[-0.28, 0, 0]} castShadow>
          <torusGeometry args={[0.255, 0.047, 12, 36]} />
          <Surface style={styles.steeringWheel} selected={selected === "steeringWheel"} textures={textures} />
        </mesh>
        <mesh position={[-frontX, 1.25, spec.dashZ + 0.52]} rotation={[-0.28, 0, 0]}>
          <boxGeometry args={[0.32, 0.055, 0.055]} />
          <meshStandardMaterial color={styles.steeringWheel.secondaryColor} roughness={0.45} />
        </mesh>
        <mesh position={[-frontX, 1.25, spec.dashZ + 0.52]} rotation={[-0.28, 0, 0]}>
          <cylinderGeometry args={[0.085, 0.085, 0.06, 24]} />
          <meshStandardMaterial color={styles.steeringWheel.secondaryColor} roughness={0.45} />
        </mesh>
      </group>

      <HeadrestScreen x={-frontX} accessory={accessories.screenLeft} />
      <HeadrestScreen x={frontX} accessory={accessories.screenRight} />
      {accessories.chargingPad && (
        <group position={[0, 0.855, -0.64]}>
          <RoundedBox args={[0.28, 0.025, 0.34]} radius={0.035} smoothness={3}>
            <meshStandardMaterial color="#17181a" roughness={0.55} />
          </RoundedBox>
          <mesh position={[0, 0.016, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.06, 0.067, 24]} />
            <meshBasicMaterial color="#8d9094" />
          </mesh>
        </group>
      )}
      {accessories.floorMats && [-frontX, frontX].map((x) => (
        <group key={x}>
          <RoundedBox args={[0.72, 0.025, 0.68]} position={[x, 0.085, -0.72]} radius={0.055} smoothness={2}>
            <meshStandardMaterial color={styles.frontFloor.secondaryColor} map={textures.fabric} roughness={1} />
          </RoundedBox>
          <RoundedBox args={[0.72, 0.025, 0.68]} position={[x, 0.085, spec.rearZ - 0.3]} radius={0.055} smoothness={2}>
            <meshStandardMaterial color={styles.rearFloor.secondaryColor} map={textures.fabric} roughness={1} />
          </RoundedBox>
        </group>
      ))}
      {[0.02, 0.28].map((z) => (
        <group key={z} position={[0, 0.82, z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.085, 0.015, 8, 24]} />
            <meshStandardMaterial color={accessories.cupholderLighting ? light.frontColor : "#494a4d"} emissive={accessories.cupholderLighting ? light.frontColor : "#000000"} emissiveIntensity={2} />
          </mesh>
        </group>
      ))}
      {accessories.usbPorts && [-0.08, 0.08].map((x) => (
        <mesh key={x} position={[x, 0.61, 0.248]}>
          <boxGeometry args={[0.09, 0.035, 0.018]} />
          <meshStandardMaterial color="#0b0c0d" emissive="#5f91a4" emissiveIntensity={0.3} />
        </mesh>
      ))}

      {light.enabled && light.dashboardStrip && emissiveStrip([0, 1.13, spec.dashZ + 0.385], [spec.width - 0.55, 0.022, 0.022], light.frontColor)}
      {light.enabled && light.footwell && (
        <>
          <pointLight position={[-frontX, 0.28, -0.75]} color={light.frontColor} intensity={light.frontBrightness * 5} distance={2.3} decay={2} />
          <pointLight position={[frontX, 0.28, -0.75]} color={light.frontColor} intensity={light.frontBrightness * 5} distance={2.3} decay={2} />
          <pointLight position={[0, 0.35, spec.rearZ]} color={light.rearColor} intensity={light.rearBrightness * 4} distance={2.5} decay={2} />
        </>
      )}
      {light.enabled && (light.doorStrips || light.dashboardStrip) && (
        <>
          <pointLight position={[0, 1.1, -0.7]} color={light.frontColor} intensity={light.frontBrightness * 3.5} distance={3} decay={2} />
          <pointLight position={[0, 1.0, spec.rearZ]} color={light.rearColor} intensity={light.rearBrightness * 3} distance={3} decay={2} />
        </>
      )}
      {light.enabled && light.overhead && (
        <pointLight position={[0, spec.roofHeight - 0.18, 0.35]} color="#f2e5cc" intensity={1.8} distance={4} decay={2} castShadow />
      )}
    </>
  );
}

export function CabinViewer({ vehicle, customization, selected, onSelect, preset, onPresetChange }: {
  vehicle: VehicleType;
  customization: InteriorCustomization;
  selected: InteriorComponentId | null;
  onSelect: (id: InteriorComponentId) => void;
  preset: CameraPreset;
  onPresetChange: (preset: CameraPreset) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [resetKey, setResetKey] = useState(0);
  const [zoomState, setZoomState] = useState({ direction: 1, nonce: 0 });

  const zoom = (direction: number) => {
    setZoomState((current) => ({ direction, nonce: current.nonce + 1 }));
  };
  const reset = () => setResetKey((current) => current + 1);
  const fullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await container.current?.requestFullscreen();
    } catch { /* Fullscreen can be denied by an embedding browser. */ }
  };

  return (
    <div ref={container} data-scene-ready="false" className="relative h-full min-h-[480px] w-full overflow-hidden rounded-xl border border-border bg-canvas">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ fov: 58, near: 0.05, far: 30, position: cameraView(preset, vehicle).position }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
        onPointerMissed={() => { document.body.style.cursor = "auto"; }}
      >
        <CameraRig vehicle={vehicle} preset={preset} resetKey={resetKey} zoom={zoomState} />
        <CabinWorld vehicle={vehicle} customization={customization} selected={selected} onSelect={onSelect} />
        <ReadySignal container={container} />
      </Canvas>
      <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full border border-border bg-card/85 px-3 py-1.5 text-[11px] text-muted-foreground backdrop-blur">
        <MousePointer2 className="h-3.5 w-3.5 text-primary" /> Drag to look · Scroll to zoom · Click a part
      </div>
      <div className="absolute right-4 top-4 flex overflow-hidden rounded-lg border border-border bg-card/90 shadow-lg backdrop-blur">
        <button type="button" aria-label="Zoom in" title="Zoom in" onClick={() => zoom(1)} className="grid h-9 w-9 place-items-center hover:bg-secondary"><Plus className="h-4 w-4" /></button>
        <button type="button" aria-label="Zoom out" title="Zoom out" onClick={() => zoom(-1)} className="grid h-9 w-9 place-items-center hover:bg-secondary"><Minus className="h-4 w-4" /></button>
        <button type="button" aria-label="Reset camera" title="Reset camera" onClick={reset} className="grid h-9 w-9 place-items-center hover:bg-secondary"><RotateCcw className="h-4 w-4" /></button>
        <button type="button" aria-label="Toggle fullscreen" title="Fullscreen" onClick={fullscreen} className="grid h-9 w-9 place-items-center hover:bg-secondary"><Maximize2 className="h-4 w-4" /></button>
      </div>
      <div className="absolute inset-x-3 bottom-3 flex gap-1 overflow-x-auto rounded-xl border border-border bg-card/90 p-1.5 backdrop-blur">
        {CAMERA_PRESETS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onPresetChange(item.id)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-medium transition ${preset === item.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
          >
            {item.name}
          </button>
        ))}
      </div>
    </div>
  );
}
