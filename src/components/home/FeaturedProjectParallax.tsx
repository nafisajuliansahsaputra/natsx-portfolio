"use client";

import {
  type ReactNode,
  useEffect,
  useRef,
} from "react";

import styles from "./FeaturedProjectParallax.module.css";


type FeaturedProjectParallaxProps = {
  variant:
    | "spall"
    | "stay"
    | "bast";

  children:
    ReactNode;
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


export default function FeaturedProjectParallax({
  variant,
  children,
}: FeaturedProjectParallaxProps) {
  const rootRef =
    useRef<HTMLDivElement>(
      null,
    );


  useEffect(
    () => {
      const root =
        rootRef.current;

      if (
        !root
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


      const applyMotion =
        () => {
          /*
           * BACKGROUND / decorative layer.
           *
           * Bergerak berlawanan cursor
           * dengan travel kecil.
           */

          root.style.setProperty(
            "--featured-back-x",
            `${currentX * -5}px`,
          );

          root.style.setProperty(
            "--featured-back-y",
            `${currentY * -3}px`,
          );


          /*
           * MAIN / browser / dashboard.
           *
           * Masih berlawanan cursor,
           * tapi sedikit lebih terasa.
           */

          root.style.setProperty(
            "--featured-mid-x",
            `${currentX * -10}px`,
          );

          root.style.setProperty(
            "--featured-mid-y",
            `${currentY * -6}px`,
          );


          /*
           * FOREGROUND.
           *
           * Mengikuti cursor.
           */

          root.style.setProperty(
            "--featured-front-x",
            `${currentX * 15}px`,
          );

          root.style.setProperty(
            "--featured-front-y",
            `${currentY * 9}px`,
          );


          /*
           * Accent kecil seperti status card.
           */

          root.style.setProperty(
            "--featured-accent-x",
            `${currentX * 8}px`,
          );

          root.style.setProperty(
            "--featured-accent-y",
            `${currentY * 5}px`,
          );


          root.style.setProperty(
            "--featured-tilt",
            `${currentX * 0.45}deg`,
          );

          root.style.setProperty(
            "--featured-tilt-inverse",
            `${currentX * -0.25}deg`,
          );
        };


      const tick =
        () => {
          /*
           * Sama dengan feel 5AM.
           */

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


          /*
           * Setelah kembali tepat ke neutral,
           * balikin kontrol ke ambient animation.
           */

          if (
            targetX ===
              0 &&
            targetY ===
              0
          ) {
            root.dataset.parallaxActive =
              "false";
          }
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


          root.dataset.parallaxActive =
            "true";

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
          passive:
            true,
        },
      );

      root.addEventListener(
        "pointerleave",
        handlePointerLeave,
        {
          passive:
            true,
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
        styles.root
      }
      data-featured-parallax={
        variant
      }
      data-parallax-active="false"
    >
      {
        children
      }
    </div>
  );
}