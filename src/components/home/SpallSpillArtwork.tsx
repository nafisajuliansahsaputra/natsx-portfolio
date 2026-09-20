"use client";

import dynamic from "next/dynamic";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  PublicProject,
} from "@/lib/public-projects";

import {
  getWebglTextureUrl,
} from "@/lib/webgl-texture-url";

import styles from "./SpallSpillArtwork.module.css";

const SpallEditorialScene =
  dynamic(
    () =>
      import(
        "./SpallEditorialScene"
      ),
    {
      ssr:
        false,
    },
  );

const SCENE_PRELOAD_MARGIN =
  "500px 0px";

type Props = {
  project:
    PublicProject;

  secondaryVisual:
    | string
    | null;

  visualLabel:
    string;
};

function clamp(
  value:
    number,
) {
  return Math.max(
    -1,
    Math.min(
      1,
      value,
    ),
  );
}

export default function SpallSpillArtwork({
  project,
  secondaryVisual,
  visualLabel,
}: Props) {
  const artworkRef =
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

  /* =========================================================
     LAZY 3D SCENE
  ========================================================= */

  useEffect(
    () => {
      const currentArtwork =
        artworkRef.current;

      if (
        !currentArtwork
      ) {
        return;
      }

      const artwork:
        HTMLDivElement =
          currentArtwork;

      if (
        typeof IntersectionObserver ===
        "undefined"
      ) {
        const fallbackFrame =
          window.requestAnimationFrame(
            () => {
              setShouldLoadScene(
                true,
              );
            },
          );

        return () => {
          window.cancelAnimationFrame(
            fallbackFrame,
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
        artwork,
      );

      return () => {
        observer.disconnect();
      };
    },
    [],
  );

  /* =========================================================
     TEXT COUNTER PARALLAX
  ========================================================= */

  useEffect(
    () => {
      const currentArtwork =
        artworkRef.current;

      if (
        !currentArtwork
      ) {
        return;
      }

      const artwork:
        HTMLDivElement =
          currentArtwork;

      const finePointer =
        window.matchMedia(
          "(hover: hover) and (pointer: fine)",
        );

      const reducedMotion =
        window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        );

      if (
        !finePointer.matches ||
        reducedMotion.matches
      ) {
        return;
      }

      let targetX =
        0;

      let targetY =
        0;

      let currentX =
        0;

      let currentY =
        0;

      let animationFrame =
        0;

      function applyMotion() {
        /*
         * Main typography.
         *
         * iPhone LEFT  -> text RIGHT
         * iPhone RIGHT -> text LEFT
         */

        artwork.style.setProperty(
          "--spall-copy-x",
          `${currentX * -22}px`,
        );

        artwork.style.setProperty(
          "--spall-copy-y",
          `${currentY * -13}px`,
        );

        artwork.style.setProperty(
          "--spall-copy-rotate",
          `${currentX * -0.18}deg`,
        );

        /*
         * Small editorial note.
         */

        artwork.style.setProperty(
          "--spall-top-x",
          `${currentX * -12}px`,
        );

        artwork.style.setProperty(
          "--spall-top-y",
          `${currentY * -7}px`,
        );

        /*
         * Bottom metadata.
         */

        artwork.style.setProperty(
          "--spall-footer-x",
          `${currentX * -9}px`,
        );

        artwork.style.setProperty(
          "--spall-footer-y",
          `${currentY * -5}px`,
        );
      }

      function tick() {
        const easing =
          0.115;

        currentX +=
          (
            targetX -
            currentX
          ) *
          easing;

        currentY +=
          (
            targetY -
            currentY
          ) *
          easing;

        applyMotion();

        const movingX =
          Math.abs(
            targetX -
              currentX,
          );

        const movingY =
          Math.abs(
            targetY -
              currentY,
          );

        if (
          movingX >
            0.0005 ||
          movingY >
            0.0005
        ) {
          animationFrame =
            window.requestAnimationFrame(
              tick,
            );

          return;
        }

        currentX =
          targetX;

        currentY =
          targetY;

        applyMotion();

        animationFrame =
          0;
      }

      function requestTick() {
        if (
          animationFrame
        ) {
          return;
        }

        animationFrame =
          window.requestAnimationFrame(
            tick,
          );
      }

      function handlePointerMove(
        event:
          PointerEvent,
      ) {
        if (
          event.pointerType ===
          "touch"
        ) {
          return;
        }

        const bounds =
          artwork.getBoundingClientRect();

        if (
          bounds.width <=
            0 ||
          bounds.height <=
            0
        ) {
          return;
        }

        const localX =
          (
            event.clientX -
            bounds.left
          ) /
          bounds.width;

        const localY =
          (
            event.clientY -
            bounds.top
          ) /
          bounds.height;

        targetX =
          clamp(
            localX *
              2 -
              1,
          );

        targetY =
          clamp(
            localY *
              2 -
              1,
          );

        requestTick();
      }

      function resetMotion() {
        targetX =
          0;

        targetY =
          0;

        requestTick();
      }

      artwork.addEventListener(
        "pointermove",
        handlePointerMove,
        {
          passive:
            true,
        },
      );

      artwork.addEventListener(
        "pointerleave",
        resetMotion,
      );

      artwork.addEventListener(
        "pointercancel",
        resetMotion,
      );

      window.addEventListener(
        "blur",
        resetMotion,
      );

      return () => {
        artwork.removeEventListener(
          "pointermove",
          handlePointerMove,
        );

        artwork.removeEventListener(
          "pointerleave",
          resetMotion,
        );

        artwork.removeEventListener(
          "pointercancel",
          resetMotion,
        );

        window.removeEventListener(
          "blur",
          resetMotion,
        );

        if (
          animationFrame
        ) {
          window.cancelAnimationFrame(
            animationFrame,
          );
        }

        [
          "--spall-copy-x",
          "--spall-copy-y",
          "--spall-copy-rotate",
          "--spall-top-x",
          "--spall-top-y",
          "--spall-footer-x",
          "--spall-footer-y",
        ].forEach(
          (
            property,
          ) => {
            artwork.style.removeProperty(
              property,
            );
          },
        );
      };
    },
    [],
  );

  const optimizedScreenUrl =
    getWebglTextureUrl(
      secondaryVisual,
      1200,
    );

  return (
    <div
      ref={
        artworkRef
      }
      className={
        styles.artwork
      }
      data-spall-featured="true"
    >
      <div
        className={
          styles.light
        }
        aria-hidden="true"
      />

      <div
        className={
          styles.copy
        }
        aria-hidden="true"
      >
        <p
          className={
            styles.headline
          }
        >
          <span>
            YOUR
          </span>

          <span>
            SPACE.
          </span>
        </p>

        <p
          className={
            styles.subline
          }
        >
          your spill.
        </p>

        <p
          className={
            styles.description
          }
        >
          ONE IDENTITY.
          <br />

          MANY THINGS
          <br />

          TO DISCOVER.
        </p>

        <span
          className={
            styles.rule
          }
        />

        <span
          className={
            styles.wordmark
          }
        >
          spall spill.
        </span>
      </div>

      <div
        className={
          styles.scene
        }
      >
        {
          shouldLoadScene
            ? (
              <SpallEditorialScene
                screenUrl={
                  optimizedScreenUrl
                }
                label={`${project.title} — ${visualLabel}`}
              />
            )
            : null
        }
      </div>

      <span
        className={
          styles.topNote
        }
        aria-hidden="true"
      >
        A MORE
        <br />

        CONNECTED
        <br />

        YOU
      </span>

      <div
        className={
          styles.footer
        }
        aria-hidden="true"
      >
        <span>
          IDENTITY / SPILL / PRODUCT / RESOURCE
        </span>

        <span>
          {
            project.number
          }
          {" — "}
          {
            project.year
          }
        </span>
      </div>
    </div>
  );
}