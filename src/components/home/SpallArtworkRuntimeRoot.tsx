"use client";

import type {
  ReactNode,
} from "react";

import {
  useEffect,
  useRef,
} from "react";

type SpallArtworkRuntimeRootProps = {
  children:
    ReactNode;

  className:
    string;
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

export default function SpallArtworkRuntimeRoot({
  children,
  className,
}: SpallArtworkRuntimeRootProps) {
  const artworkRef =
    useRef<HTMLDivElement>(
      null,
    );

  useEffect(() => {
    const artwork =
      artworkRef.current;

    if (!artwork) {
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

    let pointerFrame =
      0;

    let pointerClientX =
      0;

    let pointerClientY =
      0;

    function applyMotion() {
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

      artwork.style.setProperty(
        "--spall-top-x",
        `${currentX * -12}px`,
      );

      artwork.style.setProperty(
        "--spall-top-y",
        `${currentY * -7}px`,
      );

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

    function applyPointerTarget() {
      pointerFrame =
        0;

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
    }

    function handlePointerMove(
      event: PointerEvent,
    ) {
      if (
        event.pointerType ===
        "touch"
      ) {
        return;
      }

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
    }

    function resetMotion() {
      if (
        pointerFrame
      ) {
        window.cancelAnimationFrame(
          pointerFrame,
        );

        pointerFrame =
          0;
      }

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

      if (
        pointerFrame
      ) {
        window.cancelAnimationFrame(
          pointerFrame,
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
  }, []);

  return (
    <div
      ref={
        artworkRef
      }
      className={
        className
      }
      data-spall-featured="true"
    >
      {
        children
      }
    </div>
  );
}
