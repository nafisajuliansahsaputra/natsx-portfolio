"use client";

import dynamic from "next/dynamic";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import useIntroCompletion from "@/components/intro/useIntroCompletion";

import sceneModels from "@/data/scene-models.json";

import {
  getSceneMargin,
  getSceneWarmMargin,
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

const BAST_CODE_PRELOAD_VIEWPORTS =
  2.5;

const BAST_RESOURCE_PRELOAD_VIEWPORTS =
  1.5;

const BAST_PREPARE_VIEWPORTS =
  0.85;

const BAST_KEEP_ALIVE_VIEWPORTS =
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

    const resourceController =
      new AbortController();

    const loadCode =
      () => {
        void loadBastEditorialScene()
          .catch(
            () => undefined,
          );
      };

    const warmResources =
      () => {
        void warmSceneResources(
          [
            sceneModels.bast.macbook.runtime,
            sceneModels.bast.printer.runtime,
            screenUrl,
          ],
          1,
          resourceController.signal,
        );
      };

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
        resourceController.abort();

        window.cancelAnimationFrame(
          frame,
        );
      };
    }

    const createOneShotObserver =
      (
        callback:
          () => void,
        rootMargin:
          string,
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

              rootMargin,

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
        getSceneMargin(
          BAST_CODE_PRELOAD_VIEWPORTS,
        ),
      );

    const resourceObserver =
      createOneShotObserver(
        warmResources,
        getSceneWarmMargin(
          BAST_RESOURCE_PRELOAD_VIEWPORTS,
        ),
      );

    /*
     * Hysteresis lifecycle:
     * mount shortly before the scene is visible, but keep it alive until it
     * is much farther away. This preserves the current visual/motion while
     * releasing WebGL geometry, textures, and renderer memory after the user
     * has moved well past the project.
     */
    const mountObserver =
      new IntersectionObserver(
        (
          [
            entry,
          ],
        ) => {
          if (
            entry
              ?.isIntersecting
          ) {
            setShouldLoadScene(
              true,
            );
          }
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

    const unloadObserver =
      new IntersectionObserver(
        (
          [
            entry,
          ],
        ) => {
          if (
            entry &&
            !entry
              .isIntersecting
          ) {
            setShouldLoadScene(
              false,
            );
          }
        },
        {
          root:
            null,

          rootMargin:
            getSceneMargin(
              BAST_KEEP_ALIVE_VIEWPORTS,
            ),

          threshold:
            0,
        },
      );

    mountObserver.observe(
      scene,
    );

    unloadObserver.observe(
      scene,
    );

    return () => {
      resourceController.abort();

      codeObserver.disconnect();
      resourceObserver.disconnect();
      mountObserver.disconnect();
      unloadObserver.disconnect();
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
