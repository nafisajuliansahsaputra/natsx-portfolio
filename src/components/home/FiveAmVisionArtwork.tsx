"use client";

import {
  useEffect,
  useRef,
} from "react";

import Image from "next/image";

import styles from "./FiveAmVisionArtwork.module.css";


type VisionArtworkCopy = {
  disciplineLabel: string;

  identity: string;

  artDirection: string;

  digitalDesign: string;

  philosophyLine1: string;

  philosophyLine2: string;

  philosophyLine3: string;

  tagline: string;
};


type FiveAmVisionArtworkProps = {
  copy:
    VisionArtworkCopy;
};


function clamp(
  value: number,
) {
  return Math.max(
    -1,
    Math.min(
      1,
      value,
    ),
  );
}


export default function FiveAmVisionArtwork({
  copy,
}: FiveAmVisionArtworkProps) {
  const rootRef =
    useRef<HTMLDivElement>(
      null,
    );

  useEffect(
    () => {
      const root =
        rootRef.current;

      if (!root) {
        return;
      }

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

      let targetX = 0;
      let targetY = 0;

      let currentX = 0;
      let currentY = 0;

      let animationFrame = 0;


      const applyMotion = () => {
        root.style.setProperty(
          "--vision-character-x",
          `${currentX * 20}px`,
        );

        root.style.setProperty(
          "--vision-character-y",
          `${currentY * 13}px`,
        );

        root.style.setProperty(
          "--vision-character-rotate",
          `${currentX * 0.45}deg`,
        );

        root.style.setProperty(
          "--vision-type-x",
          `${currentX * -17}px`,
        );

        root.style.setProperty(
          "--vision-type-y",
          `${currentY * -10}px`,
        );

        root.style.setProperty(
          "--vision-orbit-x",
          `${currentX * -10}px`,
        );

        root.style.setProperty(
          "--vision-orbit-y",
          `${currentY * -7}px`,
        );

        root.style.setProperty(
          "--vision-top-x",
          `${currentX * -4}px`,
        );

        root.style.setProperty(
          "--vision-top-y",
          `${currentY * -2}px`,
        );

        root.style.setProperty(
          "--vision-left-x",
          `${currentX * -8}px`,
        );

        root.style.setProperty(
          "--vision-left-y",
          `${currentY * -5}px`,
        );

        root.style.setProperty(
          "--vision-right-x",
          `${currentX * 7}px`,
        );

        root.style.setProperty(
          "--vision-right-y",
          `${currentY * 4}px`,
        );

        root.style.setProperty(
          "--vision-tagline-x",
          `${currentX * 5}px`,
        );

        root.style.setProperty(
          "--vision-tagline-y",
          `${currentY * 3}px`,
        );

        root.style.setProperty(
          "--vision-ambient-x",
          `${currentX * -3}px`,
        );

        root.style.setProperty(
          "--vision-ambient-y",
          `${currentY * -2}px`,
        );
      };


      const tick = () => {
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
      };


      const requestTick =
        () => {
          if (
            animationFrame
          ) {
            return;
          }

          animationFrame =
            window.requestAnimationFrame(
              tick,
            );
        };


      const handlePointerMove =
        (
          event:
            PointerEvent,
        ) => {
          const bounds =
            root.getBoundingClientRect();

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
        };


      const handlePointerLeave =
        () => {
          targetX =
            0;

          targetY =
            0;

          requestTick();
        };


      root.addEventListener(
        "pointermove",
        handlePointerMove,
        {
          passive: true,
        },
      );

      root.addEventListener(
        "pointerleave",
        handlePointerLeave,
        {
          passive: true,
        },
      );


      return () => {
        root.removeEventListener(
          "pointermove",
          handlePointerMove,
        );

        root.removeEventListener(
          "pointerleave",
          handlePointerLeave,
        );

        if (
          animationFrame
        ) {
          window.cancelAnimationFrame(
            animationFrame,
          );
        }
      };
    },
    [],
  );


  return (
    <div
      ref={
        rootRef
      }
      className={
        styles.artwork
      }
      aria-hidden="true"
    >
      <div
        className={
          styles.ambient
        }
      />

      <div
        className={
          styles.frame
        }
      />

      <div
        className={
          styles.orbit
        }
      />

      <div
        className={
          styles.type
        }
      >
        <span>
          5AM
        </span>

        <span>
          Vision
        </span>
      </div>

      <div
        className={
          styles.topMeta
        }
      >
        <span
          className={
            styles.topLogo
          }
        >
          <Image
            src="/images/projects/5am-vision/5am-logo.png"
            alt=""
            fill
            sizes="(max-width: 700px) 28px, (max-width: 960px) 34px, 42px"
            className={
              styles.topLogoImage
            }
            unoptimized
          />
        </span>

        <span
          className={
            styles.topRule
          }
        />

        <span
          className={
            styles.topIndex
          }
        >
          02
        </span>
      </div>

      <div
        className={
          styles.leftMeta
        }
      >
        <span
          className={
            styles.metaLabel
          }
        >
          {
            copy.disciplineLabel
          }
        </span>

        <span>
          {
            copy.identity
          }
        </span>

        <span>
          {
            copy.artDirection
          }
        </span>

        <span>
          {
            copy.digitalDesign
          }
        </span>
      </div>

      <div
        className={
          styles.rightStatement
        }
      >
        <span>
          {
            copy.philosophyLine1
          }
        </span>

        <span>
          {
            copy.philosophyLine2
          }
        </span>

        <span>
          {
            copy.philosophyLine3
          }
        </span>

        <i
          className={
            styles.rightRule
          }
        />
      </div>

      <span
        className={
          styles.tagline
        }
      >
        {
          copy.tagline
        }
      </span>

      <div
        className={
          styles.character
        }
      >
        <Image
          src="/images/projects/5am-vision/aven-cutout.png"
          alt=""
          fill
          sizes="(max-width: 700px) 74vw, (max-width: 960px) 56vw, 42vw"
          className={
            styles.characterImage
          }
          unoptimized
        />
      </div>
    </div>
  );
}