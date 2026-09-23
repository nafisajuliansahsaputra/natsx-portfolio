"use client";

import dynamic from "next/dynamic";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import useIntroCompletion from "@/components/intro/useIntroCompletion";

import {
  getSceneMargin,
  warmSceneResources,
} from "./scene-resource-preload";

const loadSpallEditorialScene =
  () =>
    import(
      "./SpallEditorialScene"
    );

const SpallEditorialScene =
  dynamic(
    loadSpallEditorialScene,
    {
      ssr:
        false,
    },
  );

type SpallSceneGateProps = {
  className:
    string;

  label:
    string;

  screenUrl:
    string | null;
};

export default function SpallSceneGate({
  className,
  label,
  screenUrl,
}: SpallSceneGateProps) {
  const introDone =
    useIntroCompletion();

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
    if (
      !introDone
    ) {
      return;
    }

    const scene =
      sceneRef.current;

    if (!scene) {
      return;
    }

    const preload =
      () => {
        void loadSpallEditorialScene()
          .catch(
            () => undefined,
          );

        void warmSceneResources(
          [
            "/models/iphone-17-pro-max.glb",
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
              2,
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
              1,
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
    introDone,
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
        <SpallEditorialScene
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
