"use client";

import type {
  ReactNode,
} from "react";

import {
  useEffect,
  useRef,
} from "react";

type FiveAmVisionMotionRootProps = {
  children:
    ReactNode;

  className:
    string;

  mode:
    | "home"
    | "archive";
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

export default function FiveAmVisionMotionRoot({
  children,
  className,
  mode,
}: FiveAmVisionMotionRootProps) {
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

      let inView =
        false;

      const syncActivity =
        () => {
          root.dataset.visionActive =
            inView &&
            !document.hidden
              ? "true"
              : "false";
        };

      const observer =
        typeof IntersectionObserver !==
        "undefined"
          ? new IntersectionObserver(
              (
                [
                  entry,
                ],
              ) => {
                inView =
                  Boolean(
                    entry
                      ?.isIntersecting,
                  );

                syncActivity();
              },
              {
                rootMargin:
                  "15% 0px 15% 0px",

                threshold:
                  0,
              },
            )
          : null;

      if (observer) {
        observer.observe(
          root,
        );
      } else {
        inView =
          true;

        syncActivity();
      }

      document.addEventListener(
        "visibilitychange",
        syncActivity,
      );

      return () => {
        observer
          ?.disconnect();

        document.removeEventListener(
          "visibilitychange",
          syncActivity,
        );

        delete root.dataset
          .visionActive;
      };
    },
    [],
  );

  useEffect(
    () => {
      const root =
        rootRef.current;

      if (
        !root ||
        mode ===
          "archive"
      ) {
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
      let pointerFrame = 0;

      let pointerClientX = 0;
      let pointerClientY = 0;


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


      const applyPointerTarget =
        () => {
          pointerFrame =
            0;

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
              pointerClientX -
              bounds.left
            ) /
            bounds.width;

          const localY =
            (
              pointerClientY -
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


      const handlePointerMove =
        (
          event:
            PointerEvent,
        ) => {
          pointerClientX =
            event.clientX;

          pointerClientY =
            event.clientY;

          if (
            pointerFrame
          ) {
            return;
          }

          pointerFrame =
            window.requestAnimationFrame(
              applyPointerTarget,
            );
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

        if (
          pointerFrame
        ) {
          window.cancelAnimationFrame(
            pointerFrame,
          );
        }
      };
    },
    [
      mode,
    ],
  );

  return (
    <div
      ref={
        rootRef
      }
      className={
        className
      }
      data-vision-mode={
        mode
      }
      data-vision-active="false"
      aria-hidden="true"
    >
      {
        children
      }
    </div>
  );
}
