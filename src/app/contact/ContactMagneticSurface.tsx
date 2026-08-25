"use client";

import type {
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from "react";

import styles from "./ContactMagneticSurface.module.css";

type ContactMagneticSurfaceProps = {
  children: ReactNode;
};

function shouldReduceMotion() {
  if (
    typeof window ===
    "undefined"
  ) {
    return true;
  }

  return (
    window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches ||
    !window.matchMedia(
      "(pointer: fine)",
    ).matches
  );
}

export default function ContactMagneticSurface({
  children,
}: ContactMagneticSurfaceProps) {
  function handlePointerMove(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    if (
      shouldReduceMotion() ||
      event.pointerType ===
        "touch"
    ) {
      return;
    }

    const element =
      event.currentTarget;

    const rect =
      element.getBoundingClientRect();

    if (
      rect.width === 0 ||
      rect.height === 0
    ) {
      return;
    }

    const normalizedX =
      (
        (
          event.clientX -
          rect.left
        ) /
          rect.width -
        0.5
      ) *
      2;

    const normalizedY =
      (
        (
          event.clientY -
          rect.top
        ) /
          rect.height -
        0.5
      ) *
      2;

    element.style.setProperty(
      "--contact-magnetic-x",
      `${normalizedX * 8}px`,
    );

    element.style.setProperty(
      "--contact-magnetic-y",
      `${normalizedY * 5}px`,
    );
  }

  function resetPointer(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    event.currentTarget.style.setProperty(
      "--contact-magnetic-x",
      "0px",
    );

    event.currentTarget.style.setProperty(
      "--contact-magnetic-y",
      "0px",
    );
  }

  return (
    <div
      className={
        styles.surface
      }
      data-contact-magnetic
      data-motion-scroll="contact-email"
      onPointerMove={
        handlePointerMove
      }
      onPointerLeave={
        resetPointer
      }
    >
      {children}
    </div>
  );
}