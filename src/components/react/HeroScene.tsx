import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { RectAreaLightUniformsLib } from "three-stdlib";

// Required once for <rectAreaLight> to actually contribute light instead of
// silently rendering as a no-op.
RectAreaLightUniformsLib.init();

const requestIdle: (cb: () => void) => number =
  typeof window !== "undefined" && "requestIdleCallback" in window
    ? (cb) => window.requestIdleCallback(cb, { timeout: 4000 })
    : (cb) => window.setTimeout(cb, 1200);

const cancelIdle: (id: number) => void =
  typeof window !== "undefined" && "cancelIdleCallback" in window
    ? (id) => window.cancelIdleCallback(id)
    : (id) => window.clearTimeout(id);

interface InteractionState {
  dragging: boolean;
  returning: boolean;
  manualYaw: number;
  manualPitch: number;
  currentYaw: number;
  currentPitch: number;
  lastX: number;
  lastY: number;
  downX: number;
  downY: number;
  moved: boolean;
}

interface GarmentProps {
  src: string;
  interaction: React.MutableRefObject<InteractionState>;
  reducedMotion: boolean;
  entranceDelay: number;
  cinematicEntrance: boolean;
}

function Garment({
  src,
  interaction,
  reducedMotion,
  entranceDelay,
  cinematicEntrance,
}: GarmentProps) {
  const { scene } = useGLTF(src);
  const group = useRef<THREE.Group>(null);
  const revealElapsed = useRef(0);
  const revealComplete = useRef(reducedMotion || !cinematicEntrance);
  const viewport = useThree((state) => state.viewport);
  const { model, shadow, center, dimensions, materials, shadowMaterials, mistTexture } = useMemo(() => {
    const clone = scene.clone(true);
    const clonedMaterials: THREE.Material[] = [];
    clone.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const sourceMaterials = Array.isArray(object.material)
          ? object.material
          : [object.material];
        const meshMaterials = sourceMaterials.map((material) => {
          const copy = material.clone();
          copy.transparent = true;
          copy.opacity = 0;
          copy.depthWrite = false;
          clonedMaterials.push(copy);
          return copy;
        });
        object.material = Array.isArray(object.material) ? meshMaterials : meshMaterials[0];
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
    const bounds = new THREE.Box3().setFromObject(clone);
    const size = bounds.getSize(new THREE.Vector3());
    const shadowClone = clone.clone(true);
    const darkMaterials: THREE.MeshBasicMaterial[] = [];
    shadowClone.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const sourceMaterials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      const replacements = sourceMaterials.map(() => {
        const dark = new THREE.MeshBasicMaterial({
          color: "#090706",
          transparent: true,
          opacity: 0,
          depthWrite: false,
          toneMapped: false,
        });
        darkMaterials.push(dark);
        return dark;
      });
      object.material = Array.isArray(object.material) ? replacements : replacements[0];
      object.castShadow = false;
      object.receiveShadow = false;
    });

    // Soft procedural alpha map shared by the 3D mist sprites. Keeping this
    // texture tiny avoids introducing another network request into the hero.
    const textureSize = 64;
    const pixels = new Uint8Array(textureSize * textureSize * 4);
    for (let y = 0; y < textureSize; y += 1) {
      for (let x = 0; x < textureSize; x += 1) {
        const offset = (y * textureSize + x) * 4;
        const nx = (x / (textureSize - 1)) * 2 - 1;
        const ny = (y / (textureSize - 1)) * 2 - 1;
        const distance = Math.sqrt(nx * nx + ny * ny);
        const softEdge = THREE.MathUtils.smoothstep(1 - distance, 0, 0.84);
        const cloud =
          0.78 +
          Math.sin(x * 0.42 + y * 0.17) * 0.1 +
          Math.sin(x * 0.13 - y * 0.31) * 0.12;
        pixels[offset] = 255;
        pixels[offset + 1] = 255;
        pixels[offset + 2] = 255;
        pixels[offset + 3] = Math.round(255 * softEdge * cloud);
      }
    }
    const fogTexture = new THREE.DataTexture(
      pixels,
      textureSize,
      textureSize,
      THREE.RGBAFormat,
    );
    fogTexture.needsUpdate = true;
    return {
      model: clone,
      shadow: shadowClone,
      center: bounds.getCenter(new THREE.Vector3()),
      dimensions: size,
      materials: clonedMaterials,
      shadowMaterials: darkMaterials,
      mistTexture: fogTexture,
    };
  }, [scene]);
  const autoAngle = useRef(0);
  const floatPhase = useRef(0);
  const resumeDelay = useRef(0.7);
  useEffect(() => {
    autoAngle.current = 0;
    floatPhase.current = 0;
    revealElapsed.current = 0;
    revealComplete.current = reducedMotion || !cinematicEntrance;
    resumeDelay.current = 0.7;
    interaction.current.dragging = false;
    interaction.current.returning = true;
    interaction.current.manualYaw = 0;
    interaction.current.manualPitch = 0;
    interaction.current.currentYaw = 0;
    interaction.current.currentPitch = 0;
    if (group.current) group.current.rotation.set(0, 0, 0);
    materials.forEach((material) => {
      material.transparent = cinematicEntrance && !reducedMotion;
      material.opacity = cinematicEntrance && !reducedMotion ? 0 : 1;
      material.depthWrite = reducedMotion || !cinematicEntrance;
    });
    shadowMaterials.forEach((material) => {
      material.opacity = 0;
    });
  }, [
    src,
    interaction,
    materials,
    shadowMaterials,
    reducedMotion,
    cinematicEntrance,
  ]);
  // Fit against both axes. Some assets contain a full model in a wide pose,
  // so height-only fitting can leave arms or legs outside the canvas.
  const compactViewport = viewport.width < 5;
  const fittedScale = Math.min(
    (viewport.width * (compactViewport ? 0.88 : 0.74)) /
      Math.max(dimensions.x, dimensions.z, 0.001),
    (viewport.height * (compactViewport ? 0.9 : 0.82)) /
      Math.max(dimensions.y, 0.001),
  );
  // Everlast has a lower visual center and its feet describe a wider arc as
  // the character rotates. Give that asset its own safe framing rather than
  // shrinking every garment in the carousel.
  const isEverlast = src.includes("Playera_Everlast");
  const scale = fittedScale * (isEverlast ? (compactViewport ? 0.88 : 0.91) : 1);
  const baseYOffset = isEverlast
    ? viewport.height * (compactViewport ? 0.045 : 0.035)
    : 0;
  useFrame((_, delta) => {
    if (!group.current) return;
    if (!revealComplete.current) {
      revealElapsed.current += Math.min(delta, 0.05);
      const localTime = revealElapsed.current - entranceDelay;
      if (localTime <= 0) {
        group.current.visible = false;
        return;
      }

      group.current.visible = true;
      const progress = THREE.MathUtils.clamp(localTime / 1.62, 0, 1);
      const smooth = progress * progress * (3 - 2 * progress);
      const breathe = Math.sin(progress * Math.PI);

      // A dense silhouette arrives first. The real garment quietly emerges
      // from it while the surrounding shadow mist expands and dissipates.
      group.current.scale.setScalar(scale * (0.975 + smooth * 0.025));
      group.current.position.y =
        baseYOffset - (1 - smooth) * viewport.height * 0.035 + breathe * 0.025;
      group.current.rotation.y = 0;
      group.current.rotation.z = 0;
      materials.forEach((material) => {
        material.opacity = THREE.MathUtils.smoothstep(progress, 0.22, 0.76);
      });
      shadowMaterials.forEach((material) => {
        material.opacity =
          (1 - THREE.MathUtils.smoothstep(progress, 0.28, 0.92)) *
          THREE.MathUtils.smoothstep(progress, 0, 0.16) *
          0.9;
      });
      const mistGroup = group.current.getObjectByName("reveal-mist");
      mistGroup?.children.forEach((sprite, spriteIndex) => {
        const originX = sprite.userData.originX as number;
        const originY = sprite.userData.originY as number;
        const direction = sprite.userData.direction as number;
        const drift = smooth * (dimensions.x * (0.15 + (spriteIndex % 4) * 0.035));
        sprite.position.x = originX + direction * drift;
        sprite.position.y = originY + smooth * dimensions.y * (0.035 + (spriteIndex % 3) * 0.018);
        sprite.rotation.z += delta * direction * 0.08;
        const spriteMaterial = (sprite as THREE.Sprite).material as THREE.SpriteMaterial;
        spriteMaterial.opacity =
          Math.sin(THREE.MathUtils.clamp(progress / 0.88, 0, 1) * Math.PI) *
          (0.38 + (spriteIndex % 3) * 0.06);
      });

      if (progress >= 1) {
        revealComplete.current = true;
        group.current.scale.setScalar(scale);
        group.current.position.y = baseYOffset;
        group.current.rotation.set(0, 0, 0);
        materials.forEach((material) => {
          material.opacity = 1;
          material.transparent = false;
          material.depthWrite = true;
          material.needsUpdate = true;
        });
        shadowMaterials.forEach((material) => {
          material.opacity = 0;
        });
        const mistGroup = group.current.getObjectByName("reveal-mist");
        mistGroup?.children.forEach((sprite) => {
          ((sprite as THREE.Sprite).material as THREE.SpriteMaterial).opacity = 0;
        });
      }
      return;
    }
    if (resumeDelay.current > 0) resumeDelay.current = Math.max(0, resumeDelay.current - delta);
    if (
      !interaction.current.dragging &&
      !interaction.current.returning &&
      resumeDelay.current === 0 &&
      !reducedMotion
    ) {
      autoAngle.current += delta * 0.075;
      floatPhase.current += delta * 0.8;
    }
    const targetY = interaction.current.dragging
      ? interaction.current.manualYaw
      : interaction.current.returning
        ? 0
        : autoAngle.current;
    const targetX = interaction.current.dragging
      ? interaction.current.manualPitch
      : 0;
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      targetY,
      interaction.current.returning ? 5.4 : 7,
      delta,
    );
    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      targetX,
      interaction.current.returning ? 5.4 : 7,
      delta,
    );
    interaction.current.currentYaw = group.current.rotation.y;
    interaction.current.currentPitch = group.current.rotation.x;
    if (
      interaction.current.returning &&
      Math.abs(group.current.rotation.y) < 0.006 &&
      Math.abs(group.current.rotation.x) < 0.006
    ) {
      group.current.rotation.x = 0;
      group.current.rotation.y = 0;
      autoAngle.current = 0;
      resumeDelay.current = 0.45;
      interaction.current.returning = false;
    }
    group.current.position.y =
      baseYOffset + (!reducedMotion ? Math.sin(floatPhase.current) * 0.026 : 0);
  });

  return (
    <group ref={group} scale={scale} dispose={null}>
      <primitive object={model} position={[-center.x, -center.y, -center.z]} />
      <primitive object={shadow} position={[-center.x, -center.y, -center.z]} />
      <group name="reveal-mist" position={[0, 0, 0.22]}>
        {Array.from({ length: 12 }, (_, index) => {
          const column = (index % 4) / 3;
          const row = Math.floor(index / 4) / 2;
          const originX = (column - 0.5) * dimensions.x * 0.82;
          const originY = (row - 0.5) * dimensions.y * 0.88;
          const direction = index % 2 === 0 ? -1 : 1;
          return (
            <sprite
              key={index}
              position={[originX, originY, (index % 3) * 0.025]}
              scale={[
                dimensions.x * (0.62 + (index % 3) * 0.12),
                dimensions.y * (0.26 + (index % 2) * 0.08),
                1,
              ]}
              userData={{ originX, originY, direction }}
            >
              <spriteMaterial
                map={mistTexture}
                color={index % 3 === 0 ? "#241713" : "#080706"}
                transparent
                opacity={0}
                depthWrite={false}
                toneMapped={false}
              />
            </sprite>
          );
        })}
      </group>
    </group>
  );
}

function Loader() {
  return (
    <Html center>
      <div className="hero__loader">
        <span />
        Loading item
      </div>
    </Html>
  );
}

interface HeroSceneProps {
  modelSrc: string;
  preloadSources?: string[];
  reducedMotion: boolean;
  paused?: boolean;
  entranceDelay?: number;
  onOpenDetails?: () => void;
  onUserInteraction?: () => void;
}

export function HeroScene({
  modelSrc,
  preloadSources = [],
  reducedMotion,
  paused = false,
  entranceDelay = 0,
  onOpenDetails,
  onUserInteraction,
}: HeroSceneProps) {
  const [modalPaused, setModalPaused] = useState(false);
  const [cinematicEntrance, setCinematicEntrance] = useState(true);
  const isPaused = paused || modalPaused;
  const interaction = useRef<InteractionState>({
    dragging: false,
    returning: false,
    manualYaw: 0,
    manualPitch: 0,
    currentYaw: 0,
    currentPitch: 0,
    lastX: 0,
    lastY: 0,
    downX: 0,
    downY: 0,
    moved: false,
  });
  useEffect(() => {
    // The model on screen right now is already loading via useGLTF/Suspense.
    // Fetching its immediate neighbors next means a prev/next tap almost
    // never waits on a cold multi-MB download.
    if (preloadSources.length < 2) return;
    const currentIndex = preloadSources.indexOf(modelSrc);
    if (currentIndex === -1) return;
    const total = preloadSources.length;
    const neighbors = [
      preloadSources[(currentIndex + 1) % total],
      preloadSources[(currentIndex - 1 + total) % total],
    ];
    neighbors.forEach((source) => {
      if (source && source !== modelSrc) useGLTF.preload(source);
    });
  }, [modelSrc, preloadSources]);

  useEffect(() => {
    // Every other garment gets warmed once too, but only once the browser is
    // idle and spaced out so it never competes with images/fonts needed for
    // first paint. useGLTF keeps parsed results in a shared in-memory cache,
    // so a later mount of any of these resolves immediately.
    if (preloadSources.length === 0) return;
    let cancelled = false;
    const timers: number[] = [];
    const idleId = requestIdle(() => {
      preloadSources.forEach((source, i) => {
        timers.push(
          window.setTimeout(() => {
            if (!cancelled) useGLTF.preload(source);
          }, i * 500),
        );
      });
    });
    return () => {
      cancelled = true;
      cancelIdle(idleId);
      timers.forEach((id) => window.clearTimeout(id));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => setCinematicEntrance(false), entranceDelay * 1000 + 2200);
    return () => window.clearTimeout(timer);
  }, [entranceDelay]);
  useEffect(() => {
    const handleModal = (event: Event) => {
      setModalPaused((event as CustomEvent<{ open: boolean }>).detail.open);
    };
    window.addEventListener("product-modal:toggle", handleModal);
    return () => window.removeEventListener("product-modal:toggle", handleModal);
  }, []);

  return (
    <Canvas
      frameloop={isPaused ? "demand" : "always"}
      dpr={[1, 1.65]}
      camera={{ position: [0, 0, 5.8], fov: 32, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      shadows="basic"
      onPointerDown={(event) => {
        onUserInteraction?.();
        interaction.current.dragging = true;
        interaction.current.returning = false;
        interaction.current.manualYaw = interaction.current.currentYaw;
        interaction.current.manualPitch = interaction.current.currentPitch;
        interaction.current.lastX = event.clientX;
        interaction.current.lastY = event.clientY;
        interaction.current.downX = event.clientX;
        interaction.current.downY = event.clientY;
        interaction.current.moved = false;
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (!interaction.current.dragging) return;
        const deltaX = event.clientX - interaction.current.lastX;
        const deltaY = event.clientY - interaction.current.lastY;
        if (
          Math.hypot(
            event.clientX - interaction.current.downX,
            event.clientY - interaction.current.downY,
          ) > 6
        ) {
          interaction.current.moved = true;
        }
        interaction.current.manualYaw += deltaX * 0.009;
        interaction.current.manualPitch = THREE.MathUtils.clamp(
          interaction.current.manualPitch + deltaY * 0.006,
          -0.55,
          0.55,
        );
        interaction.current.lastX = event.clientX;
        interaction.current.lastY = event.clientY;
      }}
      onPointerUp={(event) => {
        const shouldOpen = !interaction.current.moved;
        interaction.current.dragging = false;
        interaction.current.returning = true;
        event.currentTarget.releasePointerCapture(event.pointerId);
        if (shouldOpen) onOpenDetails?.();
      }}
      onPointerCancel={() => {
        interaction.current.dragging = false;
        interaction.current.returning = true;
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.08;
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
    >
      <ambientLight intensity={0.34} color="#d8cbb7" />
      <hemisphereLight intensity={0.72} color="#fff8eb" groundColor="#675b4b" />
      {/* Large, soft fashion key light: reveals folds and material texture. */}
      <rectAreaLight
        position={[-2.7, 2.6, 4]}
        rotation={[-0.28, -0.55, 0]}
        width={3.2}
        height={5}
        intensity={10}
        color="#ffe8c6"
      />
      <spotLight
        position={[3.8, 5.5, 4.5]}
        angle={0.3}
        penumbra={0.72}
        intensity={92}
        color="#fff0d5"
        castShadow
        shadow-bias={-0.0001}
      />
      {/* Blood-red rim light separates dark garments from the warm canvas. */}
      <spotLight
        position={[-4, 2.5, -2.5]}
        angle={0.52}
        penumbra={0.78}
        intensity={74}
        color="#b5231c"
      />
      <pointLight position={[0, -1.2, 3.2]} intensity={13} color="#b9a282" />
      <Suspense fallback={<Loader />}>
        <Garment
          src={modelSrc}
          interaction={interaction}
          reducedMotion={reducedMotion || isPaused}
          entranceDelay={entranceDelay}
          cinematicEntrance={cinematicEntrance}
        />
      </Suspense>
    </Canvas>
  );
}
