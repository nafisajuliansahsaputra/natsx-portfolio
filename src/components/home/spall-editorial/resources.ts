import * as THREE from "three";

export function createSceneResources() {
  const geometries =
    new Set<THREE.BufferGeometry>();

  const materials =
    new Set<THREE.Material>();

  const textures =
    new Set<THREE.Texture>();

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

  return {
    geometries,
    materials,
    textures,
    keepMaterial,
    makeMesh,
    collect,
    disposeAssets,
  };
}