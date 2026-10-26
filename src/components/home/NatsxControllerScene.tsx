"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

import sceneModels from "@/data/scene-models.json";

type Props = { onReady: (ready: boolean) => void };

const SCREEN_HINT = /(screen|display|lcd|monitor|panel|retina)/i;
const NON_SCREEN_HINT =
  /(keyboard|keycap|key_|trackpad|touchpad|base|bottom|alum|metal|body|case|shell|logo|apple)/i;

function makeTexture(width: number, height: number, paint: (ctx: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is unavailable.");
  paint(ctx);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = true;
  return texture;
}

function rounded(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function fillText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, color: string, weight = 600) {
  ctx.fillStyle = color;
  ctx.font = weight + " " + size + "px Arial, sans-serif";
  ctx.fillText(text, x, y);
}

function controllerScreen() {
  return makeTexture(600, 1200, (ctx) => {
    const gradient = ctx.createLinearGradient(0, 0, 600, 1200);
    gradient.addColorStop(0, "#272440");
    gradient.addColorStop(0.5, "#141722");
    gradient.addColorStop(1, "#0c101a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 1200);
    fillText(ctx, "ANDROID  /  CONTROLLER", 58, 116, 23, "#c9c3e5", 700);
    ctx.strokeStyle = "rgba(194,187,255,.25)";
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(300, 450, 143, 0, Math.PI * 2); ctx.stroke();
    const joystick = ctx.createRadialGradient(258, 405, 14, 300, 450, 132);
    joystick.addColorStop(0, "#57536b");
    joystick.addColorStop(.5, "#25283c");
    joystick.addColorStop(1, "#0d111e");
    ctx.fillStyle = joystick;
    ctx.beginPath(); ctx.arc(300, 450, 128, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#7366bf"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(300, 450, 81, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "#303344";
    rounded(ctx, 100, 820, 208, 70, 15); ctx.fill();
    rounded(ctx, 170, 751, 70, 208, 15); ctx.fill();
    const positions: Array<[number, number]> = [
      [435, 766], [508, 836], [435, 906], [362, 836],
    ];
    positions.forEach(([x, y], i) => {
      ctx.fillStyle = ["#7771b3", "#595881", "#4f6289", "#737290"][i];
      ctx.beginPath(); ctx.arc(x, y, 37, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(229,229,255,.22)";
      ctx.lineWidth = 2; ctx.stroke();
    });
    fillText(ctx, "KOTLIN", 58, 1100, 24, "#aaa9c3", 700);
    fillText(ctx, "USB  /  WI-FI  /  BT", 307, 1100, 17, "#827e9b");
  });
}

function receiverScreen() {
  return makeTexture(1200, 760, (ctx) => {
    const gradient = ctx.createLinearGradient(0, 0, 1200, 760);
    gradient.addColorStop(0, "#13233a");
    gradient.addColorStop(.55, "#151622");
    gradient.addColorStop(1, "#101b26");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 760);
    ctx.fillStyle = "rgba(25,26,38,.88)";
    rounded(ctx, 70, 66, 1060, 630, 32); ctx.fill();
    ctx.strokeStyle = "rgba(117,137,197,.36)";
    ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = "#75dea4";
    ctx.beginPath(); ctx.arc(120, 121, 9, 0, Math.PI * 2); ctx.fill();
    fillText(ctx, "WINDOWS RECEIVER", 153, 132, 29, "#ececf9", 700);
    fillText(ctx, "C# / .NET", 945, 132, 24, "#8587a1");
    ctx.strokeStyle = "rgba(255,255,255,.12)";
    ctx.beginPath(); ctx.moveTo(96, 167); ctx.lineTo(1106, 167); ctx.stroke();
    const metrics: Array<[string, string]> = [
      ["TRANSPORT", "USB DIRECT"], ["LATENCY", "HEALTHY"], ["SESSION", "TRUSTED"],
    ];
    metrics.forEach(([key, value], index) => {
      const y = 273 + index * 120;
      fillText(ctx, key, 128, y, 25, "#9295a8");
      fillText(ctx, value, 856, y, 26, index === 1 ? "#80e4ac" : "#f3f2f9", 700);
      ctx.strokeStyle = "rgba(255,255,255,.1)";
      ctx.beginPath(); ctx.moveTo(120, y + 35); ctx.lineTo(1080, y + 35); ctx.stroke();
    });
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = ["#8c68de", "#8c73f3", "#777eea", "#6589e1", "#74d99f"][i];
      ctx.fillRect(886 + i * 36, 628 - 25 * i, 24, 40 + 25 * i);
    }
  });
}

function normalize(model: THREE.Object3D, largestTarget: number) {
  model.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(model);
  const dimensions = bounds.getSize(new THREE.Vector3());
  const longest = Math.max(dimensions.x, dimensions.y, dimensions.z);
  if (longest <= 0 || !Number.isFinite(longest)) throw new Error("Invalid GLB bounds");
  model.position.sub(bounds.getCenter(new THREE.Vector3()));
  const pivot = new THREE.Group();
  pivot.add(model);
  pivot.scale.setScalar(largestTarget / longest);
  return pivot;
}

function putPhoneScreen(model: THREE.Object3D, texture: THREE.Texture) {
  let matched = false;
  model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const source = Array.isArray(object.material) ? object.material : [object.material];
    const mapped = source.map((material: THREE.Material) => {
      if (material.name === "17ProMax_glass" && material instanceof THREE.MeshPhysicalMaterial) {
        material.transmission = 0;
        material.transparent = true;
        material.opacity = .025;
        material.depthWrite = false;
        material.needsUpdate = true;
      }
      if (material.name !== "17ProMax_Screen") return material;
      matched = true;
      const geometry = object.geometry as THREE.BufferGeometry;
      geometry.computeBoundingBox();
      const bounds = geometry.boundingBox;
      const position = geometry.getAttribute("position");
      if (bounds && position) {
        const width = Math.max(bounds.max.x - bounds.min.x, 1e-6);
        const height = Math.max(bounds.max.y - bounds.min.y, 1e-6);
        const uv = new Float32Array(position.count * 2);
        for (let i = 0; i < position.count; i++) {
          uv[2 * i] = 1 - (position.getX(i) - bounds.min.x) / width;
          uv[2 * i + 1] = (position.getY(i) - bounds.min.y) / height;
        }
        geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
      }
      return new THREE.MeshBasicMaterial({
        name: "17ProMax_Screen",
        map: texture,
        side: THREE.DoubleSide,
        toneMapped: false,
      });
    });
    object.material = Array.isArray(object.material) ? mapped : mapped[0];
  });
  if (!matched) throw new Error("iPhone GLB screen material not found");
}

function putMacbookScreen(model: THREE.Object3D, texture: THREE.Texture) {
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const height = Math.max(box.max.y - box.min.y, 1e-6);
  let best: { mesh: THREE.Mesh; index: number; score: number } | null = null;
  model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const geometry = object.geometry as THREE.BufferGeometry;
    geometry.computeBoundingBox();
    const bounds = geometry.boundingBox;
    if (!bounds) return;
    const dimensions = bounds.getSize(new THREE.Vector3());
    const values = [Math.abs(dimensions.x), Math.abs(dimensions.y), Math.abs(dimensions.z)].sort((a, b) => b - a);
    const aspect = values[0] / Math.max(values[1], 1e-6);
    const thinness = values[2] / Math.max(values[0], 1e-6);
    const y = (bounds.getCenter(new THREE.Vector3()).applyMatrix4(object.matrixWorld).y - box.min.y) / height;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material: THREE.Material, index: number) => {
      const standard = material as THREE.MeshStandardMaterial;
      const map = standard.map ?? standard.emissiveMap ?? null;
      const image = map?.image as { width?: number; height?: number } | undefined;
      const textureAspect = image?.width && image?.height ? image.width / image.height : 0;
      const name = object.name + " " + material.name;
      let score = 0;
      if (SCREEN_HINT.test(name)) score += 230;
      if (textureAspect >= 1.3 && textureAspect <= 2.3) score += 125;
      if ((image?.width ?? 0) >= 800 || (image?.height ?? 0) >= 500) score += 75;
      if (standard.emissiveMap) score += 95;
      if (standard.map) score += 35;
      if (thinness < .07) score += 48;
      if (aspect >= 1.25 && aspect <= 2.3) score += 45;
      if (y > .5) score += 65;
      if (NON_SCREEN_HINT.test(name)) score -= 210;
      if (!best || score > best.score) best = { mesh: object, index, score };
    });
  });
  const candidate = best as { mesh: THREE.Mesh; index: number; score: number } | null;
  if (!candidate || candidate.score <= 0) throw new Error("MacBook GLB screen material not found");
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    color: "#ffffff",
    side: THREE.DoubleSide,
    toneMapped: false,
  });
  const list = candidate.mesh.material;
  if (Array.isArray(list)) {
    const changed = [...list];
    changed[candidate.index] = material;
    candidate.mesh.material = changed;
  } else {
    candidate.mesh.material = material;
  }
}

function addPodium(group: THREE.Group, x: number, y: number, radius: number, color: string) {
  const platform = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius * 1.06, .17, 64),
    new THREE.MeshStandardMaterial({
      color: "#181924",
      metalness: .55,
      roughness: .28,
      emissive: new THREE.Color(color),
      emissiveIntensity: .05,
    }),
  );
  platform.position.set(x, y, -.35);
  group.add(platform);
  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(radius * .96, .026, 8, 64),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .78 }),
  );
  halo.rotation.x = Math.PI / 2;
  halo.position.set(x, y + .095, -.35);
  group.add(halo);
}

function disposeObject(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    geometries.add(obj.geometry);
    const items: THREE.Material[] = Array.isArray(obj.material) ? obj.material : [obj.material];
    items.forEach((material) => {
      materials.add(material);
      const fields = material as unknown as Record<string, unknown>;
      Object.values(fields).forEach((value) => {
        if (value instanceof THREE.Texture) textures.add(value);
      });
    });
  });
  geometries.forEach((g) => g.dispose());
  materials.forEach((m) => m.dispose());
  textures.forEach((t) => t.dispose());
}

export default function NatsxControllerScene({ onReady }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const artwork = host.closest("[data-controller-artwork]");
    let disposed = false;
    let renderer: THREE.WebGLRenderer | null = null;
    let environment: THREE.WebGLRenderTarget | null = null;
    let composition: THREE.Group | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let visibilityObserver: IntersectionObserver | null = null;
    let frame = 0;
    let visible = true;
    let phoneRig: THREE.Group | null = null;
    let laptopRig: THREE.Group | null = null;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const camera = new THREE.OrthographicCamera(-7, 7, 5, -5, .1, 100);
    camera.position.set(0, 1.05, 18);
    camera.lookAt(0, 0, 0);

    const scene = new THREE.Scene();
    const paint = () => {
      if (renderer && visible && !disposed) renderer.render(scene, camera);
    };
    const resize = () => {
      if (!renderer || !visible || disposed) return;
      const width = Math.max(host.clientWidth, 1);
      const height = Math.max(host.clientHeight, 1);
      const aspect = width / height;
      const halfWidth = Math.max(6.35, aspect * 4.1);
      camera.left = -halfWidth;
      camera.right = halfWidth;
      camera.top = halfWidth / aspect;
      camera.bottom = -halfWidth / aspect;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      paint();
    };
    const animate = () => {
      frame = 0;
      if (!visible || !renderer || disposed) return;
      currentX += (targetX - currentX) * .12;
      currentY += (targetY - currentY) * .12;
      if (phoneRig) {
        phoneRig.rotation.y = -.37 + currentX * .07;
        phoneRig.rotation.x = .045 - currentY * .035;
      }
      if (laptopRig) {
        laptopRig.rotation.y = -.44 + currentX * .055;
        laptopRig.rotation.x = -.015 - currentY * .025;
      }
      paint();
      if (Math.abs(currentX - targetX) > .001 || Math.abs(currentY - targetY) > .001) {
        frame = window.requestAnimationFrame(animate);
      }
    };
    const schedule = () => {
      if (!frame && !disposed && visible) frame = window.requestAnimationFrame(animate);
    };
    const move = (event: PointerEvent) => {
      if (!pointer.matches || reduced.matches || event.pointerType === "touch") return;
      const rect = artwork?.getBoundingClientRect();
      if (!rect?.width || !rect.height) return;
      targetX = THREE.MathUtils.clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
      targetY = THREE.MathUtils.clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
      schedule();
    };
    const reset = () => { targetX = 0; targetY = 0; schedule(); };
    const onVisibility = () => {
      visible = !document.hidden && (!visibilityObserver || visible);
      if (visible) resize();
    };

    artwork?.addEventListener("pointermove", move, { passive: true });
    artwork?.addEventListener("pointerleave", reset);
    reduced.addEventListener("change", reset);
    window.addEventListener("blur", reset);

    async function initialize() {
      let phoneModel: THREE.Object3D | undefined;
      let laptopModel: THREE.Object3D | undefined;
      let phoneTexture: THREE.Texture | undefined;
      let laptopTexture: THREE.Texture | undefined;
      try {
        const loader = new GLTFLoader();
        const [phoneGltf, macbookGltf] = await Promise.all([
          loader.loadAsync(sceneModels.spall.phone.runtime),
          loader.loadAsync(sceneModels.bast.macbook.runtime),
        ]);
        phoneModel = phoneGltf.scene;
        laptopModel = macbookGltf.scene;
        if (disposed) return;

        phoneTexture = controllerScreen();
        laptopTexture = receiverScreen();
        putPhoneScreen(phoneModel, phoneTexture);
        putMacbookScreen(laptopModel, laptopTexture);

        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: "low-power",
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setClearColor("#101116", 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.3;
        renderer.domElement.style.cssText = "display:block;width:100%;height:100%;pointer-events:none;";
        host.appendChild(renderer.domElement);

        const pmrem = new THREE.PMREMGenerator(renderer);
        const room = new RoomEnvironment();
        try {
          environment = pmrem.fromScene(room, .035);
          scene.environment = environment.texture;
        } finally {
          pmrem.dispose();
          room.dispose();
        }
        scene.add(new THREE.HemisphereLight("#a6c4ff", "#21142c", 2.1));
        const key = new THREE.DirectionalLight("#d0dcff", 2.8);
        key.position.set(-3, 6, 8);
        scene.add(key);
        const rim = new THREE.DirectionalLight("#8c79ff", 2.3);
        rim.position.set(-6, 1, -3);
        scene.add(rim);
        const right = new THREE.DirectionalLight("#7ce2af", 1.8);
        right.position.set(7, 2, 3);
        scene.add(right);

        composition = new THREE.Group();
        scene.add(composition);

        // Reuse exactly the iPhone orientation verified in Spall's scene.
        phoneModel.rotation.y = Math.PI;
        const normalizedPhone = normalize(phoneModel, 5.7);
        phoneRig = new THREE.Group();
        phoneRig.rotation.set(.045, -.37, -.095);
        phoneRig.position.set(-3.8, -.05, .15);
        phoneRig.add(normalizedPhone);
        composition.add(phoneRig);

        // Reuse the MacBook screen geometry and pose from the BAST scene.
        const normalizedLaptop = normalize(laptopModel, 5.85);
        laptopRig = new THREE.Group();
        laptopRig.rotation.set(-.015, -.44, -.07);
        laptopRig.position.set(3.2, -.35, -.25);
        laptopRig.add(normalizedLaptop);
        composition.add(laptopRig);

        addPodium(composition, -3.8, -3.22, 1.3, "#8971ff");
        addPodium(composition, 3.2, -2.8, 2.15, "#69caab");

        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(host);
        if (typeof IntersectionObserver !== "undefined") {
          visibilityObserver = new IntersectionObserver(([entry]) => {
            visible = Boolean(entry?.isIntersecting) && !document.hidden;
            if (visible) {
              resize();
              schedule();
            } else {
              if (frame) window.cancelAnimationFrame(frame);
              frame = 0;
              renderer?.setSize(1, 1, false);
            }
          }, { threshold: 0 });
          visibilityObserver.observe(host);
        }
        document.addEventListener("visibilitychange", onVisibility);
        resize();
        onReady(true);
      } catch (error) {
        if (!disposed) {
          console.error("[NatsxControllerScene]", error);
          onReady(false);
        }
      } finally {
        if (disposed) {
          phoneTexture?.dispose();
          laptopTexture?.dispose();
          phoneModel && disposeObject(phoneModel);
          laptopModel && disposeObject(laptopModel);
        }
      }
    }

    void initialize();

    return () => {
      disposed = true;
      if (frame) window.cancelAnimationFrame(frame);
      artwork?.removeEventListener("pointermove", move);
      artwork?.removeEventListener("pointerleave", reset);
      reduced.removeEventListener("change", reset);
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", onVisibility);
      resizeObserver?.disconnect();
      visibilityObserver?.disconnect();
      if (composition) disposeObject(composition);
      environment?.dispose();
      renderer?.dispose();
      renderer?.domElement.remove();
      onReady(false);
    };
  }, [onReady]);

  return <div ref={hostRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />;
}
