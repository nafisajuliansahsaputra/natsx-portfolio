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

const ATTENDANCE_CODE_PRELOAD_VIEWPORTS =
  2;

const ATTENDANCE_RESOURCE_PRELOAD_VIEWPORTS =
  1.15;

const ATTENDANCE_PREPARE_VIEWPORTS =
  0.65;

type AttendanceSceneGateProps = {
  className:
    string;

  label:
    string;

  dashboardImageUrl:
    string | null;

  scannerImageUrl:
    string | null;

  badgeImageUrl:
    string;
};

export default function AttendanceSceneGate({
  className,
  label,
  dashboardImageUrl,
  scannerImageUrl,
  badgeImageUrl,
}: AttendanceSceneGateProps) {
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
        void loadAttendanceEditorialScene()
          .catch(
            () => undefined,
          );
      };

    const warmResources =
      () => {
        void warmSceneResources(
          [
            "/models/attendance/imac.glb",
            "/models/attendance/scanner.glb",
            "/models/attendance/badge.glb",
            dashboardImageUrl,
            scannerImageUrl,
            badgeImageUrl,
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
        ATTENDANCE_CODE_PRELOAD_VIEWPORTS,
      );

    const resourceObserver =
      createOneShotObserver(
        warmResources,
        ATTENDANCE_RESOURCE_PRELOAD_VIEWPORTS,
      );

    const prepareObserver =
      createOneShotObserver(
        () => {
          setShouldLoadScene(
            true,
          );
        },
        ATTENDANCE_PREPARE_VIEWPORTS,
      );

    return () => {
      codeObserver.disconnect();
      resourceObserver.disconnect();
      prepareObserver.disconnect();
    };
  }, [
    badgeImageUrl,
    dashboardImageUrl,
    introDone,
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
          badgeImageUrl={
            badgeImageUrl
          }
        />
      ) : null}
    </div>
  );
}
