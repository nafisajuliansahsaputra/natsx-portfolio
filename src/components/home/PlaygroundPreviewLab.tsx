"use client";

import type {
  PointerEvent as ReactPointerEvent,
} from "react";

import {
  useEffect,
  useRef,
} from "react";

import styles from "./PlaygroundPreview.module.css";

export default function PlaygroundPreviewLab() {
  const visualRef =
    useRef<HTMLDivElement>(
      null,
    );

  const frameRef =
    useRef<number | null>(
      null,
    );

  const pointerRef =
    useRef({
      clientX:
        0,

      clientY:
        0,
    });

  const interactiveRef =
    useRef(
      false,
    );

  useEffect(() => {
    const supported =
      window.matchMedia(
        "(min-width: 961px) and (hover: hover) and (pointer: fine)",
      );

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );

    const sync =
      () => {
        interactiveRef.current =
          supported.matches &&
          !reducedMotion.matches;
      };

    sync();

    supported.addEventListener(
      "change",
      sync,
    );

    reducedMotion.addEventListener(
      "change",
      sync,
    );

    return () => {
      supported.removeEventListener(
        "change",
        sync,
      );

      reducedMotion.removeEventListener(
        "change",
        sync,
      );

      if (
        frameRef.current !==
        null
      ) {
        window.cancelAnimationFrame(
          frameRef.current,
        );
      }
    };
  }, []);

  function applyPointerMotion() {
    frameRef.current =
      null;

    if (
      !interactiveRef.current
    ) {
      return;
    }

    const element =
      visualRef.current;

    if (!element) {
      return;
    }

    const rect =
      element.getBoundingClientRect();

    if (
      rect.width <=
        0 ||
      rect.height <=
        0
    ) {
      return;
    }

    const {
      clientX,
      clientY,
    } =
      pointerRef.current;

    const x =
      (
        (
          clientX -
          rect.left
        ) /
          rect.width -
        0.5
      ) *
      2;

    const y =
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
      "--lab-x",
      `${x * 24}px`,
    );

    element.style.setProperty(
      "--lab-y",
      `${y * 18}px`,
    );

    element.style.setProperty(
      "--lab-x-reverse",
      `${x * -18}px`,
    );

    element.style.setProperty(
      "--lab-y-reverse",
      `${y * -12}px`,
    );

    element.style.setProperty(
      "--lab-rotate",
      `${x * 2.2}deg`,
    );

    element.style.setProperty(
      "--cursor-x",
      `${
        clientX -
        rect.left
      }px`,
    );

    element.style.setProperty(
      "--cursor-y",
      `${
        clientY -
        rect.top
      }px`,
    );
  }

  function handlePointerMove(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    if (
      !interactiveRef.current
    ) {
      return;
    }

    pointerRef.current = {
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

  function resetPointer() {
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

    const element =
      visualRef.current;

    if (!element) {
      return;
    }

    [
      "--lab-x",
      "--lab-y",
      "--lab-x-reverse",
      "--lab-y-reverse",
      "--lab-rotate",
      "--cursor-x",
      "--cursor-y",
    ].forEach(
      (
        property,
      ) => {
        element.style.removeProperty(
          property,
        );
      },
    );
  }

  return (
    <div
      ref={
        visualRef
      }
      className={
        styles.lab
      }
      onPointerMove={
        handlePointerMove
      }
      onPointerLeave={
        resetPointer
      }
      data-motion-scroll="home-playground-lab"
    >
      <div
        className={
          styles.labTop
        }
        data-motion-piece="top"
      >
        <span>
          NATSX / LIVE LAB
        </span>

        <span>
          04 EXPERIMENTS
        </span>
      </div>

      <div
        className={
          styles.labType
        }
        aria-hidden="true"
        data-motion-piece="type"
      >
        <span
          className={
            styles.wordPlay
          }
        >
          PLAY
        </span>

        <span
          className={
            styles.wordWith
          }
        >
          WITH
        </span>

        <span
          className={
            styles.wordIdeas
          }
        >
          IDEAS
        </span>
      </div>

      <div
        className={
          styles.labField
        }
        aria-hidden="true"
        data-motion-piece="field"
      >
        {Array.from(
          {
            length:
              24,
          },
          (
            _,
            index,
          ) => (
            <span
              key={
                index
              }
            />
          ),
        )}
      </div>

      <div
        className={
          styles.cursor
        }
        aria-hidden="true"
      />

      <div
        className={
          styles.labBottom
        }
        data-motion-piece="bottom"
      >
        <span>
          MOVE / HOVER / INTERRUPT
        </span>

        <span>
          OPEN LAB ↗
        </span>
      </div>
    </div>
  );
}
