"use client";

import dynamic from "next/dynamic";

import {
  useEffect,
  useRef,
  useState,
} from "react";

const AttendanceEditorialScene =
  dynamic(
    () =>
      import(
        "./AttendanceEditorialScene"
      ),
    {
      ssr:
        false,
    },
  );

const SCENE_PRELOAD_MARGIN =
  "800px 0px";

type AttendanceSceneGateProps = {
  className:
    string;

  label:
    string;

  dashboardImageUrl:
    string | null;
};

export default function AttendanceSceneGate({
  className,
  label,
  dashboardImageUrl,
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

    if (
      typeof IntersectionObserver ===
      "undefined"
    ) {
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

    const observer =
      new IntersectionObserver(
        (
          entries,
        ) => {
          const entry =
            entries[0];

          if (
            !entry ||
            !entry.isIntersecting
          ) {
            return;
          }

          setShouldLoadScene(
            true,
          );

          observer.disconnect();
        },
        {
          root:
            null,

          rootMargin:
            SCENE_PRELOAD_MARGIN,

          threshold:
            0.01,
        },
      );

    observer.observe(
      scene,
    );

    return () => {
      observer.disconnect();
    };
  }, []);

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
        />
      ) : null}
    </div>
  );
}
