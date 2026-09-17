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

type ShadowOptions = {
  width: number;
  height: number;
  x: number;
  y: number;
  z: number;
  opacity?: number;
  rotation?: number;
};

const MODEL_URL = "/models/iphone-17-pro-max.glb";

function roundedRect(
  width: number,
  height: number,
  radius: number,
) {
  const shape = new THREE.Shape();

  const x = -width / 2;
  const y = -height / 2;

  const r = Math.min(
    radius,
    width / 2,
    height / 2,
  );

  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);

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

function canvasTexture(
  draw: (
    context: CanvasRenderingContext2D,
  ) => void,
) {
  const canvas =
    document.createElement("canvas");

  canvas.width = 512;
  canvas.height = 512;

  const context =
    canvas.getContext("2d");

  if (!context) {
    throw new Error(
      "Canvas 2D unavailable.",
    );
  }

  draw(context);

  const texture =
    new THREE.CanvasTexture(canvas);

  texture.colorSpace =
    THREE.SRGBColorSpace;

  return texture;
}

function iconTexture(
  kind: IconKind,
  light = false,
) {
  return canvasTexture(
    (context) => {
      const color =
        light
          ? "#e2e7d8"
          : "#234633";

      context.strokeStyle =
        color;

      context.fillStyle =
        color;

      context.lineWidth = 8;
      context.lineCap = "round";
      context.lineJoin = "round";

      if (
        kind ===
        "identity"
      ) {
        context.beginPath();

        context.arc(
          256,
          153,
          34,
          0,
          Math.PI * 2,
        );

        context.stroke();

        context.beginPath();

        context.moveTo(
          191,
          272,
        );

        context.lineTo(
          191,
          251,
        );

        context.bezierCurveTo(
          191,
          195,
          321,
          195,
          321,
          251,
        );

        context.lineTo(
          321,
          272,
        );

        context.closePath();

        context.stroke();
      }

      if (
        kind ===
        "explore"
      ) {
        for (
          let index = 0;
          index < 3;
          index++
        ) {
          const y =
            159 +
            index * 35;

          context.beginPath();

          context.moveTo(
            177,
            y,
          );

          context.lineTo(
            256,
            y + 41,
          );

          context.lineTo(
            335,
            y,
          );

          if (
            index === 0
          ) {
            context.lineTo(
              256,
              y - 41,
            );

            context.closePath();
          }

          context.stroke();
        }
      }

      if (
        kind ===
        "share"
      ) {
        context.save();

        context.translate(
          256,
          203,
        );

        context.rotate(
          -Math.PI / 4,
        );

        context.beginPath();

        context.roundRect(
          -94,
          -30,
          116,
          60,
          30,
        );

        context.stroke();

        context.beginPath();

        context.roundRect(
          -22,
          -30,
          116,
          60,
          30,
        );

        context.stroke();

        context.restore();
      }

      context.font =
        "500 31px Arial";

      context.textAlign =
        "center";

      context.fillText(
        kind.toUpperCase(),
        256,
        369,
      );
    },
  );
}

function shadowTexture() {
  return canvasTexture(
    (context) => {
      const gradient =
        context.createRadialGradient(
          256,
          256,
          5,
          256,
          256,
          250,
        );

      gradient.addColorStop(
        0,
        "rgba(24,34,24,0.42)",
      );

      gradient.addColorStop(
        0.34,
        "rgba(24,34,24,0.18)",
      );

      gradient.addColorStop(
        0.68,
        "rgba(24,34,24,0.045)",
      );

      gradient.addColorStop(
        1,
        "rgba(24,34,24,0)",
      );

      context.fillStyle =
        gradient;

      context.fillRect(
        0,
        0,
        512,
        512,
      );
    },
  );
}

export default function SpallEditorialScene(
  props: Props,
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
    useState(false);

  useEffect(() => {
    const hostNode =
      hostRef.current;

    if (
      hostNode === null
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

    function keepMaterial<
      T extends THREE.Material,
    >(
      material: T,
    ): T {
      materials.add(
        material,
      );

      for (
        const value of
        Object.values(
          material,
        )
      ) {
        if (
          value instanceof
          THREE.Texture
        ) {
          textures.add(
            value,
          );
        }
      }

      return material;
    }

    function makeMesh(
      geometry:
        THREE.BufferGeometry,
      material:
        THREE.Material,
    ) {
      geometries.add(
        geometry,
      );

      keepMaterial(
        material,
      );

      return new THREE.Mesh(
        geometry,
        material,
      );
    }

    function collect(
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
            keepMaterial,
          );
        },
      );
    }

    function disposeAssets() {
      textures.forEach(
        (texture) =>
          texture.dispose(),
      );

      materials.forEach(
        (material) =>
          material.dispose(),
      );

      geometries.forEach(
        (geometry) =>
          geometry.dispose(),
      );

      textures.clear();
      materials.clear();
      geometries.clear();
    }

    function handleContextLost() {
      cleanupMotion?.();

      if (!disposed) {
        setReady(
          false,
        );
      }
    }

    function release() {
      cleanupMotion?.();

      cleanupMotion =
        undefined;

      resizeObserver?.disconnect();

      visibilityObserver?.disconnect();

      environment?.dispose();

      environment =
        undefined;

      disposeAssets();

      if (renderer) {
        renderer.domElement.removeEventListener(
          "webglcontextlost",
          handleContextLost,
        );

        renderer.dispose();

        renderer.domElement.remove();

        renderer =
          undefined;
      }
    }

    async function initialize() {
      try {
        const gltf =
          await new GLTFLoader().loadAsync(
            MODEL_URL,
          );

        const model =
          gltf.scene;

        collect(
          model,
        );

        if (disposed) {
          disposeAssets();

          return;
        }

        let screenshot:
          | THREE.Texture
          | undefined;

        if (screenUrl) {
          screenshot =
            await new THREE.TextureLoader().loadAsync(
              screenUrl,
            );

          textures.add(
            screenshot,
          );

          if (disposed) {
            disposeAssets();

            return;
          }

          screenshot.colorSpace =
            THREE.SRGBColorSpace;

          screenshot.flipY =
            true;
        }

        renderer =
          new THREE.WebGLRenderer(
            {
              alpha: true,
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
          webgl.domElement
            .style,
          {
            display:
              "block",
            width:
              "100%",
            height:
              "100%",
          },
        );

        host.appendChild(
          webgl.domElement,
        );

        webgl.domElement.addEventListener(
          "webglcontextlost",
          handleContextLost,
        );

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
          softboxGeometry.dispose();
          softboxMaterial.dispose();
        }

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

        const rig =
          new THREE.Group();

        scene.add(
          rig,
        );

        let foundScreen =
          false;

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

                  if (!screenshot) {
                    return material;
                  }

                  const geometry =
                    object.geometry;

                  geometry.computeBoundingBox();

                  const bounds =
                    geometry.boundingBox!;

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
                    let index = 0;
                    index <
                    positions.count;
                    index++
                  ) {
                    uv[
                      index * 2
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
                      index * 2 +
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
                    screenshot.image as {
                      width: number;
                      height: number;
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
                        screenshot.repeat
                          .x
                      ) /
                      2;
                  } else {
                    screenshot.repeat.y =
                      imageAspect /
                      screenAspect;

                    screenshot.offset.y =
                      1 -
                      screenshot.repeat
                        .y;
                  }

                  screenshot.anisotropy =
                    Math.min(
                      webgl.capabilities.getMaxAnisotropy(),
                      8,
                    );

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
                : nextMaterials[0];
          },
        );

        if (!foundScreen) {
          throw new Error(
            "Material layar tidak ditemukan.",
          );
        }

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

        model.rotation.y =
          Math.PI;

        model.updateMatrixWorld(
          true,
        );

        const modelBounds =
          new THREE.Box3().setFromObject(
            model,
          );

        const modelSize =
          modelBounds.getSize(
            new THREE.Vector3(),
          );

        if (
          modelSize.y <= 0
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

        rig.add(
          phone,
        );

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

        function tile(
          kind: IconKind,
          position: [
            number,
            number,
            number,
          ],
          angles: [
            number,
            number,
            number,
          ],
          round = false,
        ) {
          const group =
            new THREE.Group();

          const shape =
            round
              ? new THREE.Shape()
              : roundedRect(
                  1.02,
                  1.05,
                  0.12,
                );

          if (round) {
            shape.absarc(
              0,
              0,
              0.52,
              0,
              Math.PI * 2,
              false,
            );
          }

          const tileDepth =
            round
              ? 0.12
              : 0.24;

          const tileBevel =
            round
              ? 0.027
              : 0.045;

          const geometry =
            new THREE.ExtrudeGeometry(
              shape,
              {
                depth:
                  tileDepth,
                steps:
                  1,
                curveSegments:
                  32,
                bevelEnabled:
                  true,
                bevelSize:
                  tileBevel,
                bevelThickness:
                  tileBevel,
                bevelSegments:
                  7,
              },
            );

          geometries.add(
            geometry,
          );

          const body =
            new THREE.Mesh(
              geometry,
              round
                ? greenMaterial
                : [
                    glassTileMaterial,
                    glassTileSideMaterial,
                  ],
            );

          group.add(
            body,
          );

          const texture =
            iconTexture(
              kind,
              round,
            );

          textures.add(
            texture,
          );

          const print =
            makeMesh(
              new THREE.PlaneGeometry(
                0.9,
                0.9,
              ),
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
            );

          print.position.z =
            round
              ? 0.151
              : 0.292;

          group.add(
            print,
          );

          group.position.set(
            ...position,
          );

          group.rotation.set(
            ...angles,
          );

          rig.add(
            group,
          );

          return group;
        }

        /*
         * POSISI OBJECT TIDAK DIUBAH.
         */

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

        /*
         * ====================================================
         * MARBLE
         *
         * Posisi sama.
         * Material dibuat sedikit lebih berisi.
         * ====================================================
         */

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
            (context) => {
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

        /*
         * ====================================================
         * PEARLS
         * ====================================================
         */

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

        /*
         * ====================================================
         * SHADOW SYSTEM
         * ====================================================
         */

        const shadowMap =
          shadowTexture();

        textures.add(
          shadowMap,
        );

        function addShadow({
          width,
          height,
          x,
          y,
          z,
          opacity = 1,
          rotation = 0,
        }: ShadowOptions) {
          const shadow =
            makeMesh(
              new THREE.PlaneGeometry(
                width,
                height,
              ),
              new THREE.MeshBasicMaterial(
                {
                  map:
                    shadowMap,
                  transparent:
                    true,
                  opacity,
                  depthWrite:
                    false,
                  depthTest:
                    true,
                  toneMapped:
                    false,
                },
              ),
            );

          shadow.position.set(
            x,
            y,
            z,
          );

          shadow.rotation.z =
            rotation;

          rig.add(
            shadow,
          );

          return shadow;
        }

        /*
         * PHONE SHADOW
         *
         * Ambient dilebarin sedikit ke kiri
         * tetapi dibuat lebih soft.
         * Contact shadow tetap rapat.
         */

        const phoneAmbientShadow =
          addShadow({
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
          });

        const phoneContactShadow =
          addShadow({
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
          });

        /*
         * IDENTITY
         */

        const identityShadow =
          addShadow({
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
          });

        /*
         * SHARE
         */

        const shareShadow =
          addShadow({
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
          });

        /*
         * EXPLORE
         */

        const exploreShadow =
          addShadow({
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
          });

        /*
         * MARBLE
         */

        const marbleShadow =
          addShadow({
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
          });

        /*
         * GREEN PEARL
         */

        const greenPearlShadow =
          addShadow({
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
          });

        /*
         * GLASS PEARL
         */

        const glassPearlShadow =
          addShadow({
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
          });

        /*
         * ====================================================
         * RENDER
         * ====================================================
         */

        let visible =
          true;

        function render() {
          if (
            !disposed &&
            visible &&
            !webgl
              .getContext()
              .isContextLost()
          ) {
            webgl.render(
              scene,
              camera,
            );
          }
        }

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
              THREE.MathUtils.degToRad(
                camera.fov,
              ) / 2,
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

          camera.updateProjectionMatrix();

          render();
        }

        resizeObserver =
          new ResizeObserver(
            resize,
          );

        resizeObserver.observe(
          host,
        );

        const cover =
          host.closest<HTMLElement>(
            '[data-spall-featured="true"]',
          );

        const reduced =
          window.matchMedia(
            "(prefers-reduced-motion: reduce)",
          );

        const target =
          new THREE.Vector2();

        const current =
          new THREE.Vector2();

        let frame = 0;
        let previous = 0;

        /*
         * MOTION ASLI DIPERTAHANKAN.
         */

        function applyPose() {
          rig.rotation.x =
            current.y *
            0.025;

          rig.rotation.y =
            current.x *
            0.045;

          phone.rotation.x =
            0.07 +
            current.y *
              0.025;

          phone.rotation.y =
            -0.38 +
            current.x *
              0.07;

          /*
           * SHADOW HP
           *
           * Formula motion tetap sama.
           * Hanya base position mengikuti
           * shadow baru.
           */

          phoneAmbientShadow.position.x =
            0.58 +
            current.x *
              0.018;

          phoneAmbientShadow.position.y =
            -2.47 +
            current.y *
              0.008;

          phoneContactShadow.position.x =
            0.79 +
            current.x *
              0.012;

          phoneContactShadow.position.y =
            -2.31 +
            current.y *
              0.005;

          /*
           * IDENTITY
           */

          identity.position.y =
            1.9 -
            current.y *
              0.035;

          identityShadow.position.y =
            1.68 -
            current.y *
              0.035;

          identityShadow.position.x =
            -1.9 -
            current.x *
              0.02;

          /*
           * EXPLORE
           */

          explore.position.y =
            -1.45 +
            current.y *
              0.035;

          exploreShadow.position.y =
            -1.67 +
            current.y *
              0.035;

          /*
           * SHARE
           */

          share.rotation.z =
            0.14 +
            current.x *
              0.018;

          shareShadow.rotation.z =
            0.12 +
            current.x *
              0.018;

          /*
           * MARBLE
           */

          marbleShadow.position.x =
            -2.03 -
            current.x *
              0.01;

          /*
           * GREEN PEARL
           */

          greenPearlShadow.position.x =
            -2.16 -
            current.x *
              0.01;

          /*
           * GLASS PEARL
           */

          glassPearlShadow.position.x =
            2 -
            current.x *
              0.008;
        }

        function tick(
          time: number,
        ) {
          frame = 0;

          if (
            disposed ||
            !visible ||
            webgl
              .getContext()
              .isContextLost()
          ) {
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
              : 1 / 60;

          previous =
            time;

          current.lerp(
            target,
            1 -
              Math.exp(
                -7 *
                  delta,
              ),
          );

          if (
            current.distanceTo(
              target,
            ) <
            0.0005
          ) {
            current.copy(
              target,
            );

            previous = 0;
          } else {
            frame =
              requestAnimationFrame(
                tick,
              );
          }

          applyPose();
          render();
        }

        function schedule() {
          if (
            !frame &&
            visible &&
            !disposed
          ) {
            previous = 0;

            frame =
              requestAnimationFrame(
                tick,
              );
          }
        }

        function move(
          event: PointerEvent,
        ) {
          if (
            !cover ||
            event.pointerType ===
              "touch" ||
            reduced.matches
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
                  event.clientX -
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
                  event.clientY -
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

        function reset() {
          target.set(
            0,
            0,
          );

          if (
            reduced.matches
          ) {
            cancelAnimationFrame(
              frame,
            );

            frame = 0;

            current.set(
              0,
              0,
            );

            applyPose();
            render();
          } else {
            schedule();
          }
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

        window.addEventListener(
          "blur",
          reset,
        );

        cleanupMotion =
          () => {
            cancelAnimationFrame(
              frame,
            );

            frame = 0;

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

            window.removeEventListener(
              "blur",
              reset,
            );
          };

        visibilityObserver =
          new IntersectionObserver(
            ([entry]) => {
              visible =
                entry.isIntersecting;

              if (visible) {
                schedule();
              } else {
                cancelAnimationFrame(
                  frame,
                );

                frame = 0;
                previous = 0;
              }
            },
          );

        visibilityObserver.observe(
          host,
        );

        resize();
        applyPose();
        render();

        if (!disposed) {
          setReady(
            true,
          );
        }
      } catch (error) {
        if (!disposed) {
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
  }, [screenUrl]);

  return (
    <div
      role="img"
      aria-label={label}
      style={{
        position:
          "absolute",
        inset: 0,
        pointerEvents:
          "none",
      }}
    >
      {!ready &&
        screenUrl && (
          <div
            aria-hidden="true"
            style={{
              position:
                "absolute",
              inset:
                "14% 30%",
              overflow:
                "hidden",
              border:
                "5px solid #25362b",
              borderRadius:
                "12% / 6%",
              background:
                "#f2eee5",
              transform:
                "rotate(12deg)",
            }}
          >
            <Image
              src={screenUrl}
              alt=""
              fill
              unoptimized
              sizes="(max-width: 700px) 30vw, 28vw"
              style={{
                objectFit:
                  "cover",
                objectPosition:
                  "top",
              }}
            />
          </div>
        )}

      <div
        ref={hostRef}
        aria-hidden="true"
        style={{
          position:
            "absolute",
          inset: 0,
          opacity:
            ready
              ? 1
              : 0,
        }}
      />
    </div>
  );
}