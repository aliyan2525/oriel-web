"use client";

import { Canvas, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { dprRange } from "./gate";
import { ARCH, CAMERA_FOV, FRAME, archPoints, cameraDistance, revealCount } from "./scene-math";

const AMBER = "#EF9F27";
const INDIGO = "#534AB7";

/*
 * The brand mark, in 3D: an arch window with two amber agents on either side and a bar between
 * them, the permission link. The orbs sit just outside the card, so the frosted glass never
 * hides them. The bar crosses the window through the gap between message bubbles.
 */
const ORB_X = 1.18;
const ORB_Y = -0.62;
const ORBS: [number, number, number][] = [
  [-ORB_X, ORB_Y, 0],
  [ORB_X, ORB_Y, 0],
];

/** A soft radial glow for the orb halos. Null if a 2D canvas isn't available. */
function glowTexture(): THREE.CanvasTexture | null {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.35, "rgba(255,255,255,0.35)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** The window: an indigo arch that draws on, a sill, two amber agents, and the permission bar. */
function HeroWindow({ active }: { active: boolean }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);

  const orbA = useRef<THREE.Mesh>(null);
  const orbB = useRef<THREE.Mesh>(null);
  const bar = useRef<THREE.Mesh>(null);
  const loopRef = useRef<gsap.core.Timeline | null>(null);
  const loopStarted = useRef(false);
  const activeRef = useRef(active);

  const frameGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(archPoints(), false, "centripetal");
    const geometry = new THREE.TubeGeometry(curve, FRAME.tubularSegments, FRAME.tubeRadius, FRAME.radialSegments, false);
    geometry.setDrawRange(0, 0); // hidden until the intro draws it on
    return geometry;
  }, []);
  const frameCount = frameGeo.index?.count ?? 0;

  const sillGeo = useMemo(
    () =>
      new THREE.TubeGeometry(
        new THREE.LineCurve3(
          new THREE.Vector3(-ARCH.sillHalf, ARCH.bottomY, 0),
          new THREE.Vector3(ARCH.sillHalf, ARCH.bottomY, 0),
        ),
        2,
        FRAME.sillRadius,
        FRAME.radialSegments,
        false,
      ),
    [],
  );
  const barGeo = useMemo(() => new THREE.CylinderGeometry(0.006, 0.006, ORB_X * 2, 12), []);
  const frameMat = useMemo(() => new THREE.MeshStandardMaterial({ color: INDIGO, roughness: 0.38, metalness: 0.15 }), []);
  const sillMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: INDIGO, roughness: 0.38, metalness: 0.15, transparent: true, opacity: 0 }),
    [],
  );
  const barMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: INDIGO, roughness: 0.3, transparent: true, opacity: 0 }),
    [],
  );
  const orbMats = useMemo(
    () => ORBS.map(() => new THREE.MeshStandardMaterial({ color: AMBER, emissive: AMBER, emissiveIntensity: 1.4, roughness: 0.3 })),
    [],
  );
  const glow = useMemo(() => glowTexture(), []);
  const haloMats = useMemo(
    () =>
      ORBS.map(
        () =>
          new THREE.SpriteMaterial({
            map: glow,
            color: AMBER,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          }),
      ),
    [glow],
  );

  // Procedural studio lighting for the frame's reflections. No HDR download.
  // Shaders compile here, before the first frame, so the intro doesn't stall on its first draw.
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    gl.compile(scene, camera);
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene, camera]);

  // Intro: the frame draws on, the sill fades in, the orbs grow, the bar draws between them,
  // and the halos rise. From 3 s a slow yoyo loop breathes the halos and the bar. It pauses off-screen.
  useEffect(() => {
    const orbs = [orbA.current, orbB.current];
    if (!orbs[0] || !orbs[1] || !bar.current || !glow) return;
    const [orbOne, orbTwo] = orbs;
    const barMesh = bar.current;
    const draw = { p: 0 };

    const ctx = gsap.context(() => {
      const loop = gsap.timeline({ repeat: -1, yoyo: true, paused: true, defaults: { ease: "sine.inOut", duration: 2.6 } });
      loop.to(haloMats, { opacity: 0.22 }, 0).to(barMat, { opacity: 0.4 }, 0);
      loopRef.current = loop;

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .to(draw, {
          p: 1,
          duration: 1.9,
          ease: "power2.inOut",
          onUpdate: () => frameGeo.setDrawRange(0, revealCount(draw.p, frameCount)),
        }, 0.15)
        .to(sillMat, { opacity: 1, duration: 0.9 }, 1.5)
        .to(orbOne.scale, { x: 1, y: 1, z: 1, duration: 0.9, ease: "back.out(1.6)" }, 1.2)
        .to(orbTwo.scale, { x: 1, y: 1, z: 1, duration: 0.9, ease: "back.out(1.6)" }, 1.32)
        .to(haloMats, { opacity: 0.55, duration: 1.2 }, 1.45)
        .fromTo(barMesh.scale, { y: 0 }, { y: 1, duration: 0.8, ease: "power2.out" }, 1.9)
        .to(barMat, { opacity: 0.9, duration: 0.8 }, 1.9)
        .call(() => {
          loopStarted.current = true;
          loop.paused(!activeRef.current);
        }, undefined, 3);
    });

    return () => ctx.revert();
  }, [frameGeo, frameCount, sillMat, barMat, haloMats, glow]);

  useEffect(() => {
    activeRef.current = active;
    if (loopStarted.current) loopRef.current?.paused(!active);
  }, [active]);

  useEffect(() => {
    return () => {
      frameGeo.dispose();
      sillGeo.dispose();
      barGeo.dispose();
      frameMat.dispose();
      sillMat.dispose();
      barMat.dispose();
      orbMats.forEach((m) => m.dispose());
      haloMats.forEach((m) => m.dispose());
      glow?.dispose();
    };
  }, [frameGeo, sillGeo, barGeo, frameMat, sillMat, barMat, orbMats, haloMats, glow]);

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[1.5, 2.5, 3]} intensity={1.1} />
      <mesh geometry={frameGeo} material={frameMat} />
      <mesh geometry={sillGeo} material={sillMat} />
      <mesh ref={bar} geometry={barGeo} material={barMat} position={[0, ORB_Y, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 0.001, 1]} />
      <mesh ref={orbA} position={ORBS[0]} scale={0.001} material={orbMats[0]}>
        <sphereGeometry args={[0.085, 32, 24]} />
        {glow && <sprite scale={0.7} material={haloMats[0]} />}
      </mesh>
      <mesh ref={orbB} position={ORBS[1]} scale={0.001} material={orbMats[1]}>
        <sphereGeometry args={[0.085, 32, 24]} />
        {glow && <sprite scale={0.7} material={haloMats[1]} />}
      </mesh>
    </>
  );
}

export function HeroCanvas({ active, onReady, onFail }: { active: boolean; onReady: () => void; onFail: () => void }) {
  const dpr = useMemo(() => dprRange(window.matchMedia("(pointer: coarse)").matches), []);
  const distance = useMemo(() => cameraDistance(), []);

  return (
    <div className="hero-canvas" aria-hidden="true">
      <Canvas
        dpr={dpr}
        frameloop={active ? "always" : "never"}
        camera={{ fov: CAMERA_FOV, position: [0, 0, distance], near: 0.1, far: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", (event) => {
            event.preventDefault();
            onFail();
          });
          onReady();
        }}
      >
        <HeroWindow active={active} />
      </Canvas>
    </div>
  );
}
