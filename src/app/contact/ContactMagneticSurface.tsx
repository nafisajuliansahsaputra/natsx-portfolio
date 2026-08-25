"use client";

import type {
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from "react";

import {
  useEffect,
  useRef,
} from "react";

import styles from "./ContactMagneticSurface.module.css";

type ContactMagneticSurfaceProps = {
  children: ReactNode;
};

type PointerState = {
  element:
    HTMLDivElement |
    null;

  clientX:
    number;

  clientY:
    number;
};

function shouldDisableMagneticMotion() {
  if (
    typeof window ===
    "undefined"
  ) {
    return true;
  }

  return (
    window.innerWidth <=
      960 ||
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
  const frameRef =
    useRef<number | null>(
      null,
    );

  const pointerRef =
    useRef<PointerState>({
      element:
        null,

      clientX:
        0,

      clientY:
        0,
    });

  useEffect(
    () => () => {
      if (
        frameRef.current !==
        null
      ) {
        window.cancelAnimationFrame(
          frameRef.current,
        );
      }
    },
    [],
  );

  function applyPointerMotion() {
    frameRef.current =
      null;

    const {
      element,
      clientX,
      clientY,
    } =
      pointerRef.current;

    if (
      !element ||
      shouldDisableMagneticMotion()
    ) {
      return;
    }

    const rect =
      element.getBoundingClientRect();

    if (
      rect.width ===
        0 ||
      rect.height ===
        0
    ) {
      return;
    }

    const normalizedX =
      (
        (
          clientX -
          rect.left
        ) /
          rect.width -
        0.5
      ) *
      2;

    const normalizedY =
      (
        (
          clientY -
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

  function handlePointerMove(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    if (
      event.pointerType ===
        "touch" ||
      shouldDisableMagneticMotion()
    ) {
      return;
    }

    pointerRef.current = {
      element:
        event.currentTarget,

      clientX:
        event.clientX,

      clientY:
        event.clientY,
    };

    if (
      frameRef.current !==
      null
    ) {
      return;
    }

    frameRef.current =
      window.requestAnimationFrame(
        applyPointerMotion,
      );
  }

  function resetPointer(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    if (
      frameRef.current !==
      null
    ) {
      window.cancelAnimationFrame(
        frameRef.current,
      );

      frameRef.current =
        null;
    }

    pointerRef.current = {
      element:
        null,

      clientX:
        0,

      clientY:
        0,
    };

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
      onPointerCancel={
        resetPointer
      }
    >
      {children}
    </div>
  );
}