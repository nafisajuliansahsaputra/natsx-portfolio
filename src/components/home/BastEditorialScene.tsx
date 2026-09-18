"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

type Props = {
  screenUrl: string | null;
  documentUrl: string | null;
  label: string;
};

type ScreenCandidate = {
  mesh: THREE.Mesh;
  materialIndex: number;
  score: number;
  surfaceAspect: number;
  sourceTexture: THREE.Texture | null;
};

const MACBOOK_MODEL_URL = "/models/bast/macbook-pro.glb";
const PRINTER_MODEL_URL = "/models/bast/printer.glb";

/* =========================================================
   LAPTOP — LOCK
========================================================= */

const CAMERA_FOV = 30.5;

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

const MACBOOK_TARGET_SIZE = 5.8;

const MACBOOK_ROTATION = {
  x: -0.015,
  y: -0.45,
  z: -0.145,
};

const MACBOOK_POSITION = {
  x: -2.65,
  y: 0,
  z: 0.14,
};

/* =========================================================
   PRINTER BODY — LOCK
========================================================= */

const PRINTER_TARGET_SIZE = 3.02;

const PRINTER_ROTATION = {
  x: -0.025,
  y: -0.44,
  z: 0.005,
};

const PRINTER_POSITION = {
  x: 3.08,
  y: -1.5,
  z: -1.2,
};

/* ========================================================= */

const SCREEN_NAME_HINT =
  /(screen|display|lcd|monitor|panel|retina)/i;

const SCREEN_NEGATIVE_HINT =
  /(keyboard|keycap|key_|trackpad|touchpad|base|bottom|aluminium|aluminum|metal|body|case|shell|logo|apple)/i;

const PRINTER_PAPER_HINT =
  /(paper|page|sheet|document|a4|printout|print_out|output.?paper)/i;

export default function BastEditorialScene(props: Props) {
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
    useState(false);

useEffect(() => {
  const currentHost = hostRef.current;

  if (!currentHost) {
    return;
  }

  const hostElement: HTMLDivElement = currentHost;

  let disposed = false;

    let animationFrame =
      0;

    let visible =
      true;

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

    const pointer = {
      x: 0,
      y: 0,
    };

    /* =====================================================
       RESOURCE
    ===================================================== */

    function keepGeometry<
      T extends THREE.BufferGeometry,
    >(
      geometry: T,
    ) {
      geometries.add(
        geometry,
      );

      return geometry;
    }

    function keepMaterial<
      T extends THREE.Material,
    >(
      material: T,
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
        (object) => {
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

          const materialList =
            Array.isArray(
              object.material,
            )
              ? object.material
              : [
                  object.material,
                ];

          materialList.forEach(
            (material) => {
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
                  (texture) => {
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

    function cleanup() {
      window.cancelAnimationFrame(
        animationFrame,
      );

      window.removeEventListener(
        "pointermove",
        handlePointerMove,
      );

      resizeObserver
        ?.disconnect();

      visibilityObserver
        ?.disconnect();

      environment
        ?.dispose();

      geometries.forEach(
        (geometry) =>
          geometry.dispose(),
      );

      materials.forEach(
        (material) =>
          material.dispose(),
      );

      textures.forEach(
        (texture) =>
          texture.dispose(),
      );

      geometries.clear();
      materials.clear();
      textures.clear();

      if (renderer) {
        renderer.dispose();

        renderer.domElement
          .remove();

        renderer =
          null;
      }
    }

    function handlePointerMove(
      event:
        PointerEvent,
    ) {
      pointer.x =
        (
          event.clientX /
          window.innerWidth
        ) *
          2 -
        1;

      pointer.y =
        (
          event.clientY /
          window.innerHeight
        ) *
          2 -
        1;
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
              width?: number;
              height?: number;
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
       NORMALIZE
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

      if (largest > 0) {
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

    /* =====================================================
       SCREEN
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
        (object) => {
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
                      width?: number;
                      height?: number;
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
        candidate
          .sourceTexture
          ?.flipY ??
        false;

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
        (object) => {
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
            (material) => {
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
       PRINTER PAPER CLEANUP
    ===================================================== */

    function hideNativePrinterPaper(
      model:
        THREE.Object3D,
    ) {
      model.traverse(
        (object) => {
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
                (material) =>
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

    /* =====================================================
       PRINTER MATERIAL
    ===================================================== */

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
        (object) => {
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
            (material) => {
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

    function createTopAnchoredPaperGeometry(
      width:
        number,

      height:
        number,

      curve:
        number,
    ) {
      const geometry =
        keepGeometry(
          new THREE.PlaneGeometry(
            width,
            height,
            4,
            20,
          ),
        );

      const position =
        geometry.attributes
          .position as
          THREE.BufferAttribute;

      for (
        let i =
          0;

        i <
        position.count;

        i +=
        1
      ) {
        const y =
          position.getY(
            i,
          );

        const normalizedY =
          THREE.MathUtils.clamp(
            y /
              height +
              0.5,

            0,

            1,
          );

        const bend =
          Math.sin(
            normalizedY *
              Math.PI,
          ) *
          curve;

        position.setZ(
          i,
          bend,
        );
      }

      position.needsUpdate =
        true;

      geometry.translate(
        0,
        -height /
          2,
        0,
      );

      geometry.computeVertexNormals();

      return geometry;
    }

    function createRearPaper() {
      const geometry =
        createTopAnchoredPaperGeometry(
          1.12,
          1.48,
          0.035,
        );

      const material =
        keepMaterial(
          new THREE.MeshStandardMaterial(
            {
              color:
                "#f8fafc",

              roughness:
                0.75,

              metalness:
                0,

              side:
                THREE.DoubleSide,
            },
          ),
        );

      const paper =
        new THREE.Mesh(
          geometry,
          material,
        );

      paper.position.set(
        0.03,
        1.82,
        -0.34,
      );

      paper.rotation.set(
        -0.08,
        0.01,
        -0.015,
      );

      return paper;
    }

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

        if (disposed) {
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

        const textureLoader =
          new THREE.TextureLoader();

        let screenTexture:
          | THREE.Texture
          | undefined;

        if (screenUrl) {
          screenTexture =
            await textureLoader
              .loadAsync(
                screenUrl,
              );

          textures.add(
            screenTexture,
          );
        }

        if (disposed) {
          return;
        }

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
            1.75,
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

          if (candidate) {
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
           ROOT
        ================================================= */

        const composition =
          new THREE.Group();

        scene.add(
          composition,
        );

        /* =================================================
           MACBOOK — LOCK
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

        composition.add(
          macbookRig,
        );

        /* =================================================
           PRINTER — LOCK
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

        printerRig.add(
          createRearPaper(),
        );

        composition.add(
          printerRig,
        );

        /* =================================================
           RESIZE
        ================================================= */

        function resize() {
          const width =
            Math.max(
              hostElement.clientWidth,
              1,
            );

          const height =
            Math.max(
              hostElement.clientHeight,
              1,
            );

          webgl.setSize(
            width,
            height,
            false,
          );

          camera.aspect =
            width /
            height;

          camera.updateProjectionMatrix();

          camera.lookAt(
            CAMERA_TARGET.x,
            CAMERA_TARGET.y,
            CAMERA_TARGET.z,
          );
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
              (entries) => {
                visible =
                  Boolean(
                    entries[0]
                      ?.isIntersecting,
                  );
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
           MOTION
        ================================================= */

        const reduceMotion =
          window.matchMedia(
            "(prefers-reduced-motion: reduce)",
          ).matches;

        if (
          !reduceMotion
        ) {
          window.addEventListener(
            "pointermove",
            handlePointerMove,
            {
              passive:
                true,
            },
          );
        }

        const clock =
          new THREE.Clock();

        function animate() {
          if (disposed) {
            return;
          }

          animationFrame =
            window.requestAnimationFrame(
              animate,
            );

          if (!visible) {
            return;
          }

          const elapsed =
            clock.getElapsedTime();

          if (
            !reduceMotion
          ) {
            macbookRig.rotation.x =
              THREE.MathUtils.lerp(
                macbookRig.rotation.x,

                MACBOOK_ROTATION.x +
                  pointer.y *
                    0.0015,

                0.045,
              );

            macbookRig.rotation.y =
              THREE.MathUtils.lerp(
                macbookRig.rotation.y,

                MACBOOK_ROTATION.y +
                  pointer.x *
                    0.003,

                0.045,
              );

            macbookRig.position.y =
              MACBOOK_POSITION.y +
              Math.sin(
                elapsed *
                  0.62,
              ) *
                0.005;

            printerRig.rotation.y =
              THREE.MathUtils.lerp(
                printerRig.rotation.y,

                PRINTER_ROTATION.y +
                  pointer.x *
                    0.002,

                0.04,
              );

            printerRig.position.y =
              PRINTER_POSITION.y +
              Math.sin(
                elapsed *
                  0.55 +
                  1.3,
              ) *
                0.004;
          }

          webgl.render(
            scene,
            camera,
          );
        }

        animate();

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
  }, [
    screenUrl,
  ]);

  return (
    <div
      ref={hostRef}
      role="img"
      aria-label={label}
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
      }}
    />
  );
}