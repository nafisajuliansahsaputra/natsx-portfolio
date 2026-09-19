"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import * as THREE from "three";

import {
  GLTFLoader,
} from "three/addons/loaders/GLTFLoader.js";

import {
  RoomEnvironment,
} from "three/addons/environments/RoomEnvironment.js";

type Props = {
  screenUrl:
    string | null;

  documentUrl:
    string | null;

  label:
    string;
};

type ScreenCandidate = {
  mesh:
    THREE.Mesh;

  materialIndex:
    number;

  score:
    number;

  surfaceAspect:
    number;

  sourceTexture:
    THREE.Texture | null;
};

const MACBOOK_MODEL_URL =
  "/models/bast/macbook-pro.glb";

const PRINTER_MODEL_URL =
  "/models/bast/printer.glb";

/* =========================================================
   CAMERA
========================================================= */

const CAMERA_FOV =
  30.5;

const CAMERA_POSITION = {
  x: 0.05,
  y: 2.55,
  z: 13.6,
};

const CAMERA_TARGET = {
  x: -0.3,
  y: -0.7,
  z: 0,
};

/* =========================================================
   MACBOOK — BASE
========================================================= */

const MACBOOK_TARGET_SIZE =
  5.8;

const MACBOOK_ROTATION = {
  x: -0.015,
  y: -0.45,
  z: -0.145,
};

const MACBOOK_POSITION = {
  x: -1.9,
  y: 0.02,
  z: 0.14,
};

/* =========================================================
   PRINTER — BASE
========================================================= */

const PRINTER_TARGET_SIZE =
  3.02;

const PRINTER_ROTATION = {
  x: -0.025,
  y: -0.44,
  z: 0.005,
};

const PRINTER_POSITION = {
  x: 2.35,
  y: -1.16,
  z: -1.05,
};

/* =========================================================
   SUPPORTING OBJECTS
========================================================= */

const FLOATING_DOC_CARD_POSITION = {
  x: -3.15,
  y: 1.08,
  z: 0.82,
};

const FLOATING_DOC_CARD_ROTATION = {
  x: 0.03,
  y: 0.12,
  z: -0.1,
};

const SUCCESS_CARD_POSITION = {
  x: 2.38,
  y: 1.18,
  z: 0.98,
};

const SUCCESS_CARD_ROTATION = {
  x: -0.015,
  y: -0.11,
  z: 0.03,
};

const STATS_CARD_POSITION = {
  x: 1.55,
  y: -1.9,
  z: 1.08,
};

const STATS_CARD_ROTATION = {
  x: 0.022,
  y: -0.12,
  z: 0.075,
};

/* =========================================================
   RESPONSIVE CAMERA FIT
========================================================= */

/*
 * Ini DESIGN BOUNDS, bukan runtime object bounds.
 *
 * Sama konsepnya seperti angka 3.45 / 3.5 di Spall.
 * Kita sengaja menentukan area komposisi yang harus terlihat,
 * bukan meminta Three.js menghitung seluruh mesh tersembunyi.
 */

const CAMERA_FIT_HALF_WIDTH =
  5.2;

const CAMERA_FIT_HALF_HEIGHT =
  3.72;

const CAMERA_BASE_DISTANCE =
  Math.hypot(
    CAMERA_POSITION.x -
      CAMERA_TARGET.x,

    CAMERA_POSITION.y -
      CAMERA_TARGET.y,

    CAMERA_POSITION.z -
      CAMERA_TARGET.z,
  );

  let compactLayout =
  false;
/* =========================================================
   3D MAGNETIC PARALLAX

   MacBook:
   follows pointer.

   Printer:
   moves opposite pointer.

   Everything remains true Three.js world-space movement.
========================================================= */

const MACBOOK_POINTER_POSITION = {
  x: 0.18,
  y: 0.105,
  z: 0.035,
};

const MACBOOK_POINTER_ROTATION = {
  x: 0.032,
  y: 0.068,
  z: 0.011,
};

const PRINTER_POINTER_POSITION = {
  x: 0.145,
  y: 0.082,
  z: 0.025,
};

const PRINTER_POINTER_ROTATION = {
  x: 0.022,
  y: 0.052,
  z: 0.009,
};

const POINTER_DAMPING =
  7.2;

const POINTER_EPSILON =
  0.00045;

/* =========================================================
   MODEL SEARCH
========================================================= */

const SCREEN_NAME_HINT =
  /(screen|display|lcd|monitor|panel|retina)/i;

const SCREEN_NEGATIVE_HINT =
  /(keyboard|keycap|key_|trackpad|touchpad|base|bottom|aluminium|aluminum|metal|body|case|shell|logo|apple)/i;

const PRINTER_PAPER_HINT =
  /(paper|page|sheet|document|a4|printout|print_out|output.?paper)/i;

/* =========================================================
   COMPONENT
========================================================= */

export default function BastEditorialScene(
  props:
    Props,
) {
  return (
    <Scene
      key={`${props.screenUrl ?? "screen"}-${props.documentUrl ?? "document"}`}
      {...props}
    />
  );
}

function Scene({
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

  useEffect(
    () => {
      const host =
        hostRef.current;

      if (!host) {
        return;
      }

      const hostElement =
        host;

      const cover =
        host.closest<HTMLElement>(
          '[data-bast-featured="true"]',
        );

      let disposed =
        false;

      let visible =
        true;

      let animationFrame =
        0;

      let previousFrameTime =
        0;

      let renderer:
        | THREE.WebGLRenderer
        | null =
        null;

      let environment:
        | THREE.WebGLRenderTarget
        | null =
        null;

      let resizeObserver:
        | ResizeObserver
        | null =
        null;

      let visibilityObserver:
        | IntersectionObserver
        | null =
        null;

      const geometries =
        new Set<
          THREE.BufferGeometry
        >();

      const materials =
        new Set<
          THREE.Material
        >();

      const textures =
        new Set<
          THREE.Texture
        >();

      const targetPointer =
        new THREE.Vector2(
          0,
          0,
        );

      const currentPointer =
        new THREE.Vector2(
          0,
          0,
        );

      /* =====================================================
         RESOURCE TRACKING
      ===================================================== */

      function keepGeometry<
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

      function keepMaterial<
        T extends THREE.Material,
      >(
        material:
          T,
      ) {
        materials.add(
          material,
        );

        return material;
      }

      function collectResources(
        root:
          THREE.Object3D,
      ) {
        root.traverse(
          (
            object,
          ) => {
            if (
              !(
                object instanceof
                THREE.Mesh
              )
            ) {
              return;
            }

            geometries.add(
              object.geometry,
            );

            const list =
              Array.isArray(
                object.material,
              )
                ? object.material
                : [
                    object.material,
                  ];

            list.forEach(
              (
                material,
              ) => {
                materials.add(
                  material,
                );

                const standard =
                  material as
                    THREE.MeshStandardMaterial;

                [
                  standard.map,
                  standard.normalMap,
                  standard.roughnessMap,
                  standard.metalnessMap,
                  standard.aoMap,
                  standard.emissiveMap,
                  standard.alphaMap,
                ]
                  .filter(
                    (
                      texture,
                    ): texture is THREE.Texture =>
                      Boolean(
                        texture,
                      ),
                  )
                  .forEach(
                    (
                      texture,
                    ) => {
                      textures.add(
                        texture,
                      );
                    },
                  );
              },
            );
          },
        );
      }

      /* =====================================================
         TEXTURE
      ===================================================== */

      function getTextureAspect(
        texture:
          | THREE.Texture
          | null,
      ) {
        if (!texture) {
          return null;
        }

        const image =
          texture.image as
            | {
                width?:
                  number;

                height?:
                  number;
              }
            | undefined;

        const width =
          image?.width ??
          0;

        const height =
          image?.height ??
          0;

        if (
          width <= 0 ||
          height <= 0
        ) {
          return null;
        }

        return (
          width /
          height
        );
      }

      function configureTextureCover(
        texture:
          THREE.Texture,

        targetAspect:
          number,
      ) {
        const imageAspect =
          getTextureAspect(
            texture,
          );

        texture.repeat.set(
          1,
          1,
        );

        texture.offset.set(
          0,
          0,
        );

        texture.center.set(
          0.5,
          0.5,
        );

        texture.rotation =
          0;

        if (
          !imageAspect ||
          targetAspect <= 0
        ) {
          texture.needsUpdate =
            true;

          return;
        }

        if (
          imageAspect >
          targetAspect
        ) {
          const repeat =
            targetAspect /
            imageAspect;

          texture.repeat.x =
            repeat;

          texture.offset.x =
            (
              1 -
              repeat
            ) /
            2;
        } else {
          const repeat =
            imageAspect /
            targetAspect;

          texture.repeat.y =
            repeat;

          texture.offset.y =
            (
              1 -
              repeat
            ) /
            2;
        }

        texture.needsUpdate =
          true;
      }

      /* =====================================================
         MODEL NORMALIZATION
      ===================================================== */

      function normalizeModel(
        model:
          THREE.Object3D,

        targetSize:
          number,
      ) {
        model.updateMatrixWorld(
          true,
        );

        const rawBox =
          new THREE.Box3()
            .setFromObject(
              model,
            );

        const rawSize =
          rawBox.getSize(
            new THREE.Vector3(),
          );

        const largest =
          Math.max(
            rawSize.x,
            rawSize.y,
            rawSize.z,
          );

        if (
          largest > 0
        ) {
          const scale =
            targetSize /
            largest;

          model.scale.set(
            scale,
            scale,
            scale,
          );
        }

        model.updateMatrixWorld(
          true,
        );

        const scaledBox =
          new THREE.Box3()
            .setFromObject(
              model,
            );

        const center =
          scaledBox.getCenter(
            new THREE.Vector3(),
          );

        model.position.sub(
          center,
        );
      }

      function freezeStaticDescendants(
        root:
          THREE.Object3D,
      ) {
        root.traverse(
          (
            object,
          ) => {
            if (
              object ===
              root
            ) {
              return;
            }

            object.updateMatrix();
            object.matrixAutoUpdate =
              false;
          },
        );
      }

      /* =====================================================
         FIND SCREEN
      ===================================================== */

      function findScreenCandidate(
        model:
          THREE.Object3D,
      ) {
        model.updateMatrixWorld(
          true,
        );

        const modelBox =
          new THREE.Box3()
            .setFromObject(
              model,
            );

        const modelSize =
          modelBox.getSize(
            new THREE.Vector3(),
          );

        const modelHeight =
          Math.max(
            modelSize.y,
            Number.EPSILON,
          );

        const candidates:
          ScreenCandidate[] =
          [];

        model.traverse(
          (
            object,
          ) => {
            if (
              !(
                object instanceof
                THREE.Mesh
              )
            ) {
              return;
            }

            object.geometry
              .computeBoundingBox();

            const bounds =
              object.geometry
                .boundingBox;

            if (!bounds) {
              return;
            }

            const size =
              bounds.getSize(
                new THREE.Vector3(),
              );

            const center =
              bounds
                .getCenter(
                  new THREE.Vector3(),
                )
                .applyMatrix4(
                  object.matrixWorld,
                );

            const normalizedY =
              (
                center.y -
                modelBox.min.y
              ) /
              modelHeight;

            const dimensions = [
              Math.abs(
                size.x,
              ),

              Math.abs(
                size.y,
              ),

              Math.abs(
                size.z,
              ),
            ].sort(
              (
                a,
                b,
              ) =>
                b -
                a,
            );

            const largest =
              Math.max(
                dimensions[0],
                Number.EPSILON,
              );

            const middle =
              Math.max(
                dimensions[1],
                Number.EPSILON,
              );

            const smallest =
              dimensions[2];

            const surfaceAspect =
              largest /
              middle;

            const thinness =
              smallest /
              largest;

            const materialList =
              Array.isArray(
                object.material,
              )
                ? object.material
                : [
                    object.material,
                  ];

            materialList.forEach(
              (
                material,
                materialIndex,
              ) => {
                const standard =
                  material as
                    THREE.MeshStandardMaterial;

                const sourceTexture =
                  standard.map ??
                  standard.emissiveMap ??
                  null;

                const textureAspect =
                  getTextureAspect(
                    sourceTexture,
                  );

                const sourceImage =
                  sourceTexture
                    ?.image as
                    | {
                        width?:
                          number;

                        height?:
                          number;
                      }
                    | undefined;

                const name =
                  `${object.name ?? ""} ${material.name ?? ""}`;

                let score =
                  0;

                if (
                  SCREEN_NAME_HINT.test(
                    name,
                  )
                ) {
                  score +=
                    230;
                }

                if (
                  textureAspect &&
                  textureAspect >=
                    1.3 &&
                  textureAspect <=
                    2.3
                ) {
                  score +=
                    125;
                }

                if (
                  (
                    sourceImage
                      ?.width ??
                    0
                  ) >=
                    800 ||
                  (
                    sourceImage
                      ?.height ??
                    0
                  ) >=
                    500
                ) {
                  score +=
                    75;
                }

                if (
                  standard.emissiveMap
                ) {
                  score +=
                    95;
                }

                if (
                  standard.map
                ) {
                  score +=
                    35;
                }

                if (
                  thinness <
                    0.07
                ) {
                  score +=
                    48;
                }

                if (
                  surfaceAspect >=
                    1.25 &&
                  surfaceAspect <=
                    2.3
                ) {
                  score +=
                    45;
                }

                if (
                  normalizedY >
                    0.5
                ) {
                  score +=
                    65;
                }

                if (
                  SCREEN_NEGATIVE_HINT.test(
                    name,
                  )
                ) {
                  score -=
                    210;
                }

                candidates.push(
                  {
                    mesh:
                      object,

                    materialIndex,

                    score,

                    surfaceAspect,

                    sourceTexture,
                  },
                );
              },
            );
          },
        );

        candidates.sort(
          (
            a,
            b,
          ) =>
            b.score -
            a.score,
        );

        return (
          candidates[0] ??
          null
        );
      }

      /* =====================================================
         DASHBOARD SCREEN

         flipY=true dipertahankan karena ini
         orientation yang sudah confirmed benar.
      ===================================================== */

      function replaceScreen(
        candidate:
          ScreenCandidate,

        screenshot:
          THREE.Texture,

        webgl:
          THREE.WebGLRenderer,
      ) {
        screenshot.colorSpace =
          THREE.SRGBColorSpace;

        screenshot.flipY =
          true;

        screenshot.wrapS =
          THREE.ClampToEdgeWrapping;

        screenshot.wrapT =
          THREE.ClampToEdgeWrapping;

        screenshot.anisotropy =
          Math.min(
            webgl.capabilities
              .getMaxAnisotropy(),

            8,
          );

        configureTextureCover(
          screenshot,
          candidate.surfaceAspect,
        );

        screenshot.needsUpdate =
          true;

        const screenMaterial =
          keepMaterial(
            new THREE.MeshBasicMaterial(
              {
                map:
                  screenshot,

                color:
                  "#ffffff",

                side:
                  THREE.DoubleSide,

                toneMapped:
                  false,
              },
            ),
          );

        if (
          Array.isArray(
            candidate.mesh
              .material,
          )
        ) {
          const next = [
            ...candidate.mesh
              .material,
          ];

          next[
            candidate.materialIndex
          ] =
            screenMaterial;

          candidate.mesh.material =
            next;
        } else {
          candidate.mesh.material =
            screenMaterial;
        }
      }

      /* =====================================================
         MACBOOK MATERIAL
      ===================================================== */

      function tuneMacbookMaterials(
        model:
          THREE.Object3D,
      ) {
        const targetSilver =
          new THREE.Color(
            "#737f8b",
          );

        model.traverse(
          (
            object,
          ) => {
            if (
              !(
                object instanceof
                THREE.Mesh
              )
            ) {
              return;
            }

            const materialList =
              Array.isArray(
                object.material,
              )
                ? object.material
                : [
                    object.material,
                  ];

            materialList.forEach(
              (
                material,
              ) => {
                if (
                  !(
                    material instanceof
                      THREE.MeshStandardMaterial ||
                    material instanceof
                      THREE.MeshPhysicalMaterial
                  )
                ) {
                  return;
                }

                const name =
                  `${object.name} ${material.name}`;

                if (
                  /(keyboard|keycap|key_|key\b)/i.test(
                    name,
                  )
                ) {
                  return;
                }

                const metallic =
                  material.metalness >
                    0.3 ||
                  /(alum|aluminium|aluminum|metal|body|case|chassis)/i.test(
                    name,
                  );

                if (!metallic) {
                  return;
                }

                material.color.lerp(
                  targetSilver,
                  0.22,
                );

                material.metalness =
                  Math.max(
                    material.metalness,
                    0.7,
                  );

                material.roughness =
                  THREE.MathUtils.clamp(
                    material.roughness,
                    0.22,
                    0.44,
                  );

                material.envMapIntensity =
                  1.12;

                material.needsUpdate =
                  true;
              },
            );
          },
        );
      }

      /* =====================================================
         PRINTER MATERIAL
      ===================================================== */

      function hideNativePrinterPaper(
        model:
          THREE.Object3D,
      ) {
        model.traverse(
          (
            object,
          ) => {
            if (
              !(
                object instanceof
                THREE.Mesh
              )
            ) {
              return;
            }

            const materialList =
              Array.isArray(
                object.material,
              )
                ? object.material
                : [
                    object.material,
                  ];

            const materialNames =
              materialList
                .map(
                  (
                    material,
                  ) =>
                    material.name ??
                    "",
                )
                .join(
                  " ",
                );

            const searchableName =
              `${object.name ?? ""} ${materialNames}`;

            if (
              PRINTER_PAPER_HINT.test(
                searchableName,
              )
            ) {
              object.visible =
                false;
            }
          },
        );
      }

      function tunePrinterMaterials(
        model:
          THREE.Object3D,
      ) {
        const darkTop =
          new THREE.Color(
            "#243548",
          );

        const coolBody =
          new THREE.Color(
            "#dbe4eb",
          );

        model.traverse(
          (
            object,
          ) => {
            if (
              !(
                object instanceof
                THREE.Mesh
              )
            ) {
              return;
            }

            const materialList =
              Array.isArray(
                object.material,
              )
                ? object.material
                : [
                    object.material,
                  ];

            materialList.forEach(
              (
                material,
              ) => {
                if (
                  !(
                    material instanceof
                      THREE.MeshStandardMaterial ||
                    material instanceof
                      THREE.MeshPhysicalMaterial
                  )
                ) {
                  return;
                }

                const name =
                  `${object.name ?? ""} ${material.name ?? ""}`;

                if (
                  /(dark|black|lid|top.?cover|upper.?cover|scanner.?lid)/i.test(
                    name,
                  )
                ) {
                  material.color.lerp(
                    darkTop,
                    0.82,
                  );

                  material.roughness =
                    0.32;

                  material.needsUpdate =
                    true;

                  return;
                }

                const {
                  r,
                  g,
                  b,
                } =
                  material.color;

                const luminance =
                  r *
                    0.2126 +
                  g *
                    0.7152 +
                  b *
                    0.0722;

                if (
                  luminance <
                    0.52
                ) {
                  material.color.lerp(
                    darkTop,
                    0.67,
                  );
                } else {
                  material.color.lerp(
                    coolBody,
                    0.28,
                  );
                }

                material.needsUpdate =
                  true;
              },
            );
          },
        );
      }

      /* =====================================================
         REAR PAPER
      ===================================================== */

      function roundedRectShape(
  width: number,
  height: number,
  radius: number,
) {
  const shape =
    new THREE.Shape();

  const x =
    -width / 2;

  const y =
    -height / 2;

  const r =
    Math.min(
      radius,
      width / 2,
      height / 2,
    );

  shape.moveTo(
    x + r,
    y,
  );

  shape.lineTo(
    x + width - r,
    y,
  );

  shape.quadraticCurveTo(
    x + width,
    y,
    x + width,
    y + r,
  );

  shape.lineTo(
    x + width,
    y + height - r,
  );

  shape.quadraticCurveTo(
    x + width,
    y + height,
    x + width - r,
    y + height,
  );

  shape.lineTo(
    x + r,
    y + height,
  );

  shape.quadraticCurveTo(
    x,
    y + height,
    x,
    y + height - r,
  );

  shape.lineTo(
    x,
    y + r,
  );

  shape.quadraticCurveTo(
    x,
    y,
    x + r,
    y,
  );

  shape.closePath();

  return shape;
}

function traceRoundedRectPath(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r =
    Math.min(
      radius,
      width / 2,
      height / 2,
    );

  context.beginPath();
  context.moveTo(
    x + r,
    y,
  );
  context.lineTo(
    x + width - r,
    y,
  );
  context.quadraticCurveTo(
    x + width,
    y,
    x + width,
    y + r,
  );
  context.lineTo(
    x + width,
    y + height - r,
  );
  context.quadraticCurveTo(
    x + width,
    y + height,
    x + width - r,
    y + height,
  );
  context.lineTo(
    x + r,
    y + height,
  );
  context.quadraticCurveTo(
    x,
    y + height,
    x,
    y + height - r,
  );
  context.lineTo(
    x,
    y + r,
  );
  context.quadraticCurveTo(
    x,
    y,
    x + r,
    y,
  );
  context.closePath();
}

function createCanvasTexture(
  draw: (
    context: CanvasRenderingContext2D,
    size: number,
  ) => void,
  size = 1024,
) {
  const canvas =
    document.createElement(
      "canvas",
    );

  canvas.width =
    size;

  canvas.height =
    size;

  const context =
    canvas.getContext(
      "2d",
    );

  if (
    !context
  ) {
    throw new Error(
      "Canvas 2D unavailable.",
    );
  }

  draw(
    context,
    size,
  );

  const texture =
    new THREE.CanvasTexture(
      canvas,
    );

  texture.colorSpace =
    THREE.SRGBColorSpace;

  texture.needsUpdate =
    true;

  textures.add(
    texture,
  );

  return texture;
}

function createCardBody(
  width: number,
  height: number,
  depth: number,
  radius: number,
) {
  const geometry =
    keepGeometry(
      new THREE.ExtrudeGeometry(
        roundedRectShape(
          width,
          height,
          radius,
        ),
        {
          depth,
          steps: 1,
          curveSegments: 24,
          bevelEnabled:
            true,
          bevelSize:
            depth * 0.18,
          bevelThickness:
            depth * 0.18,
          bevelSegments: 6,
        },
      ),
    );

  const faceMaterial =
    keepMaterial(
      new THREE.MeshPhysicalMaterial(
        {
          color:
            "#fbfdff",
          roughness:
            0.2,
          metalness:
            0,
          transmission:
            0.24,
          thickness:
            0.08,
          ior: 1.45,
          clearcoat: 1,
          clearcoatRoughness:
            0.08,
          envMapIntensity:
            1,
        },
      ),
    );

  const sideMaterial =
    keepMaterial(
      new THREE.MeshPhysicalMaterial(
        {
          color:
            "#dde8f2",
          roughness:
            0.22,
          metalness:
            0.05,
          transmission:
            0.16,
          thickness:
            0.12,
          ior: 1.45,
          clearcoat: 1,
          clearcoatRoughness:
            0.07,
          envMapIntensity:
            1.05,
        },
      ),
    );

  return new THREE.Mesh(
    geometry,
    [
      faceMaterial,
      sideMaterial,
    ],
  );
}

function createCardShadow(
  width: number,
  height: number,
  opacity: number,
) {
  const texture =
    createCanvasTexture(
      (
        context,
        size,
      ) => {
        const gradient =
          context.createRadialGradient(
            size / 2,
            size / 2,
            size * 0.08,
            size / 2,
            size / 2,
            size * 0.48,
          );

        gradient.addColorStop(
          0,
          `rgba(26, 44, 63, ${opacity})`,
        );

        gradient.addColorStop(
          0.5,
          `rgba(26, 44, 63, ${opacity * 0.28})`,
        );

        gradient.addColorStop(
          1,
          "rgba(26, 44, 63, 0)",
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
      512,
    );

  return new THREE.Mesh(
    keepGeometry(
      new THREE.PlaneGeometry(
        width,
        height,
      ),
    ),
    keepMaterial(
      new THREE.MeshBasicMaterial(
        {
          map: texture,
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
}

function drawDocumentGlyph(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
) {
  const radius =
    width * 0.08;

  context.save();
  context.strokeStyle =
    color;
  context.lineWidth =
    Math.max(
      4,
      width * 0.06,
    );
  context.lineJoin =
    "round";
  context.lineCap =
    "round";

  traceRoundedRectPath(
    context,
    x,
    y,
    width,
    height,
    radius,
  );
  context.stroke();

  context.beginPath();
  context.moveTo(
    x + width * 0.68,
    y,
  );
  context.lineTo(
    x + width * 0.68,
    y + height * 0.22,
  );
  context.lineTo(
    x + width * 0.92,
    y + height * 0.22,
  );
  context.stroke();

  context.beginPath();
  context.moveTo(
    x + width * 0.2,
    y + height * 0.42,
  );
  context.lineTo(
    x + width * 0.78,
    y + height * 0.42,
  );
  context.moveTo(
    x + width * 0.2,
    y + height * 0.58,
  );
  context.lineTo(
    x + width * 0.68,
    y + height * 0.58,
  );
  context.moveTo(
    x + width * 0.2,
    y + height * 0.74,
  );
  context.lineTo(
    x + width * 0.58,
    y + height * 0.74,
  );
  context.stroke();

  context.restore();
}

function getCardFrontZ(
  depth:
    number,
) {
  /*
   * ExtrudeGeometry dengan bevel tidak berhenti tepat di `depth`.
   * Front bevel maju sekitar bevelThickness.
   *
   * Sebelumnya print plane cuma ada di depth + 0.002,
   * sehingga berada DI DALAM body dan tertutup material putih.
   */

  const bevelThickness =
    depth *
    0.18;

  return (
    depth +
    bevelThickness +
    0.018
  );
}

function createFloatingDocCard() {
  const group =
    new THREE.Group();

  const width =
    0.82;

  const height =
    0.82;

  const depth =
    0.095;

  const frontZ =
    getCardFrontZ(
      depth,
    );

  const body =
    createCardBody(
      width,
      height,
      depth,
      0.16,
    );

  /*
   * DOCUMENT ICON
   */

  const printTexture =
    createCanvasTexture(
      (
        context,
        size,
      ) => {
        context.clearRect(
          0,
          0,
          size,
          size,
        );

        drawDocumentGlyph(
          context,
          size * 0.33,
          size * 0.25,
          size * 0.27,
          size * 0.36,
          "#4e9cf3",
        );
      },
      512,
    );

  const printMaterial =
    keepMaterial(
      new THREE.MeshBasicMaterial(
        {
          map:
            printTexture,

          transparent:
            true,

          alphaTest:
            0.01,

          depthWrite:
            false,

          depthTest:
            true,

          toneMapped:
            false,

          side:
            THREE.DoubleSide,
        },
      ),
    );

  const print =
    new THREE.Mesh(
      keepGeometry(
        new THREE.PlaneGeometry(
          width * 0.82,
          height * 0.82,
        ),
      ),

      printMaterial,
    );

  /*
   * IMPORTANT:
   * print ditempatkan DI DEPAN bevel.
   */

  print.position.z =
    frontZ;

  print.renderOrder =
    10;

  /*
   * SOFT SHADOW
   */

  const shadow =
    createCardShadow(
      1.02,
      0.5,
      0.2,
    );

  shadow.position.set(
    0.04,
    -0.12,
    -0.08,
  );

  shadow.scale.set(
    1,
    1,
    1,
  );

  group.add(
    shadow,
  );

  group.add(
    body,
  );

  group.add(
    print,
  );

  group.position.set(
    FLOATING_DOC_CARD_POSITION.x,
    FLOATING_DOC_CARD_POSITION.y,
    FLOATING_DOC_CARD_POSITION.z,
  );

  group.rotation.set(
    FLOATING_DOC_CARD_ROTATION.x,
    FLOATING_DOC_CARD_ROTATION.y,
    FLOATING_DOC_CARD_ROTATION.z,
  );

  return group;
}

function createRectCanvasTexture(
  draw: (
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
  ) => void,

  width: number,

  height: number,
) {
  const canvas =
    document.createElement(
      "canvas",
    );

  canvas.width =
    width;

  canvas.height =
    height;

  const context =
    canvas.getContext(
      "2d",
    );

  if (
    !context
  ) {
    throw new Error(
      "Canvas 2D unavailable.",
    );
  }

  context.clearRect(
    0,
    0,
    width,
    height,
  );

  draw(
    context,
    width,
    height,
  );

  const texture =
    new THREE.CanvasTexture(
      canvas,
    );

  texture.colorSpace =
    THREE.SRGBColorSpace;

  texture.minFilter =
    THREE.LinearFilter;

  texture.magFilter =
    THREE.LinearFilter;

  texture.generateMipmaps =
    true;

  texture.needsUpdate =
    true;

  textures.add(
    texture,
  );

  return texture;
}

function createSuccessCard() {
  const group =
    new THREE.Group();

  const width =
    2.02;

  const height =
    0.68;

  const depth =
    0.095;

  const frontZ =
    getCardFrontZ(
      depth,
    );

  const body =
    createCardBody(
      width,
      height,
      depth,
      0.145,
    );

  /*
   * =========================================================
   * RECTANGULAR TEXTURE
   * =========================================================
   *
   * Aspect canvas sengaja mengikuti aspect card.
   * Tidak lagi menggunakan texture square 1024x1024.
   */

  const printTexture =
    createRectCanvasTexture(
      (
        context,
        canvasWidth,
        canvasHeight,
      ) => {
        const centerY =
          canvasHeight /
          2;

        /*
         * GREEN CIRCLE
         */

        const iconX =
          canvasWidth *
          0.105;

        const iconRadius =
          canvasHeight *
          0.205;

        context.fillStyle =
          "#48bf70";

        context.beginPath();

        context.arc(
          iconX,
          centerY,
          iconRadius,
          0,
          Math.PI *
            2,
        );

        context.fill();

        /*
         * CHECKMARK
         */

        context.strokeStyle =
          "#ffffff";

        context.lineWidth =
          canvasHeight *
          0.055;

        context.lineCap =
          "round";

        context.lineJoin =
          "round";

        context.beginPath();

        context.moveTo(
          iconX -
            iconRadius *
              0.42,
          centerY +
            iconRadius *
              0.02,
        );

        context.lineTo(
          iconX -
            iconRadius *
              0.08,
          centerY +
            iconRadius *
              0.36,
        );

        context.lineTo(
          iconX +
            iconRadius *
              0.55,
          centerY -
            iconRadius *
              0.48,
        );

        context.stroke();

        /*
         * MAIN TITLE
         */

        const textX =
          canvasWidth *
          0.18;

        context.fillStyle =
          "#45627d";

        context.font =
          `700 ${
            canvasHeight *
            0.17
          }px Arial, sans-serif`;

        context.textAlign =
          "left";

        context.textBaseline =
          "middle";

        context.fillText(
          "Dokumen Berhasil Dicetak",
          textX,
          canvasHeight *
            0.43,
        );

        /*
         * BAST ID
         */

        context.fillStyle =
          "#7ea6cc";

        context.font =
          `600 ${
            canvasHeight *
            0.115
          }px Arial, sans-serif`;

        context.fillText(
          "BAST-2026-014",
          textX,
          canvasHeight *
            0.65,
        );
      },

      1536,
      512,
    );

  const print =
    new THREE.Mesh(
      keepGeometry(
        new THREE.PlaneGeometry(
          width *
            0.91,

          height *
            0.82,
        ),
      ),

      keepMaterial(
        new THREE.MeshBasicMaterial(
          {
            map:
              printTexture,

            transparent:
              true,

            alphaTest:
              0.005,

            depthWrite:
              false,

            depthTest:
              true,

            toneMapped:
              false,

            side:
              THREE.DoubleSide,
          },
        ),
      ),
    );

  print.position.z =
    frontZ;

  print.renderOrder =
    20;

  /*
   * SHADOW
   */

  const shadow =
    createCardShadow(
      1.95,
      0.48,
      0.15,
    );

  shadow.position.set(
    0.08,
    -0.12,
    -0.075,
  );

  group.add(
    shadow,
  );

  group.add(
    body,
  );

  group.add(
    print,
  );

  /*
   * Posisi ditarik ke kiri.
   *
   * Sebelumnya terlalu dekat frame kanan.
   */

group.position.set(
  SUCCESS_CARD_POSITION.x,
  SUCCESS_CARD_POSITION.y,
  SUCCESS_CARD_POSITION.z,
);

group.rotation.set(
  SUCCESS_CARD_ROTATION.x,
  SUCCESS_CARD_ROTATION.y,
  SUCCESS_CARD_ROTATION.z,
);

  return group;
}

function createStatsCard() {
  const group =
    new THREE.Group();

  const width =
    1.52;

  const height =
    0.63;

  const depth =
    0.095;

  const frontZ =
    getCardFrontZ(
      depth,
    );

  const body =
    createCardBody(
      width,
      height,
      depth,
      0.14,
    );

  /*
   * =========================================================
   * RECTANGULAR STATS TEXTURE
   * =========================================================
   */

  const printTexture =
    createRectCanvasTexture(
      (
        context,
        canvasWidth,
        canvasHeight,
      ) => {
        /*
         * DOCUMENT ICON CONTAINER
         */

        const iconBoxSize =
          canvasHeight *
          0.44;

        const iconBoxX =
          canvasWidth *
          0.075;

        const iconBoxY =
          (
            canvasHeight -
            iconBoxSize
          ) /
          2;

        context.fillStyle =
          "#edf6ff";

        traceRoundedRectPath(
          context,
          iconBoxX,
          iconBoxY,
          iconBoxSize,
          iconBoxSize,
          iconBoxSize *
            0.18,
        );

        context.fill();

        /*
         * DOCUMENT GLYPH
         */

        drawDocumentGlyph(
          context,

          iconBoxX +
            iconBoxSize *
              0.27,

          iconBoxY +
            iconBoxSize *
              0.2,

          iconBoxSize *
            0.46,

          iconBoxSize *
            0.58,

          "#5ca3ef",
        );

        /*
         * NUMBER
         */

        const copyX =
          canvasWidth *
          0.31;

        context.fillStyle =
          "#153f60";

        context.font =
          `700 ${
            canvasHeight *
            0.29
          }px Arial, sans-serif`;

        context.textAlign =
          "left";

        context.textBaseline =
          "middle";

        context.fillText(
          "128",
          copyX,
          canvasHeight *
            0.42,
        );

        /*
         * LABEL
         */

        context.fillStyle =
          "#7898b5";

        context.font =
          `600 ${
            canvasHeight *
            0.13
          }px Arial, sans-serif`;

        context.fillText(
          "Total BAST",
          copyX,
          canvasHeight *
            0.67,
        );

        /*
         * CHART
         */

        const chartStart =
          canvasWidth *
          0.77;

        const chartBottom =
          canvasHeight *
          0.68;

        const barWidth =
          canvasWidth *
          0.027;

        const barGap =
          canvasWidth *
          0.018;

        const heights = [
          canvasHeight *
            0.18,

          canvasHeight *
            0.3,

          canvasHeight *
            0.43,
        ];

        context.fillStyle =
          "#4d9ff3";

        heights.forEach(
          (
            barHeight,
            index,
          ) => {
            const x =
              chartStart +
              index *
                (
                  barWidth +
                  barGap
                );

            traceRoundedRectPath(
              context,

              x,

              chartBottom -
                barHeight,

              barWidth,

              barHeight,

              barWidth /
                2,
            );

            context.fill();
          },
        );
      },

      1280,
      512,
    );

  const print =
    new THREE.Mesh(
      keepGeometry(
        new THREE.PlaneGeometry(
          width *
            0.91,

          height *
            0.82,
        ),
      ),

      keepMaterial(
        new THREE.MeshBasicMaterial(
          {
            map:
              printTexture,

            transparent:
              true,

            alphaTest:
              0.005,

            depthWrite:
              false,

            depthTest:
              true,

            toneMapped:
              false,

            side:
              THREE.DoubleSide,
          },
        ),
      ),
    );

  print.position.z =
    frontZ;

  print.renderOrder =
    20;

  const shadow =
    createCardShadow(
      1.5,
      0.42,
      0.16,
    );

  shadow.position.set(
    0.05,
    -0.1,
    -0.075,
  );

  group.add(
    shadow,
  );

  group.add(
    body,
  );

  group.add(
    print,
  );

  /*
   * Ditarik ke kiri dan sedikit naik
   * supaya tidak tabrakan dengan workflow.
   */

group.position.set(
  STATS_CARD_POSITION.x,
  STATS_CARD_POSITION.y,
  STATS_CARD_POSITION.z,
);

group.rotation.set(
  STATS_CARD_ROTATION.x,
  STATS_CARD_ROTATION.y,
  STATS_CARD_ROTATION.z,
);

  return group;
}

      /* =====================================================
         BASE CLEANUP
      ===================================================== */

      let cleanup =
        () => {
          if (
            animationFrame
          ) {
            window.cancelAnimationFrame(
              animationFrame,
            );

            animationFrame =
              0;
          }

          resizeObserver
            ?.disconnect();

          visibilityObserver
            ?.disconnect();

          environment
            ?.dispose();

          geometries.forEach(
            (
              geometry,
            ) => {
              geometry.dispose();
            },
          );

          materials.forEach(
            (
              material,
            ) => {
              material.dispose();
            },
          );

          textures.forEach(
            (
              texture,
            ) => {
              texture.dispose();
            },
          );

          geometries.clear();

          materials.clear();

          textures.clear();

          if (
            renderer
          ) {
            renderer.dispose();

            renderer.domElement
              .remove();

            renderer =
              null;
          }
        };

      /* =====================================================
         INITIALIZE
      ===================================================== */

      async function initialize() {
        try {
          const loader =
            new GLTFLoader();

          const [
            macbookGltf,
            printerGltf,
          ] =
            await Promise.all(
              [
                loader.loadAsync(
                  MACBOOK_MODEL_URL,
                ),

                loader.loadAsync(
                  PRINTER_MODEL_URL,
                ),
              ],
            );

          if (
            disposed
          ) {
            return;
          }

          const macbook =
            macbookGltf.scene;

          const printer =
            printerGltf.scene;

          collectResources(
            macbook,
          );

          collectResources(
            printer,
          );

          /* =================================================
             DASHBOARD TEXTURE
          ================================================= */

          const textureLoader =
            new THREE.TextureLoader();

          let screenTexture:
            | THREE.Texture
            | undefined;

          if (
            screenUrl
          ) {
            screenTexture =
              await textureLoader
                .loadAsync(
                  screenUrl,
                );

            textures.add(
              screenTexture,
            );
          }

          if (
            disposed
          ) {
            return;
          }

          /* =================================================
             RENDERER
          ================================================= */

          renderer =
            new THREE.WebGLRenderer(
              {
                alpha:
                  true,

                antialias:
                  true,

                powerPreference:
                  "low-power",
              },
            );

          const webgl =
            renderer;

          webgl.setPixelRatio(
            Math.min(
              window.devicePixelRatio,
              1.6,
            ),
          );

          webgl.setClearColor(
            "#edf5fa",
            0,
          );

          webgl.outputColorSpace =
            THREE.SRGBColorSpace;

          webgl.toneMapping =
            THREE.ACESFilmicToneMapping;

          webgl.toneMappingExposure =
            0.98;

          Object.assign(
            webgl.domElement.style,
            {
              display:
                "block",

              width:
                "100%",

              height:
                "100%",

              pointerEvents:
                "none",
            },
          );

          hostElement.appendChild(
            webgl.domElement,
          );

          /* =================================================
             SCENE + CAMERA
          ================================================= */

          const scene =
            new THREE.Scene();

          const camera =
            new THREE.PerspectiveCamera(
              CAMERA_FOV,
              1,
              0.1,
              100,
            );

          camera.position.set(
            CAMERA_POSITION.x,
            CAMERA_POSITION.y,
            CAMERA_POSITION.z,
          );

          camera.lookAt(
            CAMERA_TARGET.x,
            CAMERA_TARGET.y,
            CAMERA_TARGET.z,
          );

          /* =================================================
             ENVIRONMENT
          ================================================= */

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
                0.04,
              );

            scene.environment =
              environment.texture;
          } finally {
            room.dispose();

            pmrem.dispose();
          }

          /* =================================================
             LIGHTS
          ================================================= */

          const key =
            new THREE.DirectionalLight(
              "#fffdfb",
              1.58,
            );

          key.position.set(
            -5,
            7,
            8,
          );

          scene.add(
            key,
          );

          const fill =
            new THREE.DirectionalLight(
              "#dbeeff",
              0.78,
            );

          fill.position.set(
            6,
            3,
            7,
          );

          scene.add(
            fill,
          );

          const rim =
            new THREE.DirectionalLight(
              "#b1d8fa",
              0.7,
            );

          rim.position.set(
            5,
            5,
            -6,
          );

          scene.add(
            rim,
          );

          /* =================================================
             SCREEN
          ================================================= */

          if (
            screenTexture
          ) {
            const candidate =
              findScreenCandidate(
                macbook,
              );

            if (
              candidate
            ) {
              replaceScreen(
                candidate,
                screenTexture,
                webgl,
              );
            }
          }

          tuneMacbookMaterials(
            macbook,
          );

          hideNativePrinterPaper(
            printer,
          );

          tunePrinterMaterials(
            printer,
          );

          /* =================================================
             WORLD ROOT
          ================================================= */

          const composition =
            new THREE.Group();

          scene.add(
            composition,
          );

          /* =================================================
             MACBOOK RIG
          ================================================= */

          normalizeModel(
            macbook,
            MACBOOK_TARGET_SIZE,
          );

          const macbookRig =
            new THREE.Group();

          macbookRig.rotation.set(
            MACBOOK_ROTATION.x,
            MACBOOK_ROTATION.y,
            MACBOOK_ROTATION.z,
          );

          macbookRig.position.set(
            MACBOOK_POSITION.x,
            MACBOOK_POSITION.y,
            MACBOOK_POSITION.z,
          );

          macbookRig.add(
            macbook,
          );

          freezeStaticDescendants(
            macbookRig,
          );

          composition.add(
            macbookRig,
          );

          /* =================================================
             PRINTER RIG
          ================================================= */

          normalizeModel(
            printer,
            PRINTER_TARGET_SIZE,
          );

          const printerRig =
            new THREE.Group();

          printerRig.rotation.set(
            PRINTER_ROTATION.x,
            PRINTER_ROTATION.y,
            PRINTER_ROTATION.z,
          );

          printerRig.position.set(
            PRINTER_POSITION.x,
            PRINTER_POSITION.y,
            PRINTER_POSITION.z,
          );

printerRig.add(
  printer,
);

freezeStaticDescendants(
  printerRig,
);

composition.add(
  printerRig,
);

const floatingDocCard =
  createFloatingDocCard();

const successCard =
  createSuccessCard();

const statsCard =
  createStatsCard();

freezeStaticDescendants(
  floatingDocCard,
);

freezeStaticDescendants(
  successCard,
);

freezeStaticDescendants(
  statsCard,
);

composition.add(
  floatingDocCard,
);

composition.add(
  successCard,
);

composition.add(
  statsCard,
);

          /* =================================================
             RENDER
          ================================================= */

          function render() {
            webgl.render(
              scene,
              camera,
            );
          }

          /* =================================================
             3D POINTER POSE
          ================================================= */

function applyPointerPose() {
  const x =
    currentPointer.x;

  const y =
    currentPointer.y;

  /*
   * MACBOOK — HERO
   */

  macbookRig.position.x =
    MACBOOK_POSITION.x +
    x *
      MACBOOK_POINTER_POSITION.x;

  macbookRig.position.y =
    MACBOOK_POSITION.y -
    y *
      MACBOOK_POINTER_POSITION.y;

  macbookRig.position.z =
    MACBOOK_POSITION.z +
    Math.abs(
      x,
    ) *
      MACBOOK_POINTER_POSITION.z;

  macbookRig.rotation.x =
    MACBOOK_ROTATION.x +
    y *
      MACBOOK_POINTER_ROTATION.x;

  macbookRig.rotation.y =
    MACBOOK_ROTATION.y +
    x *
      MACBOOK_POINTER_ROTATION.y;

  macbookRig.rotation.z =
    MACBOOK_ROTATION.z -
    x *
      MACBOOK_POINTER_ROTATION.z;

  /*
   * PRINTER — OPPOSING
   */

  printerRig.position.x =
    PRINTER_POSITION.x -
    x *
      PRINTER_POINTER_POSITION.x;

  printerRig.position.y =
    PRINTER_POSITION.y +
    y *
      PRINTER_POINTER_POSITION.y;

  printerRig.position.z =
    PRINTER_POSITION.z -
    Math.abs(
      x,
    ) *
      PRINTER_POINTER_POSITION.z;

  printerRig.rotation.x =
    PRINTER_ROTATION.x -
    y *
      PRINTER_POINTER_ROTATION.x;

  printerRig.rotation.y =
    PRINTER_ROTATION.y -
    x *
      PRINTER_POINTER_ROTATION.y;

  printerRig.rotation.z =
    PRINTER_ROTATION.z +
    x *
      PRINTER_POINTER_ROTATION.z;

  /*
   * FLOATING DOCUMENT CARD
   */

  floatingDocCard.position.x =
    FLOATING_DOC_CARD_POSITION.x -
    x *
      0.14;

  floatingDocCard.position.y =
    FLOATING_DOC_CARD_POSITION.y +
    y *
      0.08;

  floatingDocCard.position.z =
    FLOATING_DOC_CARD_POSITION.z -
    Math.abs(
      x,
    ) *
      0.03;

  floatingDocCard.rotation.x =
    FLOATING_DOC_CARD_ROTATION.x -
    y *
      0.018;

  floatingDocCard.rotation.y =
    FLOATING_DOC_CARD_ROTATION.y -
    x *
      0.035;

  floatingDocCard.rotation.z =
    FLOATING_DOC_CARD_ROTATION.z +
    x *
      0.02;

  /*
   * SUCCESS CARD
   */

  successCard.position.x =
    SUCCESS_CARD_POSITION.x -
    x *
      0.12;

  successCard.position.y =
    SUCCESS_CARD_POSITION.y +
    y *
      0.075;

  successCard.position.z =
    SUCCESS_CARD_POSITION.z -
    Math.abs(
      x,
    ) *
      0.022;

  successCard.rotation.x =
    SUCCESS_CARD_ROTATION.x -
    y *
      0.015;

  successCard.rotation.y =
    SUCCESS_CARD_ROTATION.y -
    x *
      0.028;

  successCard.rotation.z =
    SUCCESS_CARD_ROTATION.z +
    x *
      0.012;

  /*
   * STATS CARD
   */

  statsCard.position.x =
    STATS_CARD_POSITION.x -
    x *
      0.15;

statsCard.position.y =
  STATS_CARD_POSITION.y -
  (
    compactLayout
      ? 0.64
      : 0
  ) +
  y * 0.09;

  statsCard.position.z =
    STATS_CARD_POSITION.z -
    Math.abs(
      x,
    ) *
      0.026;

  statsCard.rotation.x =
    STATS_CARD_ROTATION.x -
    y *
      0.018;

  statsCard.rotation.y =
    STATS_CARD_ROTATION.y -
    x *
      0.034;

  statsCard.rotation.z =
    STATS_CARD_ROTATION.z +
    x *
      0.016;
}

          

          /* =================================================
             EVENT-DRIVEN RAF
          ================================================= */

          function tick(
            time:
              number,
          ) {
            animationFrame =
              0;

            if (
              disposed ||
              !visible
            ) {
              previousFrameTime =
                0;

              return;
            }

            const delta =
              previousFrameTime
                ? Math.min(
                    (
                      time -
                      previousFrameTime
                    ) /
                      1000,

                    0.05,
                  )
                : 1 / 60;

            previousFrameTime =
              time;

            const interpolation =
              1 -
              Math.exp(
                -POINTER_DAMPING *
                  delta,
              );

            currentPointer.lerp(
              targetPointer,
              interpolation,
            );

            const distance =
              currentPointer.distanceTo(
                targetPointer,
              );

            if (
              distance <
              POINTER_EPSILON
            ) {
              currentPointer.copy(
                targetPointer,
              );

              previousFrameTime =
                0;
            }

            applyPointerPose();

            render();

            if (
              currentPointer.distanceTo(
                targetPointer,
              ) >=
              POINTER_EPSILON
            ) {
              animationFrame =
                window.requestAnimationFrame(
                  tick,
                );
            }
          }

          function scheduleMotion() {
            if (
              disposed ||
              !visible ||
              animationFrame
            ) {
              return;
            }

            previousFrameTime =
              0;

            animationFrame =
              window.requestAnimationFrame(
                tick,
              );
          }

          /* =================================================
             POINTER
          ================================================= */

          const reducedMotion =
            window.matchMedia(
              "(prefers-reduced-motion: reduce)",
            );

          const finePointer =
            window.matchMedia(
              "(hover: hover) and (pointer: fine)",
            );

          function handlePointerMove(
            event:
              PointerEvent,
          ) {
            if (
              reducedMotion.matches ||
              !finePointer.matches ||
              event.pointerType ===
                "touch"
            ) {
              return;
            }

            const bounds =
              cover?.getBoundingClientRect();

            if (
              !bounds ||
              bounds.width <= 0 ||
              bounds.height <= 0
            ) {
              return;
            }

            const x =
              THREE.MathUtils.clamp(
                (
                  (
                    event.clientX -
                    bounds.left
                  ) /
                  bounds.width
                ) *
                  2 -
                  1,

                -1,
                1,
              );

            const y =
              THREE.MathUtils.clamp(
                (
                  (
                    event.clientY -
                    bounds.top
                  ) /
                  bounds.height
                ) *
                  2 -
                  1,

                -1,
                1,
              );

            targetPointer.set(
              x,
              y,
            );

            scheduleMotion();
          }

          function resetPointer() {
            targetPointer.set(
              0,
              0,
            );

            if (
              reducedMotion.matches
            ) {
              if (
                animationFrame
              ) {
                window.cancelAnimationFrame(
                  animationFrame,
                );

                animationFrame =
                  0;
              }

              currentPointer.set(
                0,
                0,
              );

              applyPointerPose();

              render();

              return;
            }

            scheduleMotion();
          }

          cover?.addEventListener(
            "pointermove",
            handlePointerMove,
            {
              passive:
                true,
            },
          );

          cover?.addEventListener(
            "pointerleave",
            resetPointer,
          );

          cover?.addEventListener(
            "pointercancel",
            resetPointer,
          );

          window.addEventListener(
            "blur",
            resetPointer,
          );

          reducedMotion.addEventListener(
            "change",
            resetPointer,
          );

          /* =================================================
             RESIZE
          ================================================= */

function resize() {
  const width =
    hostElement.clientWidth;

  const height =
    hostElement.clientHeight;

    compactLayout =
  (
    cover?.clientWidth ??
    width
  ) <= 650;

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

  camera.fov =
    CAMERA_FOV;

  const tangent =
    Math.tan(
      THREE.MathUtils.degToRad(
        CAMERA_FOV,
      ) /
        2,
    );

  const verticalFitDistance =
    CAMERA_FIT_HALF_HEIGHT /
    tangent;

  const horizontalFitDistance =
    CAMERA_FIT_HALF_WIDTH /
    (
      tangent *
      camera.aspect
    );

  const fittedDistance =
    Math.max(
      CAMERA_BASE_DISTANCE,
      verticalFitDistance,
      horizontalFitDistance,
    );

  const directionX =
    CAMERA_POSITION.x -
    CAMERA_TARGET.x;

  const directionY =
    CAMERA_POSITION.y -
    CAMERA_TARGET.y;

  const directionZ =
    CAMERA_POSITION.z -
    CAMERA_TARGET.z;

  const distanceScale =
    fittedDistance /
    CAMERA_BASE_DISTANCE;

  camera.position.set(
    CAMERA_TARGET.x +
      directionX *
        distanceScale,

    CAMERA_TARGET.y +
      directionY *
        distanceScale,

    CAMERA_TARGET.z +
      directionZ *
        distanceScale,
  );

  camera.lookAt(
    CAMERA_TARGET.x,
    CAMERA_TARGET.y,
    CAMERA_TARGET.z,
  );

  camera.updateProjectionMatrix();

  applyPointerPose();

  render();
}

          resize();

          resizeObserver =
            new ResizeObserver(
              resize,
            );

          resizeObserver.observe(
            hostElement,
          );

          /* =================================================
             VISIBILITY
          ================================================= */

          if (
            typeof IntersectionObserver !==
            "undefined"
          ) {
            visibilityObserver =
              new IntersectionObserver(
                (
                  entries,
                ) => {
                  visible =
                    Boolean(
                      entries[0]
                        ?.isIntersecting,
                    );

                  if (
                    !visible
                  ) {
                    if (
                      animationFrame
                    ) {
                      window.cancelAnimationFrame(
                        animationFrame,
                      );

                      animationFrame =
                        0;
                    }

                    previousFrameTime =
                      0;

                    return;
                  }

                  render();

                  if (
                    currentPointer.distanceTo(
                      targetPointer,
                    ) >
                    POINTER_EPSILON
                  ) {
                    scheduleMotion();
                  }
                },
                {
                  threshold:
                    0.01,
                },
              );

            visibilityObserver.observe(
              hostElement,
            );
          }

          /* =================================================
             INITIAL STATE
          ================================================= */

          currentPointer.set(
            0,
            0,
          );

          targetPointer.set(
            0,
            0,
          );

          applyPointerPose();

          render();

          if (
            !disposed
          ) {
            setReady(
              true,
            );
          }

          /* =================================================
             EXTEND CLEANUP
          ================================================= */

          const baseCleanup =
            cleanup;

          cleanup =
            () => {
              cover?.removeEventListener(
                "pointermove",
                handlePointerMove,
              );

              cover?.removeEventListener(
                "pointerleave",
                resetPointer,
              );

              cover?.removeEventListener(
                "pointercancel",
                resetPointer,
              );

              window.removeEventListener(
                "blur",
                resetPointer,
              );

              reducedMotion.removeEventListener(
                "change",
                resetPointer,
              );

              baseCleanup();
            };
        } catch (
          error
        ) {
          console.error(
            "[BAST Scene] gagal dimuat:",
            error,
          );

          if (
            !disposed
          ) {
            setReady(
              false,
            );
          }
        }
      }

      void initialize();

      return () => {
        disposed =
          true;

        cleanup();
      };
    },
    [
      screenUrl,
    ],
  );

  return (
    <div
      ref={
        hostRef
      }
      role="img"
      aria-label={
        label
      }
      style={{
        position:
          "absolute",

        inset:
          0,

        opacity:
          ready
            ? 1
            : 0,

        transition:
          "opacity 500ms cubic-bezier(0.16, 1, 0.3, 1)",

        pointerEvents:
          "none",
      }}
    />
  );
}