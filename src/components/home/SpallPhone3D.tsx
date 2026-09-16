"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

type Props = {
  screenUrl: string | null;
  label: string;
};

const MODEL_URL = "/models/iphone-17-pro-max.glb";
const SCREEN_MATERIAL = "17ProMax_Screen";

function pillShape(width: number, height: number) {
  const shape = new THREE.Shape();
  const radius = height / 2;
  const left = -width / 2 + radius;
  const right = width / 2 - radius;

  shape.moveTo(left, -radius);
  shape.lineTo(right, -radius);
  shape.absarc(right, 0, radius, -Math.PI / 2, Math.PI / 2, false);
  shape.lineTo(left, radius);
  shape.absarc(left, 0, radius, Math.PI / 2, Math.PI * 1.5, false);
  shape.closePath();

  return shape;
}

export default function SpallPhone3D(props: Props) {
  return <PhoneScene key={props.screenUrl ?? "original"} {...props} />;
}

function PhoneScene({ screenUrl, label }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let renderer: THREE.WebGLRenderer | undefined;
    let environment: THREE.WebGLRenderTarget | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let cleanupMotion: (() => void) | undefined;

    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    const textures = new Set<THREE.Texture>();

    function trackMaterial(material: THREE.Material) {
      materials.add(material);

      for (const value of Object.values(material)) {
        if (value instanceof THREE.Texture) textures.add(value);
      }
    }

    function trackModel(model: THREE.Object3D) {
      model.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;

        geometries.add(object.geometry);

        const surfaces = Array.isArray(object.material)
          ? object.material
          : [object.material];

        surfaces.forEach(trackMaterial);
      });
    }

    function disposeAssets() {
      textures.forEach((texture) => texture.dispose());
      materials.forEach((material) => material.dispose());
      geometries.forEach((geometry) => geometry.dispose());

      textures.clear();
      materials.clear();
      geometries.clear();
    }

    function onContextLost() {
      if (disposed) return;

      cleanupMotion?.();
      setReady(false);
      setFailed(true);
    }

    function release() {
      cleanupMotion?.();
      cleanupMotion = undefined;

      resizeObserver?.disconnect();
      resizeObserver = undefined;

      environment?.dispose();
      environment = undefined;

      disposeAssets();

      if (renderer) {
        renderer.domElement.removeEventListener(
          "webglcontextlost",
          onContextLost,
        );
        renderer.dispose();
        renderer.domElement.remove();
        renderer = undefined;
      }
    }

    /*
     * Coordinates are specific to the GLB from your ZIP.
     * Its display faces -Z.
     *
     * This cover sits just in front of the existing sensor geometry,
     * covering the bright outlines without changing the phone body.
     */
    function fixDynamicIsland(model: THREE.Object3D) {
      const islandMaterial = new THREE.MeshBasicMaterial({
        color: "#050608",
        side: THREE.DoubleSide,
        toneMapped: false,
      });

      const islandGeometry = new THREE.ShapeGeometry(
        pillShape(0.0232, 0.00625),
        40,
      );

      const island = new THREE.Mesh(islandGeometry, islandMaterial);
      island.name = "Spall_DynamicIsland";
      island.position.set(-0.0000973, 0.1546617, -0.00496);
      model.add(island);

      geometries.add(islandGeometry);
      trackMaterial(islandMaterial);

      // Very dark blue: a subtle lens, not a bright blue dot.
      const lensMaterial = new THREE.MeshBasicMaterial({
        color: "#101822",
        side: THREE.DoubleSide,
        toneMapped: false,
      });

      const lensGeometry = new THREE.CircleGeometry(0.0009, 40);
      const lens = new THREE.Mesh(lensGeometry, lensMaterial);

      lens.name = "Spall_FrontLens";
      lens.position.set(-0.0084687, 0.1546617, -0.00498);
      model.add(lens);

      geometries.add(lensGeometry);
      trackMaterial(lensMaterial);
    }

    async function initialize() {
      try {
        const gltf = await new GLTFLoader().loadAsync(MODEL_URL);
        const model = gltf.scene;

        trackModel(model);

        if (disposed) {
          disposeAssets();
          return;
        }

        let replacementTexture: THREE.Texture | undefined;

        if (screenUrl) {
          replacementTexture = await new THREE.TextureLoader().loadAsync(
            screenUrl,
          );

          textures.add(replacementTexture);

          if (disposed) {
            disposeAssets();
            return;
          }

          replacementTexture.colorSpace = THREE.SRGBColorSpace;
          replacementTexture.flipY = true;
        }

        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: "low-power",
        });

        const webgl = renderer;

        webgl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        webgl.setClearColor(0x000000, 0);
        webgl.outputColorSpace = THREE.SRGBColorSpace;
        webgl.toneMapping = THREE.ACESFilmicToneMapping;
        webgl.toneMappingExposure = 1.1;

        Object.assign(webgl.domElement.style, {
          width: "100%",
          height: "100%",
          display: "block",
        });

        host!.appendChild(webgl.domElement);
        webgl.domElement.addEventListener(
          "webglcontextlost",
          onContextLost,
        );

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

        camera.position.set(0, 0, 13);
        camera.lookAt(0, 0, 0);

        const room = new RoomEnvironment();
        const pmrem = new THREE.PMREMGenerator(webgl);

        try {
          environment = pmrem.fromScene(room, 0.04);
          scene.environment = environment.texture;
        } finally {
          room.dispose();
          pmrem.dispose();
        }

        const keyLight = new THREE.DirectionalLight("#fff7ed", 2.5);
        keyLight.position.set(-4, 6, 8);
        scene.add(keyLight);

        const rimLight = new THREE.DirectionalLight("#e8efe9", 1.5);
        rimLight.position.set(5, 2, -3);
        scene.add(rimLight);

        let screenFound = false;

        model.traverse((object) => {
          if (!(object instanceof THREE.Mesh)) return;

          const originalMaterials: THREE.Material[] =
            Array.isArray(object.material)
              ? object.material
              : [object.material];

          const updatedMaterials = originalMaterials.map((surface) => {
            if (
              surface.name === "17ProMax_color" &&
              surface instanceof THREE.MeshStandardMaterial
            ) {
              surface.metalness = 1;
              surface.roughness = 0.3;
              surface.envMapIntensity = 1.1;
            }

            // Keep the existing display glass subtle.
            if (
              surface.name === "17ProMax_glass" &&
              surface instanceof THREE.MeshPhysicalMaterial
            ) {
              surface.color.set("#ffffff");
              surface.transmission = 0;
              surface.transparent = true;
              surface.opacity = 0.045;
              surface.depthWrite = false;
              surface.roughness = 0.15;
              surface.clearcoat = 0.6;
              surface.clearcoatRoughness = 0.12;
              surface.needsUpdate = true;
            }

            // Darken the original front sensor and lens as well.
            // These names were verified in your GLB.
            if (
              surface.name === "17ProMax_2112" ||
              surface.name === "17ProMax_Lens2"
            ) {
              const darkSurface = new THREE.MeshBasicMaterial({
                name: surface.name,
                color: "#050608",
                side: THREE.DoubleSide,
                toneMapped: false,
              });

              trackMaterial(darkSurface);
              return darkSurface;
            }

            if (surface.name !== SCREEN_MATERIAL) return surface;

            screenFound = true;
            if (!replacementTexture) return surface;

            const geometry = object.geometry;
            geometry.computeBoundingBox();

            const bounds = geometry.boundingBox!;
            const width = bounds.max.x - bounds.min.x;
            const height = bounds.max.y - bounds.min.y;
            const positions = geometry.getAttribute("position");
            const uv = new Float32Array(positions.count * 2);

            for (let i = 0; i < positions.count; i++) {
              uv[i * 2] =
                1 - (positions.getX(i) - bounds.min.x) / width;

              uv[i * 2 + 1] =
                (positions.getY(i) - bounds.min.y) / height;
            }

            geometry.setAttribute(
              "uv",
              new THREE.BufferAttribute(uv, 2),
            );

            const image = replacementTexture.image as {
              width: number;
              height: number;
            };

            const imageAspect = image.width / image.height;
            const displayAspect = width / height;

            replacementTexture.repeat.set(1, 1);
            replacementTexture.offset.set(0, 0);

            if (imageAspect > displayAspect) {
              replacementTexture.repeat.x =
                displayAspect / imageAspect;
              replacementTexture.offset.x =
                (1 - replacementTexture.repeat.x) / 2;
            } else {
              replacementTexture.repeat.y =
                imageAspect / displayAspect;
              replacementTexture.offset.y =
                1 - replacementTexture.repeat.y;
            }

            replacementTexture.anisotropy = Math.min(
              webgl.capabilities.getMaxAnisotropy(),
              8,
            );

            const screen = new THREE.MeshBasicMaterial({
              name: SCREEN_MATERIAL,
              map: replacementTexture,
              color: "#ffffff",
              side: THREE.DoubleSide,
              toneMapped: false,
            });

            trackMaterial(screen);
            return screen;
          });

          object.material = Array.isArray(object.material)
            ? updatedMaterials
            : updatedMaterials[0];
        });

        if (!screenFound) {
          throw new Error(
            `Material ${SCREEN_MATERIAL} tidak ditemukan. ` +
              "Gunakan GLB dari ZIP yang sebelumnya diperiksa.",
          );
        }

        // Add the corrected island before centering the complete model.
        fixDynamicIsland(model);

        model.rotation.y = Math.PI;
        model.updateMatrixWorld(true);

        const bounds = new THREE.Box3().setFromObject(model);
        const center = bounds.getCenter(new THREE.Vector3());
        const size = bounds.getSize(new THREE.Vector3());

        if (size.y <= 0) {
          throw new Error("Dimensi model tidak valid.");
        }

        model.position.sub(center);

        const phone = new THREE.Group();
        phone.add(model);
        phone.scale.setScalar(5.2 / size.y);

        const baseRotation = {
          x: 0.08,
          y: -0.32,
          z: -0.15,
        };

        phone.rotation.set(
          baseRotation.x,
          baseRotation.y,
          baseRotation.z,
        );

        scene.add(phone);

        function render() {
          if (!disposed && !webgl.getContext().isContextLost()) {
            webgl.render(scene, camera);
          }
        }

        function resize() {
          const width = host!.clientWidth;
          const height = host!.clientHeight;

          if (!width || !height) return;

          webgl.setSize(width, height, false);
          camera.aspect = width / height;

          const halfFov = THREE.MathUtils.degToRad(camera.fov) / 2;
          const verticalFit = 3.15 / Math.tan(halfFov);
          const horizontalFit =
            1.95 / (Math.tan(halfFov) * camera.aspect);

          camera.position.z = Math.max(verticalFit, horizontalFit);
          camera.updateProjectionMatrix();
          render();
        }

        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(host!);
        resize();

        const cover = host!.closest<HTMLElement>(
          '[data-spall-featured="true"]',
        );

        if (cover) {
          const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
          );

          const target = { ...baseRotation };
          let targetY = 0;
          let frame = 0;
          let previousTime = 0;

          function animate(time: number) {
            frame = 0;

            if (disposed || webgl.getContext().isContextLost()) return;

            const delta = previousTime
              ? Math.min((time - previousTime) / 1000, 0.05)
              : 1 / 60;

            previousTime = time;
            const ease = 1 - Math.exp(-9 * delta);

            phone.rotation.x +=
              (target.x - phone.rotation.x) * ease;
            phone.rotation.y +=
              (target.y - phone.rotation.y) * ease;
            phone.rotation.z +=
              (target.z - phone.rotation.z) * ease;
            phone.position.y +=
              (targetY - phone.position.y) * ease;

            const remaining =
              Math.abs(target.x - phone.rotation.x) +
              Math.abs(target.y - phone.rotation.y) +
              Math.abs(target.z - phone.rotation.z) +
              Math.abs(targetY - phone.position.y);

            if (remaining <= 0.0001) {
              phone.rotation.set(target.x, target.y, target.z);
              phone.position.y = targetY;
              previousTime = 0;
            } else {
              frame = requestAnimationFrame(animate);
            }

            render();
          }

          function schedule() {
            if (!frame && !disposed) {
              previousTime = 0;
              frame = requestAnimationFrame(animate);
            }
          }

          function onPointerMove(event: PointerEvent) {
            if (
              event.pointerType === "touch" ||
              reducedMotion.matches
            ) {
              return;
            }

            const rect = cover!.getBoundingClientRect();
            if (!rect.width || !rect.height) return;

            const x = THREE.MathUtils.clamp(
              ((event.clientX - rect.left) / rect.width) * 2 - 1,
              -1,
              1,
            );

            const y = THREE.MathUtils.clamp(
              ((event.clientY - rect.top) / rect.height) * 2 - 1,
              -1,
              1,
            );

            target.x = baseRotation.x + y * 0.12;
            target.y = baseRotation.y + x * 0.24;
            target.z = baseRotation.z - x * 0.035;
            targetY = 0.06;

            schedule();
          }

          function resetPose() {
            Object.assign(target, baseRotation);
            targetY = 0;

            if (reducedMotion.matches) {
              cancelAnimationFrame(frame);
              frame = 0;
              previousTime = 0;

              phone.rotation.set(target.x, target.y, target.z);
              phone.position.y = 0;
              render();
              return;
            }

            schedule();
          }

          cover.addEventListener("pointermove", onPointerMove, {
            passive: true,
          });
          cover.addEventListener("pointerleave", resetPose);
          cover.addEventListener("pointercancel", resetPose);
          reducedMotion.addEventListener("change", resetPose);
          window.addEventListener("blur", resetPose);

          cleanupMotion = () => {
            cancelAnimationFrame(frame);
            frame = 0;

            cover.removeEventListener("pointermove", onPointerMove);
            cover.removeEventListener("pointerleave", resetPose);
            cover.removeEventListener("pointercancel", resetPose);
            reducedMotion.removeEventListener("change", resetPose);
            window.removeEventListener("blur", resetPose);
          };
        }

        render();

        if (!disposed && !webgl.getContext().isContextLost()) {
          setReady(true);
        }
      } catch (error) {
        if (!disposed) {
          console.error("[SpallPhone3D]", error);
          setReady(false);
          setFailed(true);
        }

        release();
      }
    }

    void initialize();

    return () => {
      disposed = true;
      release();
    };
  }, [screenUrl]);

  return (
    <div
      role="img"
      aria-label={label}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
    >
      {!ready && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: "9% 20%",
            overflow: "hidden",
            border: "5px solid #303930",
            borderRadius: "12% / 6%",
            background: "#eeeade",
            transform: "rotate(9deg)",
          }}
        >
          {screenUrl ? (
            <Image
              src={screenUrl}
              alt=""
              fill
              sizes="(max-width: 700px) 35vw, 28vw"
              unoptimized
              style={{
                objectFit: "cover",
                objectPosition: "top",
              }}
            />
          ) : (
            <span
              style={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                padding: "12%",
                textAlign: "center",
                color: "#234535",
                fontSize: "12px",
              }}
            >
              {failed ? "Preview unavailable" : "Loading iPhone…"}
            </span>
          )}
        </div>
      )}

      <div
        ref={hostRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          opacity: ready ? 1 : 0,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}