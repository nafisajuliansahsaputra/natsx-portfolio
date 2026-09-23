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
            "/models/bast/macbook-pro.glb",
            "/models/bast/printer.glb",
            screenUrl,
          ],
          1,
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
        BAST_CODE_PRELOAD_VIEWPORTS,
      );

    const resourceObserver =
      createOneShotObserver(
        warmResources,
        BAST_RESOURCE_PRELOAD_VIEWPORTS,
      );

    const prepareObserver =
      createOneShotObserver(
        () => {
          setShouldLoadScene(
            true,
          );
        },
        BAST_PREPARE_VIEWPORTS,
      );

    return () => {
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
