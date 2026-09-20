"use client";

import type {
  ReactNode,
} from "react";

import {
  useEffect,
  useRef,
} from "react";

type AttendanceArtworkRuntimeRootProps = {
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

export default function AttendanceArtworkRuntimeRoot({
  children,
  className,
}: AttendanceArtworkRuntimeRootProps) {
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

    const artworkElement:
      HTMLDivElement =
      artwork;

    const finePointer =
      window.matchMedia(
        "(hover: hover) and (pointer: fine)",
      );

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );

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

    function clearMotionProperties() {
      [
        "--attendance-copy-x",
        "--attendance-copy-y",
        "--attendance-copy-rotate",
      ].forEach(
        (
          property,
        ) => {
          artworkElement.style.removeProperty(
            property,
          );
        },
      );
    }

    function applyMotion() {
      artworkElement.style.setProperty(
        "--attendance-copy-x",
        `${currentX * -22}px`,
      );

      artworkElement.style.setProperty(
        "--attendance-copy-y",
        `${currentY * -13}px`,
      );

      artworkElement.style.setProperty(
        "--attendance-copy-rotate",
        `${currentX * -0.16}deg`,
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

      if (
        !finePointer.matches ||
        reducedMotion.matches
      ) {
        return;
      }

      const bounds =
        artworkElement.getBoundingClientRect();

      if (
        bounds.width <=
          0 ||
        bounds.height <=
          0
      ) {
        return;
      }

      targetX =
        clamp(
          (
            (
              pointerClientX -
              bounds.left
            ) /
              bounds.width
          ) *
            2 -
            1,
        );

      targetY =
        clamp(
          (
            (
              pointerClientY -
              bounds.top
            ) /
              bounds.height
          ) *
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
          "touch" ||
        !finePointer.matches ||
        reducedMotion.matches
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

      if (
        reducedMotion.matches ||
        !finePointer.matches
      ) {
        currentX =
          0;

        currentY =
          0;

        clearMotionProperties();

        return;
      }

      requestTick();
    }

    artworkElement.addEventListener(
      "pointermove",
      handlePointerMove,
      {
        passive:
          true,
      },
    );

    artworkElement.addEventListener(
      "pointerleave",
      resetMotion,
    );

    artworkElement.addEventListener(
      "pointercancel",
      resetMotion,
    );

    window.addEventListener(
      "blur",
      resetMotion,
    );

    finePointer.addEventListener(
      "change",
      resetMotion,
    );

    reducedMotion.addEventListener(
      "change",
      resetMotion,
    );

    return () => {
      artworkElement.removeEventListener(
        "pointermove",
        handlePointerMove,
      );

      artworkElement.removeEventListener(
        "pointerleave",
        resetMotion,
      );

      artworkElement.removeEventListener(
        "pointercancel",
        resetMotion,
      );

      window.removeEventListener(
        "blur",
        resetMotion,
      );

      finePointer.removeEventListener(
        "change",
        resetMotion,
      );

      reducedMotion.removeEventListener(
        "change",
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

      clearMotionProperties();
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
      data-attendance-featured="true"
    >
      {
        children
      }
    </div>
  );
}
