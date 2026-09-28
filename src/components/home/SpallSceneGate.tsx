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

    const resourceController =
      new AbortController();

    const loadCode =
      () => {
        void loadSpallEditorialScene()
          .catch(
            () => undefined,
          );
      };

    const warmResources =
      () => {
        void warmSceneResources(
          [
            sceneModels.spall.phone.runtime,
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
          SPALL_CODE_PRELOAD_VIEWPORTS,
        ),
      );

    const resourceObserver =
      createOneShotObserver(
        warmResources,
        getSceneWarmMargin(
          SPALL_RESOURCE_PRELOAD_VIEWPORTS,
        ),
      );

    const prepareObserver =
      createOneShotObserver(
        () => {
          setShouldLoadScene(
            true,
          );
        },
        getSceneMargin(
          SPALL_PREPARE_VIEWPORTS,
        ),
      );

    return () => {
      resourceController.abort();

      codeObserver.disconnect();
      resourceObserver.disconnect();
      prepareObserver.disconnect();
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
