"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

type Props = {
  screenUrl: string | null;
  label: string;
};

type ShortcutKind = "identity" | "spill" | "resource" | "social";

type FloatSpec = {
  object: THREE.Object3D;
  baseY: number;
  baseZ: number;
  baseRotZ: number;
  amplitudeY: number;
  amplitudeZ: number;
  amplitudeRotZ: number;
  speed: number;
  phase: number;
};

const MODEL_URL = "/models/iphone-17-pro-max.glb";
const SCREEN_MATERIAL = "17ProMax_Screen";

const GREEN = "#234233";
const DEEP_GREEN = "#153f2b";
const IVORY = "#f4efe6";

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

function createCanvasTexture(
  size: number,
  draw: (
    context: CanvasRenderingContext2D,
    size: number,
  ) => void,
) {
  const canvas = document.createElement("canvas");

  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas 2D context unavailable.");
  }

  context.clearRect(0, 0, size, size);

  draw(context, size);

  const texture = new THREE.CanvasTexture(canvas);

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  return texture;
}

function drawSpacedText(
  context: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  y: number,
  spacing: number,
) {
  const chars = [...text];

  const widths = chars.map(
    (char) => context.measureText(char).width,
  );

  const total =
    widths.reduce((sum, width) => sum + width, 0) +
    spacing * Math.max(chars.length - 1, 0);

  let x = centerX - total / 2;

  chars.forEach((char, index) => {
    context.fillText(char, x, y);

    x += widths[index] + spacing;
  });
}

function drawIdentityIcon(
  context: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  color: string,
) {
  context.save();

  context.strokeStyle = color;
  context.lineWidth = 7 * scale;
  context.lineCap = "round";

  context.beginPath();

  context.arc(
    cx,
    cy - 27 * scale,
    17 * scale,
    0,
    Math.PI * 2,
  );

  context.stroke();

  context.beginPath();

  context.moveTo(
    cx - 37 * scale,
    cy + 37 * scale,
  );

  context.quadraticCurveTo(
    cx,
    cy + 4 * scale,
    cx + 37 * scale,
    cy + 37 * scale,
  );

  context.stroke();

  context.restore();
}

function drawStackIcon(
  context: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  color: string,
) {
  context.save();

  context.strokeStyle = color;
  context.lineWidth = 7 * scale;
  context.lineJoin = "round";

  for (let index = 0; index < 3; index += 1) {
    const offset = index * 13 * scale;

    context.strokeRect(
      cx - 36 * scale + offset,
      cy - 22 * scale - offset,
      54 * scale,
      42 * scale,
    );
  }

  context.restore();
}

function drawFolderIcon(
  context: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  color: string,
) {
  context.save();

  context.strokeStyle = color;
  context.lineWidth = 7 * scale;
  context.lineJoin = "round";

  context.beginPath();

  context.moveTo(
    cx - 40 * scale,
    cy - 17 * scale,
  );

  context.lineTo(
    cx - 12 * scale,
    cy - 17 * scale,
  );

  context.lineTo(
    cx,
    cy - 31 * scale,
  );

  context.lineTo(
    cx + 40 * scale,
    cy - 31 * scale,
  );

  context.lineTo(
    cx + 40 * scale,
    cy + 31 * scale,
  );

  context.lineTo(
    cx - 40 * scale,
    cy + 31 * scale,
  );

  context.closePath();
  context.stroke();

  context.restore();
}

function drawPeopleIcon(
  context: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  color: string,
) {
  context.save();

  context.strokeStyle = color;
  context.lineWidth = 6 * scale;
  context.lineCap = "round";

  context.beginPath();

  context.arc(
    cx - 18 * scale,
    cy - 23 * scale,
    12 * scale,
    0,
    Math.PI * 2,
  );

  context.arc(
    cx + 18 * scale,
    cy - 23 * scale,
    12 * scale,
    0,
    Math.PI * 2,
  );

  context.stroke();

  context.beginPath();

  context.moveTo(
    cx - 44 * scale,
    cy + 31 * scale,
  );

  context.quadraticCurveTo(
    cx - 20 * scale,
    cy + 2 * scale,
    cx,
    cy + 28 * scale,
  );

  context.quadraticCurveTo(
    cx + 20 * scale,
    cy + 2 * scale,
    cx + 44 * scale,
    cy + 31 * scale,
  );

  context.stroke();

  context.restore();
}

function drawLinkIcon(
  context: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  color: string,
) {
  context.save();

  context.translate(cx, cy);

  context.rotate(-0.7);

  context.strokeStyle = color;
  context.lineWidth = 8 * scale;
  context.lineCap = "round";

  context.beginPath();

  context.ellipse(
    -22 * scale,
    0,
    31 * scale,
    16 * scale,
    0,
    0,
    Math.PI * 2,
  );

  context.stroke();

  context.beginPath();

  context.ellipse(
    22 * scale,
    0,
    31 * scale,
    16 * scale,
    0,
    0,
    Math.PI * 2,
  );

  context.stroke();

  context.restore();
}

function createTileTexture(
  kind: "identity" | "explore",
  label: string,
) {
  return createCanvasTexture(
    512,
    (context, size) => {
      const color = "#24513a";

      if (kind === "identity") {
        drawIdentityIcon(
          context,
          size / 2,
          size * 0.39,
          1,
          color,
        );
      } else {
        drawStackIcon(
          context,
          size / 2,
          size * 0.39,
          1,
          color,
        );
      }

      context.fillStyle = color;
      context.font = "600 31px Arial";
      context.textBaseline = "middle";

      drawSpacedText(
        context,
        label,
        size / 2,
        size * 0.78,
        8,
      );
    },
  );
}

function createShareTexture() {
  return createCanvasTexture(
    512,
    (context, size) => {
      const color =
        "rgba(255,255,255,.95)";

      drawLinkIcon(
        context,
        size / 2,
        size * 0.39,
        1,
        color,
      );

      context.fillStyle = color;
      context.font = "600 31px Arial";
      context.textBaseline = "middle";

      drawSpacedText(
        context,
        "SHARE",
        size / 2,
        size * 0.71,
        10,
      );
    },
  );
}

function createMarbleTexture() {
  return createCanvasTexture(
    512,
    (context, size) => {
      context.fillStyle =
        "rgba(43,63,50,.62)";

      context.font =
        "600 27px Arial";

      context.textBaseline =
        "middle";

      drawSpacedText(
        context,
        "YOUR",
        size / 2,
        size * 0.39,
        7,
      );

      drawSpacedText(
        context,
        "PEOPLE",
        size / 2,
        size * 0.5,
        7,
      );

      drawSpacedText(
        context,
        "ANYWHERE",
        size / 2,
        size * 0.61,
        7,
      );
    },
  );
}

function createShortcutTexture(
  kind: ShortcutKind,
  label: string,
) {
  return createCanvasTexture(
    256,
    (context, size) => {
      const color = "#24513a";

      if (kind === "identity") {
        drawIdentityIcon(
          context,
          size / 2,
          size * 0.37,
          0.55,
          color,
        );
      } else if (kind === "spill") {
        drawStackIcon(
          context,
          size / 2,
          size * 0.37,
          0.56,
          color,
        );
      } else if (kind === "resource") {
        drawFolderIcon(
          context,
          size / 2,
          size * 0.37,
          0.54,
          color,
        );
      } else {
        drawPeopleIcon(
          context,
          size / 2,
          size * 0.37,
          0.5,
          color,
        );
      }

      context.fillStyle = color;
      context.font =
        "500 23px Arial";

      context.textAlign =
        "center";

      context.textBaseline =
        "middle";

      context.fillText(
        label,
        size / 2,
        size * 0.76,
      );
    },
  );
}

function createShadowTexture() {
  return createCanvasTexture(
    512,
    (context, size) => {
      const gradient =
        context.createRadialGradient(
          size / 2,
          size / 2,
          0,
          size / 2,
          size / 2,
          size / 2,
        );

      gradient.addColorStop(
        0,
        "rgba(19,35,26,.24)",
      );

      gradient.addColorStop(
        0.42,
        "rgba(19,35,26,.11)",
      );

      gradient.addColorStop(
        1,
        "rgba(19,35,26,0)",
      );

      context.fillStyle =
        gradient;

      context.fillRect(
        0,
        0,
        size,
        size,
      );
    },
  );
}

function sideFrame(
  tangent: THREE.Vector3,
  fallback: THREE.Vector3,
) {
  const worldZ =
    new THREE.Vector3(
      0,
      0,
      1,
    );

  const side =
    new THREE.Vector3()
      .crossVectors(
        worldZ,
        tangent,
      );

  if (
    side.lengthSq() <
    0.000001
  ) {
    side.copy(
      fallback,
    );
  } else {
    side.normalize();

    if (
      side.dot(
        fallback,
      ) < 0
    ) {
      side.negate();
    }
  }

  const front =
    new THREE.Vector3()
      .crossVectors(
        tangent,
        side,
      )
      .normalize();

  if (
    front.z <
    0
  ) {
    front.negate();
  }

  return {
    side,
    front,
  };
}

/*
 * Rounded emerald ribbon.
 *
 * Lebar di XY.
 * Tipis ke arah kamera.
 *
 * Hasilnya harus terasa kayak glass ribbon
 * dengan sudut rounded, bukan papan dan
 * bukan hose/cable.
 */
function createEllipticRibbonGeometry(
  curve:
    THREE.Curve<THREE.Vector3>,
  tubularSegments:
    number,
  radialSegments:
    number,
  halfWidth:
    number,
  halfThickness:
    number,
) {
  const positions:
    number[] =
    [];

  const uvs:
    number[] =
    [];

  const indices:
    number[] =
    [];

  const fallbackSide =
    new THREE.Vector3(
      1,
      0,
      0,
    );

  for (
    let i = 0;
    i <= tubularSegments;
    i += 1
  ) {
    const t =
      i /
      tubularSegments;

    const point =
      curve.getPointAt(
        t,
      );

    const tangent =
      curve
        .getTangentAt(
          t,
        )
        .normalize();

    const {
      side,
      front,
    } =
      sideFrame(
        tangent,
        fallbackSide,
      );

    fallbackSide.copy(
      side,
    );

    for (
      let j = 0;
      j < radialSegments;
      j += 1
    ) {
      const theta =
        (
          j /
          radialSegments
        ) *
        Math.PI *
        2;

      const vertex =
        point
          .clone()
          .addScaledVector(
            side,
            Math.cos(
              theta,
            ) *
              halfWidth,
          )
          .addScaledVector(
            front,
            Math.sin(
              theta,
            ) *
              halfThickness,
          );

      positions.push(
        vertex.x,
        vertex.y,
        vertex.z,
      );

      uvs.push(
        t,
        j /
          radialSegments,
      );
    }
  }

  for (
    let i = 0;
    i < tubularSegments;
    i += 1
  ) {
    for (
      let j = 0;
      j < radialSegments;
      j += 1
    ) {
      const nextJ =
        (
          j +
          1
        ) %
        radialSegments;

      const a =
        i *
          radialSegments +
        j;

      const b =
        (
          i +
          1
        ) *
          radialSegments +
        j;

      const c =
        (
          i +
          1
        ) *
          radialSegments +
        nextJ;

      const d =
        i *
          radialSegments +
        nextJ;

      indices.push(
        a,
        b,
        d,
        b,
        c,
        d,
      );
    }
  }

  const geometry =
    new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      positions,
      3,
    ),
  );

  geometry.setAttribute(
    "uv",
    new THREE.Float32BufferAttribute(
      uvs,
      2,
    ),
  );

  geometry.setIndex(
    indices,
  );

  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();

  return geometry;
}

function createOffsetCurve(
  curve:
    THREE.Curve<THREE.Vector3>,
  offset:
    number,
  samples =
    72,
) {
  const points:
    THREE.Vector3[] =
    [];

  const fallbackSide =
    new THREE.Vector3(
      1,
      0,
      0,
    );

  for (
    let i = 0;
    i <= samples;
    i += 1
  ) {
    const t =
      i /
      samples;

    const point =
      curve.getPointAt(
        t,
      );

    const tangent =
      curve
        .getTangentAt(
          t,
        )
        .normalize();

    const {
      side,
    } =
      sideFrame(
        tangent,
        fallbackSide,
      );

    fallbackSide.copy(
      side,
    );

    points.push(
      point
        .clone()
        .addScaledVector(
          side,
          offset,
        ),
    );
  }

  return new THREE.CatmullRomCurve3(
    points,
    false,
    "catmullrom",
    0.45,
  );
}

export default function SpallPhone3D(
  props:
    Props,
) {
  return (
    <PhoneScene
      key={
        props.screenUrl ??
        "original"
      }
      {...props}
    />
  );
}

function PhoneScene({
  screenUrl,
  label,
}: Props) {
  const hostRef =
    useRef<HTMLDivElement>(
      null,
    );

  const [
    ready,
    setReady,
  ] =
    useState(
      false,
    );

  const [
    failed,
    setFailed,
  ] =
    useState(
      false,
    );

  useEffect(
    () => {
      const maybeHost =
        hostRef.current;

      if (
        !maybeHost
      ) {
        return;
      }

      const host =
        maybeHost;

      let disposed =
        false;

      let renderer:
        | THREE.WebGLRenderer
        | undefined;

      let environment:
        | THREE.WebGLRenderTarget
        | undefined;

      let resizeObserver:
        | ResizeObserver
        | undefined;

      let intersectionObserver:
        | IntersectionObserver
        | undefined;

      let animationFrame =
        0;

      let visible =
        true;

      let sceneCleanup =
        () => {};

      const geometries =
        new Set<THREE.BufferGeometry>();

      const materials =
        new Set<THREE.Material>();

      const textures =
        new Set<THREE.Texture>();

      function trackGeometry<
        T extends THREE.BufferGeometry,
      >(
        geometry:
          T,
      ) {
        geometries.add(
          geometry,
        );

        return geometry;
      }

      function trackMaterial<
        T extends THREE.Material,
      >(
        material:
          T,
      ) {
        materials.add(
          material,
        );

        for (
          const value
          of Object.values(
            material,
          )
        ) {
          if (
            value
            instanceof
            THREE.Texture
          ) {
            textures.add(
              value,
            );
          }
        }

        return material;
      }

      function trackTexture<
        T extends THREE.Texture,
      >(
        texture:
          T,
      ) {
        textures.add(
          texture,
        );

        return texture;
      }

      function trackModel(
        model:
          THREE.Object3D,
      ) {
        model.traverse(
          (
            object,
          ) => {
            if (
              !(
                object
                instanceof
                THREE.Mesh
              )
            ) {
              return;
            }

            trackGeometry(
              object.geometry,
            );

            const surfaces =
              Array.isArray(
                object.material,
              )
                ? object.material
                : [
                    object.material,
                  ];

            surfaces.forEach(
              (
                surface,
              ) =>
                trackMaterial(
                  surface,
                ),
            );
          },
        );
      }

      function disposeAssets() {
        textures.forEach(
          (
            texture,
          ) =>
            texture.dispose(),
        );

        materials.forEach(
          (
            material,
          ) =>
            material.dispose(),
        );

        geometries.forEach(
          (
            geometry,
          ) =>
            geometry.dispose(),
        );

        textures.clear();
        materials.clear();
        geometries.clear();
      }

      function onContextLost(
        event:
          Event,
      ) {
        event.preventDefault();

        if (
          disposed
        ) {
          return;
        }

        cancelAnimationFrame(
          animationFrame,
        );

        animationFrame =
          0;

        setReady(
          false,
        );

        setFailed(
          true,
        );
      }

      function release() {
        sceneCleanup();

        sceneCleanup =
          () => {};

        cancelAnimationFrame(
          animationFrame,
        );

        animationFrame =
          0;

        intersectionObserver?.disconnect();
        resizeObserver?.disconnect();
        environment?.dispose();

        disposeAssets();

        if (
          renderer
        ) {
          renderer.domElement.removeEventListener(
            "webglcontextlost",
            onContextLost,
          );

          renderer.dispose();

          renderer.domElement.remove();

          renderer =
            undefined;
        }
      }

      function fixDynamicIsland(
        model:
          THREE.Object3D,
      ) {
        const islandMaterial =
          trackMaterial(
            new THREE.MeshBasicMaterial(
              {
                color:
                  "#050608",

                side:
                  THREE.DoubleSide,

                toneMapped:
                  false,
              },
            ),
          );

        const islandGeometry =
          trackGeometry(
            new THREE.ShapeGeometry(
              pillShape(
                0.0232,
                0.00625,
              ),
              40,
            ),
          );

        const island =
          new THREE.Mesh(
            islandGeometry,
            islandMaterial,
          );

        island.name =
          "Spall_DynamicIsland";

        island.position.set(
          -0.0000973,
          0.1546617,
          -0.00496,
        );

        model.add(
          island,
        );

        const lensMaterial =
          trackMaterial(
            new THREE.MeshBasicMaterial(
              {
                color:
                  "#101822",

                side:
                  THREE.DoubleSide,

                toneMapped:
                  false,
              },
            ),
          );

        const lensGeometry =
          trackGeometry(
            new THREE.CircleGeometry(
              0.0009,
              40,
            ),
          );

        const lens =
          new THREE.Mesh(
            lensGeometry,
            lensMaterial,
          );

        lens.position.set(
          -0.0084687,
          0.1546617,
          -0.00498,
        );

        model.add(
          lens,
        );
      }

      function createGlassTile(
        kind:
          | "identity"
          | "explore",
        text:
          string,
      ) {
        const group =
          new THREE.Group();

        const body =
          new THREE.Mesh(
            trackGeometry(
              new RoundedBoxGeometry(
                1.34,
                1.34,
                0.13,
                7,
                0.18,
              ),
            ),
            trackMaterial(
              new THREE.MeshPhysicalMaterial(
                {
                  color:
                    "#f6f1e8",

                  roughness:
                    0.16,

                  metalness:
                    0,

                  clearcoat:
                    1,

                  clearcoatRoughness:
                    0.055,

                  transparent:
                    true,

                  opacity:
                    0.96,

                  envMapIntensity:
                    1.45,
                },
              ),
            ),
          );

        group.add(
          body,
        );

        const texture =
          trackTexture(
            createTileTexture(
              kind,
              text,
            ),
          );

        const face =
          new THREE.Mesh(
            trackGeometry(
              new THREE.PlaneGeometry(
                1.12,
                1.12,
              ),
            ),
            trackMaterial(
              new THREE.MeshBasicMaterial(
                {
                  map:
                    texture,

                  transparent:
                    true,

                  depthWrite:
                    false,

                  toneMapped:
                    false,
                },
              ),
            ),
          );

        face.position.z =
          0.069;

        group.add(
          face,
        );

        return group;
      }

      function createShareCoin() {
        const group =
          new THREE.Group();

        const body =
          new THREE.Mesh(
            trackGeometry(
              new THREE.CylinderGeometry(
                0.64,
                0.64,
                0.17,
                64,
              ),
            ),
            trackMaterial(
              new THREE.MeshPhysicalMaterial(
                {
                  color:
                    DEEP_GREEN,

                  roughness:
                    0.12,

                  clearcoat:
                    1,

                  clearcoatRoughness:
                    0.04,

                  envMapIntensity:
                    1.75,
                },
              ),
            ),
          );

        body.rotation.x =
          Math.PI /
          2;

        group.add(
          body,
        );

        const texture =
          trackTexture(
            createShareTexture(),
          );

        const face =
          new THREE.Mesh(
            trackGeometry(
              new THREE.CircleGeometry(
                0.56,
                64,
              ),
            ),
            trackMaterial(
              new THREE.MeshBasicMaterial(
                {
                  map:
                    texture,

                  transparent:
                    true,

                  depthWrite:
                    false,

                  toneMapped:
                    false,
                },
              ),
            ),
          );

        face.position.z =
          0.09;

        group.add(
          face,
        );

        return group;
      }

      function createMarble() {
        const group =
          new THREE.Group();

        const sphere =
          new THREE.Mesh(
            trackGeometry(
              new THREE.SphereGeometry(
                0.66,
                64,
                64,
              ),
            ),
            trackMaterial(
              new THREE.MeshPhysicalMaterial(
                {
                  color:
                    "#e9e3d8",

                  roughness:
                    0.56,

                  clearcoat:
                    0.22,

                  clearcoatRoughness:
                    0.4,

                  envMapIntensity:
                    0.72,
                },
              ),
            ),
          );

        group.add(
          sphere,
        );

        const labelTexture =
          trackTexture(
            createMarbleTexture(),
          );

        const labelMaterial =
          trackMaterial(
            new THREE.SpriteMaterial(
              {
                map:
                  labelTexture,

                transparent:
                  true,

                depthWrite:
                  false,

                toneMapped:
                  false,
              },
            ),
          );

        const labelSprite =
          new THREE.Sprite(
            labelMaterial,
          );

        labelSprite.position.set(
          0,
          0,
          0.72,
        );

        labelSprite.scale.set(
          1.05,
          1.05,
          1,
        );

        group.add(
          labelSprite,
        );

        return group;
      }

      function createShortcut(
        kind:
          ShortcutKind,
        text:
          string,
      ) {
        const group =
          new THREE.Group();

        const body =
          new THREE.Mesh(
            trackGeometry(
              new RoundedBoxGeometry(
                0.82,
                0.72,
                0.09,
                6,
                0.13,
              ),
            ),
            trackMaterial(
              new THREE.MeshPhysicalMaterial(
                {
                  color:
                    "#f8f4eb",

                  roughness:
                    0.17,

                  clearcoat:
                    1,

                  clearcoatRoughness:
                    0.055,

                  transparent:
                    true,

                  opacity:
                    0.98,

                  envMapIntensity:
                    1.35,
                },
              ),
            ),
          );

        group.add(
          body,
        );

        const texture =
          trackTexture(
            createShortcutTexture(
              kind,
              text,
            ),
          );

        const face =
          new THREE.Mesh(
            trackGeometry(
              new THREE.PlaneGeometry(
                0.69,
                0.61,
              ),
            ),
            trackMaterial(
              new THREE.MeshBasicMaterial(
                {
                  map:
                    texture,

                  transparent:
                    true,

                  depthWrite:
                    false,

                  toneMapped:
                    false,
                },
              ),
            ),
          );

        face.position.z =
          0.049;

        group.add(
          face,
        );

        return group;
      }

      function createUniverse(
        scene:
          THREE.Scene,
        phone:
          THREE.Group,
      ) {
        const universe =
          new THREE.Group();

        /*
         * Seluruh cluster digeser ke kiri.
         *
         * Ini yang bikin komposisi sekarang
         * lebih dekat dengan referensi.
         */
        universe.position.set(
          -0.82,
          -0.02,
          0,
        );

        scene.add(
          universe,
        );

        universe.add(
          phone,
        );

        /*
         * Soft ground shadow.
         */

        const shadowTexture =
          trackTexture(
            createShadowTexture(),
          );

        const floorShadow =
          new THREE.Mesh(
            trackGeometry(
              new THREE.PlaneGeometry(
                5.2,
                1.55,
              ),
            ),
            trackMaterial(
              new THREE.MeshBasicMaterial(
                {
                  map:
                    shadowTexture,

                  transparent:
                    true,

                  depthWrite:
                    false,

                  toneMapped:
                    false,

                  opacity:
                    0.58,
                },
              ),
            ),
          );

        floorShadow.position.set(
          0.45,
          -2.45,
          -1.7,
        );

        floorShadow.rotation.z =
          -0.08;

        universe.add(
          floorShadow,
        );

        /*
         * BACKGROUND RIBBON
         *
         * Ini cuma atmospheric ribbon,
         * jauh di belakang phone.
         */

        const atmosphereCurve =
          new THREE.CatmullRomCurve3(
            [
              new THREE.Vector3(
                -2.2,
                3.55,
                -3.1,
              ),

              new THREE.Vector3(
                -1.2,
                2.75,
                -3.05,
              ),

              new THREE.Vector3(
                0.35,
                1.85,
                -3,
              ),

              new THREE.Vector3(
                2.25,
                0.72,
                -2.9,
              ),

              new THREE.Vector3(
                4.2,
                -0.95,
                -2.85,
              ),
            ],
            false,
            "catmullrom",
            0.45,
          );

        const atmosphere =
          new THREE.Mesh(
            trackGeometry(
              createEllipticRibbonGeometry(
                atmosphereCurve,
                110,
                18,
                0.58,
                0.16,
              ),
            ),
            trackMaterial(
              new THREE.MeshPhysicalMaterial(
                {
                  color:
                    "#2a6244",

                  roughness:
                    0.12,

                  clearcoat:
                    1,

                  clearcoatRoughness:
                    0.04,

                  transparent:
                    true,

                  opacity:
                    0.09,

                  depthWrite:
                    false,

                  side:
                    THREE.DoubleSide,

                  envMapIntensity:
                    1.4,
                },
              ),
            ),
          );

        atmosphere.renderOrder =
          1;

        universe.add(
          atmosphere,
        );

        /*
         * BACK HALF OF MAIN LOOP.
         *
         * Dibuat terpisah dari front ribbon
         * supaya transparansi nggak saling
         * sort secara ngawur.
         */

        const backCurve =
          new THREE.CatmullRomCurve3(
            [
              new THREE.Vector3(
                -4.55,
                0.55,
                -0.45,
              ),

              new THREE.Vector3(
                -3.25,
                1.42,
                -0.78,
              ),

              new THREE.Vector3(
                -1.4,
                1.88,
                -1.05,
              ),

              new THREE.Vector3(
                0.65,
                1.82,
                -1.18,
              ),

              new THREE.Vector3(
                2.55,
                1.32,
                -0.86,
              ),

              new THREE.Vector3(
                4.55,
                0.48,
                -0.22,
              ),
            ],
            false,
            "catmullrom",
            0.4,
          );

        const backRibbon =
          new THREE.Mesh(
            trackGeometry(
              createEllipticRibbonGeometry(
                backCurve,
                150,
                20,

                /*
                 * Ini cuma ~0.62 total width,
                 * bukan 1.05 flat board kayak tadi.
                 */
                0.31,

                0.105,
              ),
            ),
            trackMaterial(
              new THREE.MeshPhysicalMaterial(
                {
                  color:
                    "#285d40",

                  roughness:
                    0.055,

                  clearcoat:
                    1,

                  clearcoatRoughness:
                    0.025,

                  transparent:
                    true,

                  opacity:
                    0.24,

                  depthWrite:
                    false,

                  side:
                    THREE.DoubleSide,

                  envMapIntensity:
                    1.85,
                },
              ),
            ),
          );

        backRibbon.renderOrder =
          2;

        universe.add(
          backRibbon,
        );

        /*
         * FRONT HALF OF MAIN LOOP.
         *
         * Ini yang nyebrang di depan HP.
         */

        const frontCurve =
          new THREE.CatmullRomCurve3(
            [
              new THREE.Vector3(
                4.55,
                0.48,
                0.05,
              ),

              new THREE.Vector3(
                3.45,
                -0.18,
                0.62,
              ),

              new THREE.Vector3(
                2.05,
                -0.72,
                1.06,
              ),

              new THREE.Vector3(
                0.42,
                -1.05,
                1.36,
              ),

              new THREE.Vector3(
                -1.25,
                -1.03,
                1.24,
              ),

              new THREE.Vector3(
                -2.9,
                -0.42,
                0.66,
              ),

              new THREE.Vector3(
                -4.55,
                0.55,
                0.02,
              ),
            ],
            false,
            "catmullrom",
            0.4,
          );

        const frontRibbonGroup =
          new THREE.Group();

        frontRibbonGroup.renderOrder =
          9;

        universe.add(
          frontRibbonGroup,
        );

        const frontRibbon =
          new THREE.Mesh(
            trackGeometry(
              createEllipticRibbonGeometry(
                frontCurve,
                170,
                22,
                0.33,
                0.11,
              ),
            ),
            trackMaterial(
              new THREE.MeshPhysicalMaterial(
                {
                  color:
                    "#1d5136",

                  roughness:
                    0.045,

                  clearcoat:
                    1,

                  clearcoatRoughness:
                    0.02,

                  transparent:
                    true,

                  opacity:
                    0.43,

                  depthWrite:
                    false,

                  side:
                    THREE.DoubleSide,

                  envMapIntensity:
                    2.1,
                },
              ),
            ),
          );

        frontRibbon.renderOrder =
          9;

        frontRibbonGroup.add(
          frontRibbon,
        );

        /*
         * Glass edge highlights.
         */

        const edgeMaterial =
          trackMaterial(
            new THREE.MeshBasicMaterial(
              {
                color:
                  "#cde8d7",

                transparent:
                  true,

                opacity:
                  0.22,

                depthWrite:
                  false,

                toneMapped:
                  false,
              },
            ),
          );

        const leftEdgeCurve =
          createOffsetCurve(
            frontCurve,
            0.27,
          );

        const rightEdgeCurve =
          createOffsetCurve(
            frontCurve,
            -0.27,
          );

        const edgeA =
          new THREE.Mesh(
            trackGeometry(
              new THREE.TubeGeometry(
                leftEdgeCurve,
                130,
                0.013,
                8,
                false,
              ),
            ),
            edgeMaterial,
          );

        const edgeB =
          new THREE.Mesh(
            trackGeometry(
              new THREE.TubeGeometry(
                rightEdgeCurve,
                130,
                0.013,
                8,
                false,
              ),
            ),
            edgeMaterial,
          );

        edgeA.renderOrder =
          10;

        edgeB.renderOrder =
          10;

        frontRibbonGroup.add(
          edgeA,
          edgeB,
        );

        /*
         * IDENTITY.
         */

        const identity =
          createGlassTile(
            "identity",
            "IDENTITY",
          );

        identity.position.set(
          -2.22,
          1.82,
          0.72,
        );

        identity.rotation.set(
          0.02,
          0.14,
          -0.11,
        );

        identity.scale.setScalar(
          1.02,
        );

        universe.add(
          identity,
        );

        /*
         * SHARE.
         */

        const share =
          createShareCoin();

        share.position.set(
          2.55,
          0.75,
          1.02,
        );

        share.rotation.set(
          0,
          -0.1,
          0.02,
        );

        universe.add(
          share,
        );

        /*
         * EXPLORE.
         */

        const explore =
          createGlassTile(
            "explore",
            "EXPLORE",
          );

        explore.position.set(
          2.72,
          -1.52,
          0.58,
        );

        explore.rotation.set(
          -0.02,
          -0.14,
          0.11,
        );

        explore.scale.setScalar(
          0.98,
        );

        universe.add(
          explore,
        );

        /*
         * MARBLE.
         */

        const marble =
          createMarble();

        marble.position.set(
          -2.6,
          -1.55,
          0.38,
        );

        universe.add(
          marble,
        );

        /*
         * SMALL EMERALD.
         */

        const emerald =
          new THREE.Mesh(
            trackGeometry(
              new THREE.SphereGeometry(
                0.18,
                48,
                48,
              ),
            ),
            trackMaterial(
              new THREE.MeshPhysicalMaterial(
                {
                  color:
                    "#175b37",

                  roughness:
                    0.055,

                  clearcoat:
                    1,

                  clearcoatRoughness:
                    0.02,

                  envMapIntensity:
                    2,
                },
              ),
            ),
          );

        emerald.position.set(
          -2.05,
          -0.36,
          1.42,
        );

        universe.add(
          emerald,
        );

        /*
         * CRYSTAL.
         */

        const crystal =
          new THREE.Mesh(
            trackGeometry(
              new THREE.SphereGeometry(
                0.21,
                48,
                48,
              ),
            ),
            trackMaterial(
              new THREE.MeshPhysicalMaterial(
                {
                  color:
                    "#ffffff",

                  roughness:
                    0.02,

                  clearcoat:
                    1,

                  clearcoatRoughness:
                    0.01,

                  transparent:
                    true,

                  opacity:
                    0.23,

                  depthWrite:
                    false,

                  envMapIntensity:
                    2,
                },
              ),
            ),
          );

        crystal.position.set(
          1.98,
          2.34,
          0.06,
        );

        universe.add(
          crystal,
        );

        /*
         * SHORTCUT CLUSTER.
         */

        const shortcuts =
          new THREE.Group();

        const shortcutIdentity =
          createShortcut(
            "identity",
            "Identity",
          );

        const shortcutSpill =
          createShortcut(
            "spill",
            "Spill",
          );

        const shortcutResource =
          createShortcut(
            "resource",
            "Resources",
          );

        const shortcutSocial =
          createShortcut(
            "social",
            "Social",
          );

        shortcutIdentity.position.set(
          -0.45,
          0.39,
          0,
        );

        shortcutSpill.position.set(
          0.45,
          0.39,
          0,
        );

        shortcutResource.position.set(
          -0.45,
          -0.39,
          0,
        );

        shortcutSocial.position.set(
          0.45,
          -0.39,
          0,
        );

        shortcuts.add(
          shortcutIdentity,
          shortcutSpill,
          shortcutResource,
          shortcutSocial,
        );

        shortcuts.position.set(
          -0.42,
          -1.35,
          1.63,
        );

        shortcuts.rotation.set(
          -0.01,
          -0.075,
          -0.028,
        );

        shortcuts.scale.setScalar(
          0.92,
        );

        universe.add(
          shortcuts,
        );

        const floats:
          FloatSpec[] =
          [
            {
              object:
                identity,

              baseY:
                identity.position.y,

              baseZ:
                identity.position.z,

              baseRotZ:
                identity.rotation.z,

              amplitudeY:
                0.045,

              amplitudeZ:
                0.018,

              amplitudeRotZ:
                0.006,

              speed:
                0.42,

              phase:
                0,
            },

            {
              object:
                share,

              baseY:
                share.position.y,

              baseZ:
                share.position.z,

              baseRotZ:
                share.rotation.z,

              amplitudeY:
                0.05,

              amplitudeZ:
                0.018,

              amplitudeRotZ:
                0.003,

              speed:
                0.37,

              phase:
                1.2,
            },

            {
              object:
                explore,

              baseY:
                explore.position.y,

              baseZ:
                explore.position.z,

              baseRotZ:
                explore.rotation.z,

              amplitudeY:
                0.045,

              amplitudeZ:
                0.018,

              amplitudeRotZ:
                0.006,

              speed:
                0.4,

              phase:
                2.2,
            },

            {
              object:
                marble,

              baseY:
                marble.position.y,

              baseZ:
                marble.position.z,

              baseRotZ:
                0,

              amplitudeY:
                0.03,

              amplitudeZ:
                0.012,

              amplitudeRotZ:
                0,

              speed:
                0.32,

              phase:
                3.4,
            },

            {
              object:
                emerald,

              baseY:
                emerald.position.y,

              baseZ:
                emerald.position.z,

              baseRotZ:
                0,

              amplitudeY:
                0.04,

              amplitudeZ:
                0.016,

              amplitudeRotZ:
                0,

              speed:
                0.51,

              phase:
                0.7,
            },

            {
              object:
                crystal,

              baseY:
                crystal.position.y,

              baseZ:
                crystal.position.z,

              baseRotZ:
                0,

              amplitudeY:
                0.035,

              amplitudeZ:
                0.016,

              amplitudeRotZ:
                0,

              speed:
                0.43,

              phase:
                4,
            },

            {
              object:
                shortcuts,

              baseY:
                shortcuts.position.y,

              baseZ:
                shortcuts.position.z,

              baseRotZ:
                shortcuts.rotation.z,

              amplitudeY:
                0.025,

              amplitudeZ:
                0.014,

              amplitudeRotZ:
                0.003,

              speed:
                0.34,

              phase:
                2.8,
            },
          ];

        return {
          universe,
          atmosphere,
          backRibbon,
          frontRibbonGroup,
          floats,
        };
      }

      async function initialize(
        hostElement:
          HTMLDivElement,
      ) {
        try {
          setFailed(
            false,
          );

          const gltf =
            await new GLTFLoader()
              .loadAsync(
                MODEL_URL,
              );

          const model =
            gltf.scene;

          trackModel(
            model,
          );

          if (
            disposed
          ) {
            return;
          }

          let replacementTexture:
            | THREE.Texture
            | undefined;

          if (
            screenUrl
          ) {
            replacementTexture =
              trackTexture(
                await new THREE.TextureLoader()
                  .loadAsync(
                    screenUrl,
                  ),
              );

            if (
              disposed
            ) {
              return;
            }

            replacementTexture.colorSpace =
              THREE.SRGBColorSpace;

            replacementTexture.flipY =
              true;
          }

          renderer =
            new THREE.WebGLRenderer(
              {
                alpha:
                  true,

                antialias:
                  true,

                powerPreference:
                  "high-performance",
              },
            );

          const webgl =
            renderer;

          webgl.setPixelRatio(
            Math.min(
              window.devicePixelRatio,
              1.75,
            ),
          );

          webgl.setClearColor(
            0x000000,
            0,
          );

          webgl.outputColorSpace =
            THREE.SRGBColorSpace;

          webgl.toneMapping =
            THREE.ACESFilmicToneMapping;

          webgl.toneMappingExposure =
            1.05;

          Object.assign(
            webgl.domElement.style,
            {
              width:
                "100%",

              height:
                "100%",

              display:
                "block",
            },
          );

          hostElement.appendChild(
            webgl.domElement,
          );

          webgl.domElement.addEventListener(
            "webglcontextlost",
            onContextLost,
          );

          const scene =
            new THREE.Scene();

          const camera =
            new THREE.PerspectiveCamera(
              30,
              1,
              0.1,
              100,
            );

          camera.position.set(
            0,
            0.05,
            12.45,
          );

          camera.lookAt(
            0,
            0,
            0,
          );

          const room =
            new RoomEnvironment();

          const pmrem =
            new THREE.PMREMGenerator(
              webgl,
            );

          try {
            environment =
              pmrem.fromScene(
                room,
                0.035,
              );

            scene.environment =
              environment.texture;
          } finally {
            room.dispose();
            pmrem.dispose();
          }

          const keyLight =
            new THREE.DirectionalLight(
              "#fff7ec",
              2.6,
            );

          keyLight.position.set(
            -4.5,
            6,
            8,
          );

          scene.add(
            keyLight,
          );

          const rimLight =
            new THREE.DirectionalLight(
              "#d3eadb",
              1.45,
            );

          rimLight.position.set(
            5.5,
            3,
            5,
          );

          scene.add(
            rimLight,
          );

          const greenLight =
            new THREE.PointLight(
              "#3c8560",
              0.5,
              12,
            );

          greenLight.position.set(
            3.2,
            -0.4,
            4,
          );

          scene.add(
            greenLight,
          );

          let screenFound =
            false;

          model.traverse(
            (
              object,
            ) => {
              if (
                !(
                  object
                  instanceof
                  THREE.Mesh
                )
              ) {
                return;
              }

              const sourceMaterials:
                THREE.Material[] =
                Array.isArray(
                  object.material,
                )
                  ? object.material
                  : [
                      object.material,
                    ];

              const updated =
                sourceMaterials.map(
                  (
                    surface,
                  ) => {
                    if (
                      surface.name ===
                        "17ProMax_color" &&
                      surface
                      instanceof
                      THREE.MeshStandardMaterial
                    ) {
                      surface.metalness =
                        1;

                      surface.roughness =
                        0.28;

                      surface.envMapIntensity =
                        1.25;
                    }

                    if (
                      surface.name ===
                        "17ProMax_glass" &&
                      surface
                      instanceof
                      THREE.MeshPhysicalMaterial
                    ) {
                      surface.color.set(
                        "#ffffff",
                      );

                      surface.transmission =
                        0;

                      surface.transparent =
                        true;

                      surface.opacity =
                        0.045;

                      surface.depthWrite =
                        false;

                      surface.roughness =
                        0.14;

                      surface.clearcoat =
                        0.65;

                      surface.clearcoatRoughness =
                        0.09;

                      surface.needsUpdate =
                        true;
                    }

                    if (
                      surface.name ===
                        "17ProMax_2112" ||
                      surface.name ===
                        "17ProMax_Lens2"
                    ) {
                      return trackMaterial(
                        new THREE.MeshBasicMaterial(
                          {
                            name:
                              surface.name,

                            color:
                              "#050608",

                            side:
                              THREE.DoubleSide,

                            toneMapped:
                              false,
                          },
                        ),
                      );
                    }

                    if (
                      surface.name !==
                      SCREEN_MATERIAL
                    ) {
                      return surface;
                    }

                    screenFound =
                      true;

                    if (
                      !replacementTexture
                    ) {
                      return surface;
                    }

                    const geometry =
                      object.geometry;

                    geometry.computeBoundingBox();

                    const bounds =
                      geometry.boundingBox;

                    if (
                      !bounds
                    ) {
                      return surface;
                    }

                    const width =
                      bounds.max.x -
                      bounds.min.x;

                    const height =
                      bounds.max.y -
                      bounds.min.y;

                    const positions =
                      geometry.getAttribute(
                        "position",
                      );

                    const uv =
                      new Float32Array(
                        positions.count *
                          2,
                      );

                    for (
                      let index =
                        0;
                      index <
                      positions.count;
                      index +=
                        1
                    ) {
                      uv[
                        index *
                          2
                      ] =
                        1 -
                        (
                          positions.getX(
                            index,
                          ) -
                          bounds.min.x
                        ) /
                          width;

                      uv[
                        index *
                          2 +
                          1
                      ] =
                        (
                          positions.getY(
                            index,
                          ) -
                          bounds.min.y
                        ) /
                        height;
                    }

                    geometry.setAttribute(
                      "uv",
                      new THREE.BufferAttribute(
                        uv,
                        2,
                      ),
                    );

                    const image =
                      replacementTexture.image as {
                        width: number;
                        height: number;
                      };

                    const imageAspect =
                      image.width /
                      image.height;

                    const displayAspect =
                      width /
                      height;

                    replacementTexture.repeat.set(
                      1,
                      1,
                    );

                    replacementTexture.offset.set(
                      0,
                      0,
                    );

                    if (
                      imageAspect >
                      displayAspect
                    ) {
                      replacementTexture.repeat.x =
                        displayAspect /
                        imageAspect;

                      replacementTexture.offset.x =
                        (
                          1 -
                          replacementTexture.repeat.x
                        ) /
                        2;
                    } else {
                      replacementTexture.repeat.y =
                        imageAspect /
                        displayAspect;

                      replacementTexture.offset.y =
                        1 -
                        replacementTexture.repeat.y;
                    }

                    replacementTexture.anisotropy =
                      Math.min(
                        webgl.capabilities.getMaxAnisotropy(),
                        8,
                      );

                    return trackMaterial(
                      new THREE.MeshBasicMaterial(
                        {
                          name:
                            SCREEN_MATERIAL,

                          map:
                            replacementTexture,

                          color:
                            "#ffffff",

                          side:
                            THREE.DoubleSide,

                          toneMapped:
                            false,
                        },
                      ),
                    );
                  },
                );

              object.material =
                Array.isArray(
                  object.material,
                )
                  ? updated
                  : updated[
                      0
                    ];
            },
          );

          if (
            !screenFound
          ) {
            throw new Error(
              `Material ${SCREEN_MATERIAL} tidak ditemukan.`,
            );
          }

          fixDynamicIsland(
            model,
          );

          model.rotation.y =
            Math.PI;

          model.updateMatrixWorld(
            true,
          );

          const bounds =
            new THREE.Box3()
              .setFromObject(
                model,
              );

          const center =
            bounds.getCenter(
              new THREE.Vector3(),
            );

          const size =
            bounds.getSize(
              new THREE.Vector3(),
            );

          if (
            size.y <=
            0
          ) {
            throw new Error(
              "Dimensi model tidak valid.",
            );
          }

          model.position.sub(
            center,
          );

          const phone =
            new THREE.Group();

          phone.add(
            model,
          );

          /*
           * Ukuran HP sekarang udah mendekati target.
           * Jangan dibesarin lagi.
           */
          phone.scale.setScalar(
            4.72 /
              size.y,
          );

          const baseRotation =
            {
              x:
                0.045,

              y:
                -0.32,

              z:
                -0.085,
            };

          phone.rotation.set(
            baseRotation.x,
            baseRotation.y,
            baseRotation.z,
          );

          phone.position.set(
            0.38,
            0.2,
            0.08,
          );

          const {
            universe,
            atmosphere,
            backRibbon,
            frontRibbonGroup,
            floats,
          } =
            createUniverse(
              scene,
              phone,
            );

          const coverElement =
            hostElement.closest<HTMLElement>(
              '[data-spall-featured="true"]',
            );

          const reducedMotion =
            window.matchMedia(
              "(prefers-reduced-motion: reduce)",
            );

          let targetX =
            0;

          let targetY =
            0;

          let pointerX =
            0;

          let pointerY =
            0;

          function onPointerMove(
            event:
              PointerEvent,
          ) {
            if (
              reducedMotion.matches ||
              event.pointerType ===
                "touch" ||
              !coverElement
            ) {
              return;
            }

            const rect =
              coverElement.getBoundingClientRect();

            if (
              !rect.width ||
              !rect.height
            ) {
              return;
            }

            targetX =
              THREE.MathUtils.clamp(
                (
                  (
                    event.clientX -
                    rect.left
                  ) /
                    rect.width
                ) *
                  2 -
                  1,
                -1,
                1,
              );

            targetY =
              THREE.MathUtils.clamp(
                (
                  (
                    event.clientY -
                    rect.top
                  ) /
                    rect.height
                ) *
                  2 -
                  1,
                -1,
                1,
              );
          }

          function resetPointer() {
            targetX =
              0;

            targetY =
              0;
          }

          if (
            coverElement
          ) {
            coverElement.addEventListener(
              "pointermove",
              onPointerMove,
              {
                passive:
                  true,
              },
            );

            coverElement.addEventListener(
              "pointerleave",
              resetPointer,
            );

            coverElement.addEventListener(
              "pointercancel",
              resetPointer,
            );

            intersectionObserver =
              new IntersectionObserver(
                (
                  entries,
                ) => {
                  visible =
                    entries[
                      0
                    ]
                      ?.isIntersecting ??
                    true;
                },
                {
                  threshold:
                    0.01,
                },
              );

            intersectionObserver.observe(
              coverElement,
            );
          }

          window.addEventListener(
            "blur",
            resetPointer,
          );

          sceneCleanup =
            () => {
              if (
                coverElement
              ) {
                coverElement.removeEventListener(
                  "pointermove",
                  onPointerMove,
                );

                coverElement.removeEventListener(
                  "pointerleave",
                  resetPointer,
                );

                coverElement.removeEventListener(
                  "pointercancel",
                  resetPointer,
                );
              }

              window.removeEventListener(
                "blur",
                resetPointer,
              );
            };

          function render() {
            if (
              disposed ||
              webgl
                .getContext()
                .isContextLost()
            ) {
              return;
            }

            webgl.render(
              scene,
              camera,
            );
          }

          function resize() {
            const width =
              hostElement.clientWidth;

            const height =
              hostElement.clientHeight;

            if (
              !width ||
              !height
            ) {
              return;
            }

            webgl.setSize(
              width,
              height,
              false,
            );

            camera.aspect =
              width /
              height;

            if (
              camera.aspect >=
              1.2
            ) {
              camera.position.z =
                12.45;
            } else if (
              camera.aspect >=
              0.95
            ) {
              camera.position.z =
                13.2;
            } else {
              camera.position.z =
                14.3;
            }

            camera.updateProjectionMatrix();

            render();
          }

          resizeObserver =
            new ResizeObserver(
              resize,
            );

          resizeObserver.observe(
            hostElement,
          );

          resize();

          let previousTime =
            performance.now();

          function animate(
            time:
              number,
          ) {
            if (
              disposed
            ) {
              return;
            }

            animationFrame =
              requestAnimationFrame(
                animate,
              );

            if (
              !visible ||
              webgl
                .getContext()
                .isContextLost()
            ) {
              previousTime =
                time;

              return;
            }

            const delta =
              Math.min(
                (
                  time -
                  previousTime
                ) /
                  1000,
                0.05,
              );

            previousTime =
              time;

            const ease =
              1 -
              Math.exp(
                -5 *
                  delta,
              );

            const seconds =
              time *
              0.001;

            pointerX +=
              (
                targetX -
                pointerX
              ) *
              ease;

            pointerY +=
              (
                targetY -
                pointerY
              ) *
              ease;

            universe.rotation.y +=
              (
                pointerX *
                  0.012 -
                universe
                  .rotation
                  .y
              ) *
              ease;

            universe.rotation.x +=
              (
                -pointerY *
                  0.008 -
                universe
                  .rotation
                  .x
              ) *
              ease;

            phone.rotation.x +=
              (
                baseRotation.x +
                  pointerY *
                    0.045 -
                phone
                  .rotation
                  .x
              ) *
              ease;

            phone.rotation.y +=
              (
                baseRotation.y +
                  pointerX *
                    0.08 -
                phone
                  .rotation
                  .y
              ) *
              ease;

            phone.rotation.z +=
              (
                baseRotation.z -
                  pointerX *
                    0.012 -
                phone
                  .rotation
                  .z
              ) *
              ease;

            phone.position.y =
              0.2 +
              Math.sin(
                seconds *
                  0.42,
              ) *
                0.018;

            /*
             * Ribbon bergerak sangat subtle.
             */
            frontRibbonGroup.position.y =
              Math.sin(
                seconds *
                  0.12,
              ) *
              0.018;

            frontRibbonGroup.rotation.z =
              Math.sin(
                seconds *
                  0.08,
              ) *
              0.004;

            backRibbon.position.y =
              Math.sin(
                seconds *
                  0.09 +
                  0.8,
              ) *
              0.018;

            atmosphere.position.y =
              Math.sin(
                seconds *
                  0.06 +
                  1.4,
              ) *
              0.025;

            floats.forEach(
              (
                item,
              ) => {
                item.object.position.y =
                  item.baseY +
                  Math.sin(
                    seconds *
                      item.speed +
                      item.phase,
                  ) *
                    item.amplitudeY;

                item.object.position.z =
                  item.baseZ +
                  Math.cos(
                    seconds *
                      item.speed *
                      0.8 +
                      item.phase,
                  ) *
                    item.amplitudeZ;

                item.object.rotation.z =
                  item.baseRotZ +
                  Math.sin(
                    seconds *
                      item.speed *
                      0.7 +
                      item.phase,
                  ) *
                    item.amplitudeRotZ;
              },
            );

            render();
          }

          if (
            reducedMotion.matches
          ) {
            render();
          } else {
            animationFrame =
              requestAnimationFrame(
                animate,
              );
          }

          if (
            !disposed
          ) {
            setReady(
              true,
            );
          }
        } catch (
          error
        ) {
          if (
            !disposed
          ) {
            console.error(
              "[SpallPhone3D]",
              error,
            );

            setReady(
              false,
            );

            setFailed(
              true,
            );
          }

          release();
        }
      }

      void initialize(
        host,
      );

      return () => {
        disposed =
          true;

        release();
      };
    },
    [
      screenUrl,
    ],
  );

  return (
    <div
      role="img"
      aria-label={
        label
      }
      style={{
        position:
          "absolute",

        inset:
          0,

        pointerEvents:
          "none",
      }}
    >
      {!ready && (
        <div
          aria-hidden="true"
          style={{
            position:
              "absolute",

            inset:
              "12% 33% 12% 27%",

            overflow:
              "hidden",

            border:
              "4px solid #303930",

            borderRadius:
              "12% / 6%",

            background:
              IVORY,

            transform:
              "rotate(-6deg)",

            boxShadow:
              "0 30px 60px rgba(18,38,27,.14)",
          }}
        >
          {screenUrl ? (
            <Image
              src={
                screenUrl
              }
              alt=""
              fill
              sizes="40vw"
              unoptimized
              style={{
                objectFit:
                  "cover",

                objectPosition:
                  "top",
              }}
            />
          ) : (
            <span
              style={{
                position:
                  "absolute",

                inset:
                  0,

                display:
                  "grid",

                placeItems:
                  "center",

                padding:
                  "12%",

                color:
                  GREEN,

                textAlign:
                  "center",

                fontSize:
                  "12px",
              }}
            >
              {failed
                ? "Preview unavailable"
                : "Loading Spall universe…"}
            </span>
          )}
        </div>
      )}

      <div
        ref={
          hostRef
        }
        aria-hidden="true"
        style={{
          position:
            "absolute",

          inset:
            0,

          opacity:
            ready
              ? 1
              : 0,

          pointerEvents:
            "none",

          transition:
            "opacity 320ms ease",
        }}
      />
    </div>
  );
}