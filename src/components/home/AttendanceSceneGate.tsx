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

const loadAttendanceEditorialScene =
  () =>
    import(
      "./AttendanceEditorialScene"
    );

const AttendanceEditorialScene =
  dynamic(
    loadAttendanceEditorialScene,
    {
      ssr:
        false,
    },
  );

type AttendanceSceneGateProps = {
  className:
    string;

  label:
    string;

  dashboardImageUrl:
    string | null;

  scannerImageUrl:
    string | null;
};

export default function AttendanceSceneGate({
  className,
  label,
  dashboardImageUrl,
  scannerImageUrl,
}: AttendanceSceneGateProps) {
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
        void loadAttendanceEditorialScene()
          .catch(
            () => undefined,
          );

        void warmSceneResources(
          [
            "/models/attendance/imac.glb",
            "/models/attendance/scanner.glb",
            "/models/attendance/badge.glb",
            dashboardImageUrl,
            scannerImageUrl,
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
    dashboardImageUrl,
    scannerImageUrl,
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
        <AttendanceEditorialScene
          label={
            label
          }
          dashboardImageUrl={
            dashboardImageUrl
          }
          scannerImageUrl={
            scannerImageUrl
          }
        />
      ) : null}
    </div>
  );
}
