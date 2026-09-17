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

type IconKind = "identity" | "explore" | "share";

const MODEL_URL = "/models/iphone-17-pro-max.glb";

function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;

  r = Math.min(r, w / 2, h / 2);

  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  s.closePath();

  return s;
}

function canvasTexture(
  draw: (ctx: CanvasRenderingContext2D) => void,
) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D unavailable.");

  draw(ctx);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
}

function iconTexture(kind: IconKind, light = false) {
  return canvasTexture((ctx) => {
    ctx.strokeStyle = light ? "#e2e7d8" : "#234633";
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (kind === "identity") {
      ctx.beginPath();
      ctx.arc(256, 153, 34, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(191, 272);
      ctx.lineTo(191, 251);
      ctx.bezierCurveTo(191, 195, 321, 195, 321, 251);
      ctx.lineTo(321, 272);
      ctx.closePath();
      ctx.stroke();
    }

    if (kind === "explore") {
      for (let i = 0; i < 3; i++) {
        const y = 159 + i * 35;

        ctx.beginPath();
        ctx.moveTo(177, y);
        ctx.lineTo(256, y + 41);
        ctx.lineTo(335, y);

        if (i === 0) {
          ctx.lineTo(256, y - 41);
          ctx.closePath();
        }

        ctx.stroke();
      }
    }

    if (kind === "share") {
      ctx.save();
      ctx.translate(256, 203);
      ctx.rotate(-Math.PI / 4);

      ctx.beginPath();
      ctx.roundRect(-94, -30, 116, 60, 30);
      ctx.stroke();

      ctx.beginPath();
      ctx.roundRect(-22, -30, 116, 60, 30);
      ctx.stroke();

      ctx.restore();
    }

    ctx.font = "500 31px Arial";
    ctx.textAlign = "center";
    ctx.fillText(kind.toUpperCase(), 256, 369);
  });
}

function shadowTexture() {
  return canvasTexture((ctx) => {
    const gradient = ctx.createRadialGradient(
      256, 256, 5,
      256, 256, 250,
    );

    gradient.addColorStop(0, "rgba(29,39,28,0.38)");
    gradient.addColorStop(0.35, "rgba(29,39,28,0.17)");
    gradient.addColorStop(0.7, "rgba(29,39,28,0.04)");
    gradient.addColorStop(1, "rgba(29,39,28,0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
  });
}

const ORBIT_WIDTH = 0.46;
const ORBIT_DEPTH = 0.075;
const ORBIT_U = new THREE.Vector3(0.918, 0.397, 0).normalize();
const ORBIT_V = new THREE.Vector3()
  .crossVectors(new THREE.Vector3(0, 0, 1), ORBIT_U)
  .multiplyScalar(-0.48)
  .add(new THREE.Vector3(0, 0, 0.87726849))
  .normalize();
const ORBIT_NORMAL = new THREE.Vector3()
  .crossVectors(ORBIT_U, ORBIT_V)
  .normalize();

function ribbonFrame(t: number) {
  const center = ORBIT_U.clone().multiplyScalar(3.12 * Math.cos(t))
    .addScaledVector(ORBIT_V, 1.72 * Math.sin(t));
  const tangent = ORBIT_U.clone().multiplyScalar(-3.12 * Math.sin(t))
    .addScaledVector(ORBIT_V, 1.72 * Math.cos(t)).normalize();
  const widthAxis = new THREE.Vector3()
    .crossVectors(tangent, ORBIT_NORMAL).normalize();
  widthAxis.applyAxisAngle(tangent, 0.48 * Math.cos(t + 0.4) + 0.16 * Math.sin(2 * t));
  const depthAxis = new THREE.Vector3().crossVectors(widthAxis, tangent).normalize();
  return { center, widthAxis, depthAxis };
}

function ribbonGeometry() {
  const profile = roundedRect(ORBIT_WIDTH, ORBIT_DEPTH, 0.025).getPoints(8);
  if (profile[0].distanceTo(profile[profile.length - 1]) < 0.00001) profile.pop();
  const segments = 192;
  const count = profile.length;
  const positions: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i < segments; i++) {
    const { center, widthAxis, depthAxis } = ribbonFrame(i / segments * Math.PI * 2);
    for (const point of profile) {
      const p = center.clone().addScaledVector(widthAxis, point.x)
        .addScaledVector(depthAxis, point.y);
      positions.push(p.x, p.y, p.z);
    }
  }

  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < count; j++) {
      const nextRing = (i + 1) % segments;
      const nextPoint = (j + 1) % count;
      const a = i * count + j;
      const b = nextRing * count + j;
      const c = nextRing * count + nextPoint;
      const d = i * count + nextPoint;
      indices.push(a, b, c, a, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

function ribbonEdge(offset: number) {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i < 192; i++) {
    const { center, widthAxis } = ribbonFrame(i / 192 * Math.PI * 2);
    points.push(center.addScaledVector(widthAxis, offset));
  }
  return new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(points, true), 192, 0.006, 6, true,
  );
}

function orbitEnvironment() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D unavailable.');
  const base = ctx.createLinearGradient(0, 0, 0, 512);
  base.addColorStop(0, '#faf8f0');
  base.addColorStop(0.42, '#83988a');
  base.addColorStop(0.55, '#13251d');
  base.addColorStop(0.8, '#516a59');
  base.addColorStop(1, '#eae6d9');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 1024, 512);
  for (const [x, width] of [[100, 100], [440, 32], [740, 160]]) {
    const panel = ctx.createLinearGradient(x, 0, x + width, 0);
    panel.addColorStop(0, 'rgba(255,253,241,0)');
    panel.addColorStop(0.18, 'rgba(255,253,241,1)');
    panel.addColorStop(0.82, 'rgba(255,253,241,1)');
    panel.addColorStop(1, 'rgba(255,253,241,0)');
    ctx.fillStyle = panel;
    ctx.fillRect(x, 40, width, 360);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}


export default function SpallEditorialScene(props: Props) {
  return <Scene key={props.screenUrl ?? "original"} {...props} />;
}

function Scene({ screenUrl, label }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let renderer: THREE.WebGLRenderer | undefined;
    let environment: THREE.WebGLRenderTarget | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let visibilityObserver: IntersectionObserver | undefined;
    let cleanupMotion: (() => void) | undefined;

    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    const textures = new Set<THREE.Texture>();

    function keepMaterial<T extends THREE.Material>(value: T): T {
      materials.add(value);

      for (const property of Object.values(value)) {
        if (property instanceof THREE.Texture) textures.add(property);
      }

      return value;
    }

    function makeMesh(
      geometry: THREE.BufferGeometry,
      material: THREE.Material,
    ) {
      geometries.add(geometry);
      keepMaterial(material);
      return new THREE.Mesh(geometry, material);
    }

    function collect(model: THREE.Object3D) {
      model.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;

        geometries.add(object.geometry);

        const list = Array.isArray(object.material)
          ? object.material
          : [object.material];

        list.forEach(keepMaterial);
      });
    }

    function disposeAssets() {
      textures.forEach((value) => value.dispose());
      materials.forEach((value) => value.dispose());
      geometries.forEach((value) => value.dispose());

      textures.clear();
      materials.clear();
      geometries.clear();
    }

    function contextLost() {
      cleanupMotion?.();
      if (!disposed) setReady(false);
    }

    function release() {
      cleanupMotion?.();
      cleanupMotion = undefined;

      resizeObserver?.disconnect();
      visibilityObserver?.disconnect();

      environment?.dispose();
      environment = undefined;

      disposeAssets();

      if (renderer) {
        renderer.domElement.removeEventListener(
          "webglcontextlost",
          contextLost,
        );
        renderer.dispose();
        renderer.domElement.remove();
        renderer = undefined;
      }
    }

    async function initialize() {
      try {
        const gltf = await new GLTFLoader().loadAsync(MODEL_URL);
        const model = gltf.scene;
        collect(model);

        if (disposed) {
          disposeAssets();
          return;
        }

        let screenshot: THREE.Texture | undefined;

        if (screenUrl) {
          screenshot = await new THREE.TextureLoader().loadAsync(screenUrl);
          textures.add(screenshot);

          if (disposed) {
            disposeAssets();
            return;
          }

          screenshot.colorSpace = THREE.SRGBColorSpace;
          screenshot.flipY = true;
        }

        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: "low-power",
        });

        const webgl = renderer;

        webgl.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
        webgl.setClearColor("#f3f0e8", 0);
        webgl.outputColorSpace = THREE.SRGBColorSpace;
        webgl.toneMapping = THREE.ACESFilmicToneMapping;
        webgl.toneMappingExposure = 1;

        Object.assign(webgl.domElement.style, {
          display: "block",
          width: "100%",
          height: "100%",
        });

        host!.appendChild(webgl.domElement);
        webgl.domElement.addEventListener(
          "webglcontextlost",
          contextLost,
        );

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
        camera.position.set(0, 0, 14);

        const room = new RoomEnvironment();

        // Reflection panels give glass a defined bright edge.
        const softboxMaterial = new THREE.MeshBasicMaterial({
          color: new THREE.Color(5, 5, 5),
          side: THREE.DoubleSide,
        });

        const softboxGeometry = new THREE.PlaneGeometry(3, 7);
        const softbox = new THREE.Mesh(softboxGeometry, softboxMaterial);
        softbox.position.set(-4, 3, 5);
        softbox.lookAt(0, 0, 0);
        room.add(softbox);

        const pmrem = new THREE.PMREMGenerator(webgl);

        try {
          environment = pmrem.fromScene(room, 0.035);
          scene.environment = environment.texture;
        } finally {
          room.dispose();
          pmrem.dispose();
        }

        const key = new THREE.DirectionalLight("#fff7ea", 1.1);
        key.position.set(-4, 6, 8);
        scene.add(key);

        const rim = new THREE.DirectionalLight("#e6eee6", 0.7);
        rim.position.set(5, 3, -4);
        scene.add(rim);

        const rig = new THREE.Group();
        scene.add(rig);

        let foundScreen = false;

        model.traverse((object) => {
          if (!(object instanceof THREE.Mesh)) return;

          const list: THREE.Material[] = Array.isArray(object.material)
            ? object.material
            : [object.material];

          const next = list.map((material) => {
            if (
              material.name === "17ProMax_color" &&
              material instanceof THREE.MeshStandardMaterial
            ) {
              material.color.set("#7b887d");
              material.metalness = 1;
              material.roughness = 0.21;
              material.envMapIntensity = 1;
            }

            if (
              material.name === "17ProMax_glass" &&
              material instanceof THREE.MeshPhysicalMaterial
            ) {
              material.color.set("#ffffff");
              material.transmission = 0;
              material.transparent = true;
              material.opacity = 0.025;
              material.depthWrite = false;
              material.roughness = 0.13;
              material.clearcoat = 0.4;
              material.needsUpdate = true;
            }

            if (
              material.name === "17ProMax_2112" ||
              material.name === "17ProMax_Lens2"
            ) {
              return keepMaterial(new THREE.MeshBasicMaterial({
                name: material.name,
                color: "#050608",
                side: THREE.DoubleSide,
                toneMapped: false,
              }));
            }

            if (material.name !== "17ProMax_Screen") return material;

            foundScreen = true;
            if (!screenshot) return material;

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

            geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));

            const image = screenshot.image as {
              width: number;
              height: number;
            };

            const imageAspect = image.width / image.height;
            const screenAspect = width / height;

            if (imageAspect > screenAspect) {
              screenshot.repeat.x = screenAspect / imageAspect;
              screenshot.offset.x = (1 - screenshot.repeat.x) / 2;
            } else {
              screenshot.repeat.y = imageAspect / screenAspect;
              screenshot.offset.y = 1 - screenshot.repeat.y;
            }

            screenshot.anisotropy = Math.min(
              webgl.capabilities.getMaxAnisotropy(),
              8,
            );

            return keepMaterial(new THREE.MeshBasicMaterial({
              name: "17ProMax_Screen",
              map: screenshot,
              toneMapped: false,
              side: THREE.DoubleSide,
            }));
          });

          object.material = Array.isArray(object.material) ? next : next[0];
        });

        if (!foundScreen) throw new Error("Material layar tidak ditemukan.");

        // Corrected front camera.
        const island = makeMesh(
          new THREE.ShapeGeometry(roundedRect(0.0232, 0.00625, 0.003125), 32),
          new THREE.MeshBasicMaterial({
            color: "#050608",
            side: THREE.DoubleSide,
            toneMapped: false,
          }),
        );
        island.position.set(-0.0000973, 0.1546617, -0.00496);
        model.add(island);

        const lens = makeMesh(
          new THREE.CircleGeometry(0.0009, 24),
          new THREE.MeshBasicMaterial({
            color: "#101822",
            side: THREE.DoubleSide,
            toneMapped: false,
          }),
        );
        lens.position.set(-0.0084687, 0.1546617, -0.00498);
        model.add(lens);

        model.rotation.y = Math.PI;
        model.updateMatrixWorld(true);

        const bounds = new THREE.Box3().setFromObject(model);
        const size = bounds.getSize(new THREE.Vector3());

        if (size.y <= 0) throw new Error("Dimensi model tidak valid.");

        model.position.sub(bounds.getCenter(new THREE.Vector3()));

        const phone = new THREE.Group();
        phone.add(model);
        phone.scale.setScalar(5.5 / size.y);
        phone.rotation.set(0.07, -0.38, -0.22);
        phone.position.set(0.1, 0.02, 0);
        rig.add(phone);

        // Glass belt: dielectric material, not metallic flat green.
        const ribbon = new THREE.Group();
        ribbon.position.set(0.03, 0.78, 0);
        rig.add(ribbon);

        const beltMaterial = keepMaterial(new THREE.MeshPhysicalMaterial({
          color: "#c5dacc",
          envMap: orbitEnvironment(),
          metalness: 0,
          roughness: 0.065,
          transmission: 0.95,
          thickness: 0.11,
          ior: 1.46,
          attenuationColor: new THREE.Color("#235138"),
          attenuationDistance: 0.65,
          clearcoat: 1,
          clearcoatRoughness: 0.065,
          envMapIntensity: 1.25,
          side: THREE.DoubleSide,
        }));

        ribbon.add(makeMesh(ribbonGeometry(), beltMaterial));

        const edgeMaterial = keepMaterial(new THREE.MeshStandardMaterial({
          color: "#a8baac",
          metalness: 0.95,
          roughness: 0.16,
          envMapIntensity: 1.2,
        }));

        ribbon.add(makeMesh(ribbonEdge(ORBIT_WIDTH / 2 - 0.015), edgeMaterial));
        ribbon.add(makeMesh(ribbonEdge(-ORBIT_WIDTH / 2 + 0.015), edgeMaterial));

        const glassTileMaterial = keepMaterial(
          new THREE.MeshPhysicalMaterial({
            color: "#faf6e9",
            metalness: 0,
            roughness: 0.16,
            transmission: 0.58,
            thickness: 0.15,
            ior: 1.46,
            clearcoat: 1,
            clearcoatRoughness: 0.07,
            envMapIntensity: 1,
          }),
        );

        const greenMaterial = keepMaterial(new THREE.MeshPhysicalMaterial({
          color: "#123c29",
          metalness: 0.45,
          roughness: 0.18,
          clearcoat: 1,
          clearcoatRoughness: 0.06,
        }));

        function tile(
          kind: IconKind,
          position: [number, number, number],
          angles: [number, number, number],
          round = false,
        ) {
          const group = new THREE.Group();

          const shape = round
            ? new THREE.Shape()
            : roundedRect(1.02, 1.05, 0.12);

          if (round) shape.absarc(0, 0, 0.52, 0, Math.PI * 2, false);

          group.add(makeMesh(
            new THREE.ExtrudeGeometry(shape, {
              depth: 0.12,
              steps: 1,
              curveSegments: 32,
              bevelEnabled: true,
              bevelSize: 0.027,
              bevelThickness: 0.027,
              bevelSegments: 5,
            }),
            round ? greenMaterial : glassTileMaterial,
          ));

          const texture = iconTexture(kind, round);
          textures.add(texture);

          const print = makeMesh(
            new THREE.PlaneGeometry(0.9, 0.9),
            new THREE.MeshBasicMaterial({
              map: texture,
              transparent: true,
              depthWrite: false,
              toneMapped: false,
            }),
          );

          print.position.z = 0.151;
          group.add(print);
          group.position.set(...position);
          group.rotation.set(...angles);
          rig.add(group);

          return group;
        }

        const identity = tile(
          "identity",
          [-1.9, 1.9, 0.45],
          [0.09, 0.28, -0.17],
        );

        const share = tile(
          "share",
          [2.27, 0.92, 0.48],
          [0.04, -0.27, 0.14],
          true,
        );

        const explore = tile(
          "explore",
          [2.04, -1.45, 0.8],
          [0.12, -0.22, 0.25],
        );

        const marble = makeMesh(
          new THREE.SphereGeometry(0.57, 40, 28),
          new THREE.MeshStandardMaterial({
            color: "#e3dfd0",
            roughness: 0.62,
            metalness: 0,
          }),
        );
        marble.position.set(-2.22, -1.64, 0.7);
        rig.add(marble);

        const marbleText = canvasTexture((ctx) => {
          ctx.fillStyle = "#697467";
          ctx.font = "500 35px Arial";
          ctx.textAlign = "center";
          ctx.fillText("YOUR", 256, 192);
          ctx.fillText("PEOPLE", 256, 248);
          ctx.fillText("ANYWHERE", 256, 304);
        });
        textures.add(marbleText);

        const marbleLabel = makeMesh(
          new THREE.PlaneGeometry(0.68, 0.68),
          new THREE.MeshBasicMaterial({
            map: marbleText,
            transparent: true,
            depthWrite: false,
            toneMapped: false,
          }),
        );
        marbleLabel.position.set(-2.22, -1.64, 1.28);
        rig.add(marbleLabel);

        const greenPearl = makeMesh(
          new THREE.SphereGeometry(0.14, 28, 20),
          greenMaterial,
        );
        greenPearl.position.set(-2.35, -0.32, 0.85);
        rig.add(greenPearl);

        const glassPearl = makeMesh(
          new THREE.SphereGeometry(0.19, 28, 20),
          new THREE.MeshPhysicalMaterial({
            color: "#eef2e6",
            transmission: 0.85,
            thickness: 0.4,
            ior: 1.46,
            roughness: 0.025,
            metalness: 0,
            clearcoat: 1,
          }),
        );
        glassPearl.position.set(1.95, 2.45, -0.4);
        rig.add(glassPearl);

        // Shared grounding shadows.
        const shadowMap = shadowTexture();
        textures.add(shadowMap);

        function addShadow(
          width: number,
          height: number,
          x: number,
          y: number,
        ) {
          const shadow = makeMesh(
            new THREE.PlaneGeometry(width, height),
            new THREE.MeshBasicMaterial({
              map: shadowMap,
              transparent: true,
              depthWrite: false,
              toneMapped: false,
            }),
          );
          shadow.position.set(x, y, -2);
          scene.add(shadow);
        }

        addShadow(4.4, 0.58, 0.25, -3.02);
        addShadow(1.5, 0.3, -2.22, -2.4);

        let visible = true;

        function render() {
          if (!disposed && visible && !webgl.getContext().isContextLost()) {
            webgl.render(scene, camera);
          }
        }

        function resize() {
          const width = host!.clientWidth;
          const height = host!.clientHeight;
          if (!width || !height) return;

          webgl.setSize(width, height, false);
          camera.aspect = width / height;

          const tangent = Math.tan(
            THREE.MathUtils.degToRad(camera.fov) / 2,
          );

          camera.position.z = Math.max(
            3.45 / tangent,
            3.5 / (tangent * camera.aspect),
          );

          camera.updateProjectionMatrix();
          render();
        }

        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(host!);

        const cover = host!.closest<HTMLElement>(
          '[data-spall-featured="true"]',
        );

        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
        const target = new THREE.Vector2();
        const current = new THREE.Vector2();

        let frame = 0;
        let previous = 0;

        function applyPose() {
          rig.rotation.x = current.y * 0.025;
          rig.rotation.y = current.x * 0.045;

          phone.rotation.x = 0.07 + current.y * 0.025;
          phone.rotation.y = -0.38 + current.x * 0.07;

          identity.position.y = 1.9 - current.y * 0.035;
          explore.position.y = -1.45 + current.y * 0.035;
          share.rotation.z = 0.14 + current.x * 0.018;
        }

        function tick(time: number) {
          frame = 0;
          if (disposed || !visible || webgl.getContext().isContextLost()) return;

          const delta = previous
            ? Math.min((time - previous) / 1000, 0.05)
            : 1 / 60;

          previous = time;
          current.lerp(target, 1 - Math.exp(-7 * delta));

          if (current.distanceTo(target) < 0.0005) {
            current.copy(target);
            previous = 0;
          } else {
            frame = requestAnimationFrame(tick);
          }

          applyPose();
          render();
        }

        function schedule() {
          if (!frame && visible && !disposed) {
            previous = 0;
            frame = requestAnimationFrame(tick);
          }
        }

        function move(event: PointerEvent) {
          if (!cover || event.pointerType === "touch" || reduced.matches) return;

          const rect = cover.getBoundingClientRect();
          if (!rect.width || !rect.height) return;

          target.set(
            THREE.MathUtils.clamp(
              ((event.clientX - rect.left) / rect.width) * 2 - 1,
              -1, 1,
            ),
            THREE.MathUtils.clamp(
              ((event.clientY - rect.top) / rect.height) * 2 - 1,
              -1, 1,
            ),
          );

          schedule();
        }

        function reset() {
          target.set(0, 0);

          if (reduced.matches) {
            cancelAnimationFrame(frame);
            frame = 0;
            current.set(0, 0);
            applyPose();
            render();
          } else {
            schedule();
          }
        }

        cover?.addEventListener("pointermove", move, { passive: true });
        cover?.addEventListener("pointerleave", reset);
        cover?.addEventListener("pointercancel", reset);
        reduced.addEventListener("change", reset);
        window.addEventListener("blur", reset);

        cleanupMotion = () => {
          cancelAnimationFrame(frame);
          frame = 0;
          cover?.removeEventListener("pointermove", move);
          cover?.removeEventListener("pointerleave", reset);
          cover?.removeEventListener("pointercancel", reset);
          reduced.removeEventListener("change", reset);
          window.removeEventListener("blur", reset);
        };

        visibilityObserver = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;

          if (visible) {
            schedule();
          } else {
            cancelAnimationFrame(frame);
            frame = 0;
            previous = 0;
          }
        });

        visibilityObserver.observe(host!);
        resize();
        render();

        if (!disposed) setReady(true);
      } catch (error) {
        if (!disposed) {
          console.error("[SpallEditorialScene]", error);
          setReady(false);
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
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      {!ready && screenUrl && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: "14% 30%",
            overflow: "hidden",
            border: "5px solid #25362b",
            borderRadius: "12% / 6%",
            background: "#f2eee5",
            transform: "rotate(12deg)",
          }}
        >
          <Image
            src={screenUrl}
            alt=""
            fill
            unoptimized
            sizes="(max-width: 700px) 30vw, 28vw"
            style={{ objectFit: "cover", objectPosition: "top" }}
          />
        </div>
      )}

      <div
        ref={hostRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          opacity: ready ? 1 : 0,
        }}
      />
    </div>
  );
}