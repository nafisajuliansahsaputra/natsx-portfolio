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

const SPALL_CODE_PRELOAD_VIEWPORTS =
  2;

const SPALL_RESOURCE_PRELOAD_VIEWPORTS =
  1.25;

const SPALL_PREPARE_VIEWPORTS =
  0.75;

type SpallSceneGateProps = {
  className:
    string;

  label:
    string;

  screenUrl:
    string | null;

  loadStrategy?:
    | "viewport"
    | "archive";
};

export default function SpallSceneGate({
  className,
  label,
  screenUrl,
  loadStrategy = "viewport",
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

    const loadCode =
      () => {
        void loadSpallEditorialScene()
          .catch(
            () => undefined,
          );
      };

    const warmResources =
      () => {
        if (
          loadStrategy ===
          "archive"
        ) {
          void warmSceneResources(
            [
              screenUrl,
            ],
            1,
            "high",
          );

          void warmSceneResources(
            [
              "/models/iphone-17-pro-max.glb",
            ],
            1,
            "low",
          );

          return;
        }

        void warmSceneResources(
          [
            "/models/iphone-17-pro-max.glb",
            screenUrl,
          ],
          1,
        );
      };

    if (
      loadStrategy ===
      "archive"
    ) {
      loadCode();
      warmResources();

      const timeoutId =
        window.setTimeout(
          () => {
            setShouldLoadScene(
              true,
            );
          },
          0,
        );

      return () => {
        window.clearTimeout(
          timeoutId,
        );
      };
    }

    if (
      typeof IntersectionObserver ===
      "undefined"
    ) {
      loadCode();
      warmResources();

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

    const createOneShotObserver =
      (
        callback:
          () => void,
        viewportMargin:
          number,
      ) => {
        const observer =
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

              callback();

              observer.disconnect();
            },
            {
              root:
                null,

              rootMargin:
                getSceneMargin(
                  viewportMargin,
                ),

              threshold:
                0,
            },
          );

        observer.observe(
          scene,
        );

        return observer;
      };

    const codeObserver =
      createOneShotObserver(
        loadCode,
        SPALL_CODE_PRELOAD_VIEWPORTS,
      );

    const resourceObserver =
      createOneShotObserver(
        warmResources,
        loadStrategy ===
          "archive"
          ? 2.25
          : SPALL_RESOURCE_PRELOAD_VIEWPORTS,
      );

    const prepareObserver =
      createOneShotObserver(
        () => {
          setShouldLoadScene(
            true,
          );
        },
        SPALL_PREPARE_VIEWPORTS,
      );

    return () => {
      codeObserver.disconnect();
      resourceObserver.disconnect();
      prepareObserver.disconnect();
    };
  }, [
    introDone,
    loadStrategy,
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
