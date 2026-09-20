"use client";

import dynamic from "next/dynamic";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getSceneMargin,
  warmSceneResources,
} from "./scene-resource-preload";

const loadBastEditorialScene =
  () =>
    import(
      "./BastEditorialScene"
    );

const BastEditorialScene =
  dynamic(
    loadBastEditorialScene,
    {
      ssr:
        false,
    },
  );

const BAST_PRELOAD_VIEWPORTS =
  3;

const BAST_PREPARE_VIEWPORTS =
  2;

type BastSceneGateProps = {
  className:
    string;

  label:
    string;

  screenUrl:
    string | null;
};

export default function BastSceneGate({
  className,
  label,
  screenUrl,
}: BastSceneGateProps) {
  const sceneRef =
    useRef<HTMLDivElement>(
      null,
    );

  const [
    shouldLoadScene,
    setShouldLoadScene,
  ] =
    useState(
      false,
    );

  useEffect(() => {
    const scene =
      sceneRef.current;

    if (!scene) {
      return;
    }

    const preload =
      () => {
        void loadBastEditorialScene()
          .catch(
            () => undefined,
          );

        void warmSceneResources(
          [
            "/models/bast/macbook-pro.glb",
            "/models/bast/printer.glb",
            screenUrl,
          ],
        );
      };

    if (
      typeof IntersectionObserver ===
      "undefined"
    ) {
      preload();

      const frame =
        window.requestAnimationFrame(
          () => {
            setShouldLoadScene(
              true,
            );
          },
        );

      return () => {
        window.cancelAnimationFrame(
          frame,
        );
      };
    }

    let preloadObserver:
      IntersectionObserver |
      null =
      null;

    let prepareObserver:
      IntersectionObserver |
      null =
      null;

    preloadObserver =
      new IntersectionObserver(
        (
          [
            entry,
          ],
        ) => {
          if (
            !entry
              ?.isIntersecting
          ) {
            return;
          }

          preload();

          preloadObserver
            ?.disconnect();
        },
        {
          root:
            null,

          rootMargin:
            getSceneMargin(
              BAST_PRELOAD_VIEWPORTS,
            ),

          threshold:
            0,
        },
      );

    prepareObserver =
      new IntersectionObserver(
        (
          [
            entry,
          ],
        ) => {
          if (
            !entry
              ?.isIntersecting
          ) {
            return;
          }

          setShouldLoadScene(
            true,
          );

          prepareObserver
            ?.disconnect();
        },
        {
          root:
            null,

          rootMargin:
            getSceneMargin(
              BAST_PREPARE_VIEWPORTS,
            ),

          threshold:
            0,
        },
      );

    preloadObserver.observe(
      scene,
    );

    prepareObserver.observe(
      scene,
    );

    return () => {
      preloadObserver
        ?.disconnect();

      prepareObserver
        ?.disconnect();
    };
  }, [
    screenUrl,
  ]);

  return (
    <div
      ref={
        sceneRef
      }
      className={
        className
      }
    >
      {shouldLoadScene ? (
        <BastEditorialScene
          screenUrl={
            screenUrl
          }
          label={
            label
          }
        />
      ) : null}
    </div>
  );
}
