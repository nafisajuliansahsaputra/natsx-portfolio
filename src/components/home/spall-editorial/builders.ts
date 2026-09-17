import * as THREE from "three";
import {
  iconTexture,
  roundedRect,
  type IconKind,
} from "./textures";

type MakeMesh = (
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
) => THREE.Mesh;

type TileFactoryOptions = {
  rig: THREE.Group;
  geometries: Set<THREE.BufferGeometry>;
  textures: Set<THREE.Texture>;
  makeMesh: MakeMesh;
  glassTileMaterial: THREE.Material;
  glassTileSideMaterial: THREE.Material;
  greenMaterial: THREE.Material;
};

export function createTileFactory({
  rig,
  geometries,
  textures,
  makeMesh,
  glassTileMaterial,
  glassTileSideMaterial,
  greenMaterial,
}: TileFactoryOptions) {
  return function tile(
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
  };
}

type ShadowFactoryOptions = {
  rig: THREE.Group;
  makeMesh: MakeMesh;
  shadowMap: THREE.Texture;
};

type ShadowOptions = {
  width: number;
  height: number;
  x: number;
  y: number;
  z: number;
  opacity?: number;
  rotation?: number;
};

export function createShadowFactory({
  rig,
  makeMesh,
  shadowMap,
}: ShadowFactoryOptions) {
  return function addShadow({
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
  };
}