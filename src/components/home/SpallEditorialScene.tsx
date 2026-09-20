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

import {
  createShadowFactory,
  createTileFactory,
} from "./spall-editorial/builders";

import {
  createSceneResources,
} from "./spall-editorial/resources";

import {
  canvasTexture,
  roundedRect,
  shadowTexture,
} from "./spall-editorial/textures";

type Props = {
  screenUrl:
    string | null;

  label:
    string;
};

const MODEL_URL =
  "/models/iphone-17-pro-max.glb";

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

export default function SpallEditorialScene(
  props:
    Props,
) {
  return (
    <Scene
      key={
        props.screenUrl ??
        "original"
      }
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
      const hostNode =
        hostRef.current;

      if (
        !hostNode
      ) {
        return;
      }

      const host:
        HTMLDivElement =
          hostNode;

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

      let visibilityObserver:
        | IntersectionObserver
        | undefined;

      let cleanupMotion:
        | (() => void)
        | undefined;

      const {
        geometries,
        textures,
        keepMaterial,
        makeMesh,
        collect,
        disposeAssets,
      } =
        createSceneResources();

      function handleContextLost() {
        cleanupMotion?.();

        if (
          !disposed
        ) {
          setReady(
            false,
          );
        }
      }

      function release() {
        cleanupMotion?.();

        cleanupMotion =
          undefined;

        resizeObserver
          ?.disconnect();

        visibilityObserver
          ?.disconnect();

        environment
          ?.dispose();

        environment =
          undefined;

        disposeAssets();

        if (
          renderer
        ) {
          renderer.domElement
            .removeEventListener(
              "webglcontextlost",
              handleContextLost,
            );

          renderer.dispose();

          renderer.domElement
            .remove();

          renderer =
            undefined;
        }
      }

      async function initialize() {
        try {
          /* =================================================
             LOAD MODEL + SCREEN IN PARALLEL
          ================================================= */

          const modelLoader =
            new GLTFLoader();

          const textureLoader =
            new THREE.TextureLoader();

          const [
            gltf,
            screenshot,
          ] =
            await Promise.all(
              [
                modelLoader.loadAsync(
                  MODEL_URL,
                ),

                screenUrl
                  ? textureLoader.loadAsync(
                      screenUrl,
                    )
                  : Promise.resolve(
                      undefined,
                    ),
              ],
            );

          const model =
            gltf.scene;

          collect(
            model,
          );

          if (
            screenshot
          ) {
            textures.add(
              screenshot,
            );
          }

          if (
            disposed
          ) {
            disposeAssets();

            return;
          }

          if (
            screenshot
          ) {
            screenshot.colorSpace =
              THREE.SRGBColorSpace;

            screenshot.flipY =
              true;
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
              1.5,
            ),
          );

          webgl.setClearColor(
            "#f3f0e8",
            0,
          );

          webgl.outputColorSpace =
            THREE.SRGBColorSpace;

          webgl.toneMapping =
            THREE.ACESFilmicToneMapping;

          webgl.toneMappingExposure =
            1;

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

          host.appendChild(
            webgl.domElement,
          );

          webgl.domElement
            .addEventListener(
              "webglcontextlost",
              handleContextLost,
            );

          /* =================================================
             SCENE + CAMERA
          ================================================= */

          const scene =
            new THREE.Scene();

          const camera =
            new THREE.PerspectiveCamera(
              32,
              1,
              0.1,
              100,
            );

          camera.position.set(
            0,
            0,
            14,
          );

          /* =================================================
             ENVIRONMENT
          ================================================= */

          const room =
            new RoomEnvironment();

          const softboxMaterial =
            new THREE.MeshBasicMaterial(
              {
                color:
                  new THREE.Color(
                    5,
                    5,
                    5,
                  ),

                side:
                  THREE.DoubleSide,
              },
            );

          const softboxGeometry =
            new THREE.PlaneGeometry(
              3,
              7,
            );

          const softbox =
            new THREE.Mesh(
              softboxGeometry,
              softboxMaterial,
            );

          softbox.position.set(
            -4,
            3,
            5,
          );

          softbox.lookAt(
            0,
            0,
            0,
          );

          room.add(
            softbox,
          );

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

            softboxGeometry
              .dispose();

            softboxMaterial
              .dispose();
          }

          /* =================================================
             LIGHTS
          ================================================= */

          const key =
            new THREE.DirectionalLight(
              "#fff7ea",
              1.1,
            );

          key.position.set(
            -4,
            6,
            8,
          );

          scene.add(
            key,
          );

          const rim =
            new THREE.DirectionalLight(
              "#e6eee6",
              0.7,
            );

          rim.position.set(
            5,
            3,
            -4,
          );

          scene.add(
            rim,
          );

          /* =================================================
             ROOT RIG
          ================================================= */

          const rig =
            new THREE.Group();

          scene.add(
            rig,
          );

          /* =================================================
             IPHONE MATERIALS + SCREEN
          ================================================= */

          let foundScreen =
            false;

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

              const materialList:
                THREE.Material[] =
                Array.isArray(
                  object.material,
                )
                  ? object.material
                  : [
                      object.material,
                    ];

              const nextMaterials =
                materialList.map(
                  (
                    material,
                  ) => {
                    if (
                      material.name ===
                        "17ProMax_color" &&
                      material instanceof
                        THREE.MeshStandardMaterial
                    ) {
                      material.color.set(
                        "#7b887d",
                      );

                      material.metalness =
                        1;

                      material.roughness =
                        0.21;

                      material.envMapIntensity =
                        1;
                    }

                    if (
                      material.name ===
                        "17ProMax_glass" &&
                      material instanceof
                        THREE.MeshPhysicalMaterial
                    ) {
                      material.color.set(
                        "#ffffff",
                      );

                      material.transmission =
                        0;

                      material.transparent =
                        true;

                      material.opacity =
                        0.025;

                      material.depthWrite =
                        false;

                      material.roughness =
                        0.13;

                      material.clearcoat =
                        0.4;

                      material.needsUpdate =
                        true;
                    }

                    if (
                      material.name ===
                        "17ProMax_2112" ||
                      material.name ===
                        "17ProMax_Lens2"
                    ) {
                      return keepMaterial(
                        new THREE.MeshBasicMaterial(
                          {
                            name:
                              material.name,

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
                      material.name !==
                      "17ProMax_Screen"
                    ) {
                      return material;
                    }

                    foundScreen =
                      true;

                    if (
                      !screenshot
                    ) {
                      return material;
                    }

                    const geometry =
                      object.geometry;

                    geometry
                      .computeBoundingBox();

                    const bounds =
                      geometry
                        .boundingBox;

                    if (
                      !bounds
                    ) {
                      return material;
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
                      screenshot.image as
                        {
                          width:
                            number;

                          height:
                            number;
                        };

                    const imageAspect =
                      image.width /
                      image.height;

                    const screenAspect =
                      width /
                      height;

                    screenshot.repeat.set(
                      1,
                      1,
                    );

                    screenshot.offset.set(
                      0,
                      0,
                    );

                    if (
                      imageAspect >
                      screenAspect
                    ) {
                      screenshot.repeat.x =
                        screenAspect /
                        imageAspect;

                      screenshot.offset.x =
                        (
                          1 -
                          screenshot.repeat.x
                        ) /
                        2;
                    } else {
                      screenshot.repeat.y =
                        imageAspect /
                        screenAspect;

                      screenshot.offset.y =
                        1 -
                        screenshot.repeat.y;
                    }

                    screenshot.anisotropy =
                      Math.min(
                        webgl.capabilities
                          .getMaxAnisotropy(),

                        8,
                      );

                    screenshot.needsUpdate =
                      true;

                    return keepMaterial(
                      new THREE.MeshBasicMaterial(
                        {
                          name:
                            "17ProMax_Screen",

                          map:
                            screenshot,

                          toneMapped:
                            false,

                          side:
                            THREE.DoubleSide,
                        },
                      ),
                    );
                  },
                );

              object.material =
                Array.isArray(
                  object.material,
                )
                  ? nextMaterials
                  : nextMaterials[
                      0
                    ];
            },
          );

          if (
            !foundScreen
          ) {
            throw new Error(
              "Material layar tidak ditemukan.",
            );
          }

          /* =================================================
             DYNAMIC ISLAND
          ================================================= */

          const island =
            makeMesh(
              new THREE.ShapeGeometry(
                roundedRect(
                  0.0232,
                  0.00625,
                  0.003125,
                ),
                32,
              ),

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

          island.position.set(
            -0.0000973,
            0.1546617,
            -0.00496,
          );

          model.add(
            island,
          );

          const lens =
            makeMesh(
              new THREE.CircleGeometry(
                0.0009,
                24,
              ),

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

          lens.position.set(
            -0.0084687,
            0.1546617,
            -0.00498,
          );

          model.add(
            lens,
          );

          /* =================================================
             NORMALIZE PHONE
          ================================================= */

          model.rotation.y =
            Math.PI;

          model.updateMatrixWorld(
            true,
          );

          const modelBounds =
            new THREE.Box3()
              .setFromObject(
                model,
              );

          const modelSize =
            modelBounds.getSize(
              new THREE.Vector3(),
            );

          if (
            modelSize.y <=
            0
          ) {
            throw new Error(
              "Dimensi model tidak valid.",
            );
          }

          model.position.sub(
            modelBounds.getCenter(
              new THREE.Vector3(),
            ),
          );

          const phone =
            new THREE.Group();

          phone.add(
            model,
          );

          phone.scale.setScalar(
            5.5 /
              modelSize.y,
          );

          phone.rotation.set(
            0.07,
            -0.38,
            -0.22,
          );

          phone.position.set(
            0.1,
            0.02,
            0,
          );

          freezeStaticDescendants(
            phone,
          );

          rig.add(
            phone,
          );

          /* =================================================
             FLOATING MATERIALS
          ================================================= */

          const glassTileMaterial =
            keepMaterial(
              new THREE.MeshPhysicalMaterial(
                {
                  color:
                    "#faf6e9",

                  metalness:
                    0,

                  roughness:
                    0.16,

                  transmission:
                    0.58,

                  thickness:
                    0.15,

                  ior:
                    1.46,

                  clearcoat:
                    1,

                  clearcoatRoughness:
                    0.07,

                  envMapIntensity:
                    1,
                },
              ),
            );

          const glassTileSideMaterial =
            keepMaterial(
              new THREE.MeshPhysicalMaterial(
                {
                  color:
                    "#c5d1c7",

                  metalness:
                    0.03,

                  roughness:
                    0.12,

                  transmission:
                    0.36,

                  thickness:
                    0.22,

                  ior:
                    1.46,

                  clearcoat:
                    1,

                  clearcoatRoughness:
                    0.045,

                  envMapIntensity:
                    1.25,
                },
              ),
            );

          const greenMaterial =
            keepMaterial(
              new THREE.MeshPhysicalMaterial(
                {
                  color:
                    "#123c29",

                  metalness:
                    0.45,

                  roughness:
                    0.18,

                  clearcoat:
                    1,

                  clearcoatRoughness:
                    0.06,
                },
              ),
            );

          /* =================================================
             TILES
          ================================================= */

          const tile =
            createTileFactory(
              {
                rig,
                geometries,
                textures,
                makeMesh,
                glassTileMaterial,
                glassTileSideMaterial,
                greenMaterial,
              },
            );

          const identity =
            tile(
              "identity",
              [
                -1.95,
                1.9,
                0.18,
              ],
              [
                0.09,
                0.28,
                -0.17,
              ],
            );

          const share =
            tile(
              "share",
              [
                2.2,
                0.92,
                0.38,
              ],
              [
                0.04,
                -0.27,
                0.14,
              ],
              true,
            );

          const explore =
            tile(
              "explore",
              [
                2.13,
                -1.45,
                1,
              ],
              [
                0.12,
                -0.22,
                0.25,
              ],
            );

          freezeStaticDescendants(
            identity,
          );

          freezeStaticDescendants(
            share,
          );

          freezeStaticDescendants(
            explore,
          );

          /* =================================================
             MARBLE
          ================================================= */

          const marble =
            makeMesh(
              new THREE.SphereGeometry(
                0.57,
                48,
                36,
              ),

              new THREE.MeshPhysicalMaterial(
                {
                  color:
                    "#dfdacd",

                  roughness:
                    0.44,

                  metalness:
                    0,

                  clearcoat:
                    0.18,

                  clearcoatRoughness:
                    0.4,

                  envMapIntensity:
                    0.72,
                },
              ),
            );

          marble.position.set(
            -2.05,
            -1.64,
            0.9,
          );

          rig.add(
            marble,
          );

          const marbleText =
            canvasTexture(
              (
                context,
              ) => {
                context.fillStyle =
                  "#58645b";

                context.font =
                  "600 38px Arial";

                context.textAlign =
                  "center";

                context.fillText(
                  "YOUR",
                  256,
                  188,
                );

                context.fillText(
                  "PEOPLE",
                  256,
                  246,
                );

                context.fillText(
                  "ANYWHERE",
                  256,
                  304,
                );

                context.fillStyle =
                  "#7c857d";

                context.fillRect(
                  224,
                  350,
                  64,
                  4,
                );
              },
            );

          textures.add(
            marbleText,
          );

          const marbleLabel =
            makeMesh(
              new THREE.PlaneGeometry(
                0.68,
                0.68,
              ),

              new THREE.MeshBasicMaterial(
                {
                  map:
                    marbleText,

                  transparent:
                    true,

                  depthWrite:
                    false,

                  toneMapped:
                    false,
                },
              ),
            );

          marbleLabel.position.set(
            -2.05,
            -1.64,
            1.5,
          );

          rig.add(
            marbleLabel,
          );

          /* =================================================
             PEARLS
          ================================================= */

          const greenPearl =
            makeMesh(
              new THREE.SphereGeometry(
                0.14,
                32,
                24,
              ),

              greenMaterial,
            );

          greenPearl.position.set(
            -2.18,
            -0.46,
            1.05,
          );

          rig.add(
            greenPearl,
          );

          const glassPearl =
            makeMesh(
              new THREE.SphereGeometry(
                0.16,
                32,
                24,
              ),

              new THREE.MeshPhysicalMaterial(
                {
                  color:
                    "#e8eee5",

                  transmission:
                    0.96,

                  thickness:
                    0.32,

                  ior:
                    1.46,

                  roughness:
                    0.04,

                  metalness:
                    0,

                  clearcoat:
                    1,

                  clearcoatRoughness:
                    0.02,

                  transparent:
                    true,

                  opacity:
                    0.9,

                  envMapIntensity:
                    0.95,
                },
              ),
            );

          glassPearl.position.set(
            1.95,
            2.32,
            0.48,
          );

          rig.add(
            glassPearl,
          );

          /* =================================================
             SHADOWS
          ================================================= */

          const shadowMap =
            shadowTexture();

          textures.add(
            shadowMap,
          );

          const addShadow =
            createShadowFactory(
              {
                rig,
                makeMesh,
                shadowMap,
              },
            );

          const phoneAmbientShadow =
            addShadow(
              {
                width:
                  2.78,

                height:
                  0.5,

                x:
                  0.58,

                y:
                  -2.47,

                z:
                  -1.08,

                opacity:
                  0.24,

                rotation:
                  -0.18,
              },
            );

          const phoneContactShadow =
            addShadow(
              {
                width:
                  1.12,

                height:
                  0.13,

                x:
                  0.79,

                y:
                  -2.31,

                z:
                  -0.87,

                opacity:
                  0.54,

                rotation:
                  -0.22,
              },
            );

          const identityShadow =
            addShadow(
              {
                width:
                  0.98,

                height:
                  0.25,

                x:
                  -1.9,

                y:
                  1.68,

                z:
                  -0.03,

                opacity:
                  0.19,

                rotation:
                  -0.16,
              },
            );

          const shareShadow =
            addShadow(
              {
                width:
                  0.9,

                height:
                  0.24,

                x:
                  2.22,

                y:
                  0.72,

                z:
                  0.08,

                opacity:
                  0.26,

                rotation:
                  0.12,
              },
            );

          const exploreShadow =
            addShadow(
              {
                width:
                  0.92,

                height:
                  0.19,

                x:
                  2.13,

                y:
                  -1.67,

                z:
                  0.51,

                opacity:
                  0.38,

                rotation:
                  0.23,
              },
            );

          const marbleShadow =
            addShadow(
              {
                width:
                  0.92,

                height:
                  0.22,

                x:
                  -2.03,

                y:
                  -1.99,

                z:
                  0.27,

                opacity:
                  0.29,

                rotation:
                  -0.02,
              },
            );

          const greenPearlShadow =
            addShadow(
              {
                width:
                  0.29,

                height:
                  0.085,

                x:
                  -2.16,

                y:
                  -0.62,

                z:
                  0.56,

                opacity:
                  0.26,

                rotation:
                  -0.03,
              },
            );

          const glassPearlShadow =
            addShadow(
              {
                width:
                  0.3,

                height:
                  0.075,

                x:
                  2,

                y:
                  2.14,

                z:
                  0.06,

                opacity:
                  0.11,

                rotation:
                  0.02,
              },
            );

          /* =================================================
             RENDER
          ================================================= */

          let visible =
            true;

          function render() {
            if (
              disposed ||
              !visible ||
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

          /* =================================================
             RESIZE
          ================================================= */

          function resize() {
            const width =
              host.clientWidth;

            const height =
              host.clientHeight;

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

            const tangent =
              Math.tan(
                THREE.MathUtils
                  .degToRad(
                    camera.fov,
                  ) /
                  2,
              );

            camera.position.z =
              Math.max(
                3.45 /
                  tangent,

                3.5 /
                  (
                    tangent *
                    camera.aspect
                  ),
              );

            camera
              .updateProjectionMatrix();

            render();
          }

          resizeObserver =
            new ResizeObserver(
              resize,
            );

          resizeObserver.observe(
            host,
          );

          /* =================================================
             POINTER
          ================================================= */

          const cover =
            host.closest<HTMLElement>(
              '[data-spall-featured="true"]',
            );

          const reduced =
            window.matchMedia(
              "(prefers-reduced-motion: reduce)",
            );

          const finePointer =
            window.matchMedia(
              "(hover: hover) and (pointer: fine)",
            );

          const target =
            new THREE.Vector2();

          const current =
            new THREE.Vector2();

          let frame =
            0;

          let previous =
            0;

          /* =================================================
             3D OPPOSING DEPTH
          ================================================= */

          function applyPose() {
            const x =
              current.x;

            const y =
              current.y;

            /*
             * Root movement sangat kecil.
             */

            rig.rotation.x =
              y *
              0.004;

            rig.rotation.y =
              x *
              0.007;

            /*
             * IPHONE — HERO
             * mengikuti cursor.
             */

            phone.position.x =
              0.1 +
              x *
                0.18;

            phone.position.y =
              0.02 -
              y *
                0.12;

            phone.position.z =
              Math.abs(
                x,
              ) *
                0.035 +
              Math.abs(
                y,
              ) *
                0.018;

            phone.rotation.x =
              0.07 +
              y *
                0.03;

            phone.rotation.y =
              -0.38 +
              x *
                0.075;

            phone.rotation.z =
              -0.22 -
              x *
                0.012;

            /*
             * Phone shadows.
             */

            phoneAmbientShadow
              .position.x =
              0.58 +
              x *
                0.14;

            phoneAmbientShadow
              .position.y =
              -2.47 -
              y *
                0.06;

            phoneContactShadow
              .position.x =
              0.79 +
              x *
                0.11;

            phoneContactShadow
              .position.y =
              -2.31 -
              y *
                0.048;

            /*
             * IDENTITY — opposite.
             */

            identity.position.x =
              -1.95 -
              x *
                0.115;

            identity.position.y =
              1.9 +
              y *
                0.072;

            identity.position.z =
              0.18 -
              Math.abs(
                x,
              ) *
                0.018;

            identity.rotation.x =
              0.09 -
              y *
                0.012;

            identity.rotation.y =
              0.28 -
              x *
                0.026;

            identity.rotation.z =
              -0.17 +
              x *
                0.008;

            identityShadow
              .position.x =
              -1.9 -
              x *
                0.09;

            identityShadow
              .position.y =
              1.68 +
              y *
                0.056;

            /*
             * SHARE — opposite.
             */

            share.position.x =
              2.2 -
              x *
                0.135;

            share.position.y =
              0.92 +
              y *
                0.082;

            share.position.z =
              0.38 -
              Math.abs(
                x,
              ) *
                0.022;

            share.rotation.x =
              0.04 -
              y *
                0.014;

            share.rotation.y =
              -0.27 -
              x *
                0.03;

            share.rotation.z =
              0.14 +
              x *
                0.011;

            shareShadow
              .position.x =
              2.22 -
              x *
                0.105;

            shareShadow
              .position.y =
              0.72 +
              y *
                0.064;

            shareShadow
              .rotation.z =
              0.12 +
              x *
                0.009;

            /*
             * EXPLORE — opposite.
             */

            explore.position.x =
              2.13 -
              x *
                0.165;

            explore.position.y =
              -1.45 +
              y *
                0.1;

            explore.position.z =
              1 -
              Math.abs(
                x,
              ) *
                0.028;

            explore.rotation.x =
              0.12 -
              y *
                0.017;

            explore.rotation.y =
              -0.22 -
              x *
                0.035;

            explore.rotation.z =
              0.25 +
              x *
                0.013;

            exploreShadow
              .position.x =
              2.13 -
              x *
                0.125;

            exploreShadow
              .position.y =
              -1.67 +
              y *
                0.076;

            /*
             * MARBLE — opposite.
             */

            marble.position.x =
              -2.05 -
              x *
                0.085;

            marble.position.y =
              -1.64 +
              y *
                0.052;

            marble.position.z =
              0.9 -
              Math.abs(
                x,
              ) *
                0.012;

            marbleLabel
              .position.x =
              -2.05 -
              x *
                0.085;

            marbleLabel
              .position.y =
              -1.64 +
              y *
                0.052;

            marbleLabel
              .position.z =
              1.5 -
              Math.abs(
                x,
              ) *
                0.012;

            marbleShadow
              .position.x =
              -2.03 -
              x *
                0.067;

            marbleShadow
              .position.y =
              -1.99 +
              y *
                0.04;

            /*
             * GREEN PEARL — opposite.
             */

            greenPearl
              .position.x =
              -2.18 -
              x *
                0.12;

            greenPearl
              .position.y =
              -0.46 +
              y *
                0.07;

            greenPearl
              .position.z =
              1.05 -
              Math.abs(
                x,
              ) *
                0.018;

            greenPearlShadow
              .position.x =
              -2.16 -
              x *
                0.09;

            greenPearlShadow
              .position.y =
              -0.62 +
              y *
                0.052;

            /*
             * GLASS PEARL — opposite.
             */

            glassPearl
              .position.x =
              1.95 -
              x *
                0.1;

            glassPearl
              .position.y =
              2.32 +
              y *
                0.06;

            glassPearl
              .position.z =
              0.48 -
              Math.abs(
                x,
              ) *
                0.014;

            glassPearlShadow
              .position.x =
              2 -
              x *
                0.076;

            glassPearlShadow
              .position.y =
              2.14 +
              y *
                0.045;
          }

          /* =================================================
             EVENT-DRIVEN RAF
          ================================================= */

          function tick(
            time:
              number,
          ) {
            frame =
              0;

            if (
              disposed ||
              !visible ||
              webgl
                .getContext()
                .isContextLost()
            ) {
              previous =
                0;

              return;
            }

            const delta =
              previous
                ? Math.min(
                    (
                      time -
                      previous
                    ) /
                      1000,

                    0.05,
                  )
                : 1 /
                  60;

            previous =
              time;

            current.lerp(
              target,

              1 -
                Math.exp(
                  -7.2 *
                    delta,
                ),
            );

            if (
              current.distanceTo(
                target,
              ) <
              0.00045
            ) {
              current.copy(
                target,
              );

              previous =
                0;
            } else {
              frame =
                window.requestAnimationFrame(
                  tick,
                );
            }

            applyPose();

            render();
          }

          function schedule() {
            if (
              frame ||
              !visible ||
              disposed
            ) {
              return;
            }

            previous =
              0;

            frame =
              window.requestAnimationFrame(
                tick,
              );
          }

          let pointerFrame =
            0;

          let pointerClientX =
            0;

          let pointerClientY =
            0;

          function applyPointerTarget() {
            pointerFrame =
              0;

            if (
              !cover ||
              reduced.matches ||
              !finePointer.matches
            ) {
              return;
            }

            const rect =
              cover.getBoundingClientRect();

            if (
              !rect.width ||
              !rect.height
            ) {
              return;
            }

            target.set(
              THREE.MathUtils.clamp(
                (
                  (
                    pointerClientX -
                    rect.left
                  ) /
                    rect.width
                ) *
                  2 -
                  1,

                -1,
                1,
              ),

              THREE.MathUtils.clamp(
                (
                  (
                    pointerClientY -
                    rect.top
                  ) /
                    rect.height
                ) *
                  2 -
                  1,

                -1,
                1,
              ),
            );

            schedule();
          }

          function move(
            event:
              PointerEvent,
          ) {
            if (
              !cover ||
              event.pointerType ===
                "touch" ||
              reduced.matches ||
              !finePointer.matches
            ) {
              return;
            }

            pointerClientX =
              event.clientX;

            pointerClientY =
              event.clientY;

            if (
              pointerFrame
            ) {
              return;
            }

            pointerFrame =
              window.requestAnimationFrame(
                applyPointerTarget,
              );
          }

          function reset() {
            if (
              pointerFrame
            ) {
              window.cancelAnimationFrame(
                pointerFrame,
              );

              pointerFrame =
                0;
            }

            target.set(
              0,
              0,
            );

            if (
              reduced.matches
            ) {
              if (
                frame
              ) {
                window.cancelAnimationFrame(
                  frame,
                );

                frame =
                  0;
              }

              previous =
                0;

              current.set(
                0,
                0,
              );

              applyPose();

              render();

              return;
            }

            schedule();
          }

          cover?.addEventListener(
            "pointermove",
            move,
            {
              passive:
                true,
            },
          );

          cover?.addEventListener(
            "pointerleave",
            reset,
          );

          cover?.addEventListener(
            "pointercancel",
            reset,
          );

          reduced.addEventListener(
            "change",
            reset,
          );

          finePointer.addEventListener(
            "change",
            reset,
          );

          window.addEventListener(
            "blur",
            reset,
          );

          cleanupMotion =
            () => {
              if (
                pointerFrame
              ) {
                window.cancelAnimationFrame(
                  pointerFrame,
                );

                pointerFrame =
                  0;
              }

              if (
                frame
              ) {
                window.cancelAnimationFrame(
                  frame,
                );

                frame =
                  0;
              }

              cover?.removeEventListener(
                "pointermove",
                move,
              );

              cover?.removeEventListener(
                "pointerleave",
                reset,
              );

              cover?.removeEventListener(
                "pointercancel",
                reset,
              );

              reduced.removeEventListener(
                "change",
                reset,
              );

              finePointer.removeEventListener(
                "change",
                reset,
              );

              window.removeEventListener(
                "blur",
                reset,
              );
            };

          /* =================================================
             VISIBILITY
          ================================================= */

          visibilityObserver =
            new IntersectionObserver(
              (
                [
                  entry,
                ],
              ) => {
                visible =
                  entry
                    .isIntersecting;

                if (
                  visible
                ) {
                  schedule();
                } else {
                  if (
                    frame
                  ) {
                    window.cancelAnimationFrame(
                      frame,
                    );

                    frame =
                      0;
                  }

                  previous =
                    0;
                }
              },
            );

          visibilityObserver.observe(
            host,
          );

          /* =================================================
             INITIAL FRAME
          ================================================= */

          resize();

          applyPose();

          render();

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
              "[SpallEditorialScene]",
              error,
            );

            setReady(
              false,
            );
          }

          release();
        }
      }

      void initialize();

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

  /*
   * No 2D fallback.
   *
   * Saat reload:
   * editorial HTML langsung terlihat,
   * Three.js load diam-diam,
   * lalu scene 3D fade masuk ketika ready.
   */

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

          transition:
            "opacity 420ms cubic-bezier(0.16, 1, 0.3, 1)",

          willChange:
            ready
              ? "auto"
              : "opacity",
        }}
      />
    </div>
  );
}