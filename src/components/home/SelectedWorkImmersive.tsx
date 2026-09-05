"use client";

import {
  useEffect,
} from "react";

import styles from "./SelectedWorkImmersive.module.css";

type ProjectMotionState = {
  project: HTMLElement;
  header: HTMLElement | null;
  visual: HTMLElement;
  visualInner: HTMLElement;
  footer: HTMLElement | null;

  number: HTMLElement | null;
  title: HTMLElement | null;
  year: HTMLElement | null;

  pointerInside: boolean;

  pointerX: number;
  pointerY: number;
  pointerRotate: number;

  targetPointerX: number;
  targetPointerY: number;
  targetPointerRotate: number;
};

function clamp(
  value: number,
  min: number,
  max: number,
) {
  return Math.min(
    Math.max(
      value,
      min,
    ),
    max,
  );
}

function damp(
  current: number,
  target: number,
  lambda: number,
  deltaTime: number,
) {
  return (
    current +
    (
      target -
      current
    ) *
      (
        1 -
        Math.exp(
          -lambda *
            deltaTime,
        )
      )
  );
}

function getDirectChildren(
  element: HTMLElement,
) {
  return Array.from(
    element.children,
  ).filter(
    (
      child,
    ): child is HTMLElement =>
      child instanceof HTMLElement,
  );
}

export default function SelectedWorkImmersive() {
  useEffect(() => {
    const section =
      document.getElementById(
        "work",
      );

    if (!section) {
      return;
    }

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );

    if (
      reducedMotion.matches
    ) {
      return;
    }

    const finePointer =
      window.matchMedia(
        "(hover: hover) and (pointer: fine)",
      );

    const mobile =
      window.matchMedia(
        "(max-width: 700px)",
      );

    const projectElements =
      Array.from(
        section.querySelectorAll<HTMLElement>(
          '[data-motion-scroll="project"]',
        ),
      );

    if (
      projectElements.length ===
      0
    ) {
      return;
    }

    const states =
      projectElements
        .map(
          (
            project,
          ): ProjectMotionState | null => {
            const children =
              getDirectChildren(
                project,
              );

            const header =
              children[0] ??
              null;

            const visual =
              children[1] ??
              null;

            const footer =
              children[2] ??
              null;

            if (
              !visual
            ) {
              return null;
            }

            const visualInner =
              visual.firstElementChild;

            if (
              !(
                visualInner instanceof
                HTMLElement
              )
            ) {
              return null;
            }

            const headerChildren =
              header
                ? getDirectChildren(
                    header,
                  )
                : [];

            const number =
              headerChildren[0] ??
              null;

            const title =
              header?.querySelector<HTMLElement>(
                "h3",
              ) ??
              null;

            const year =
              headerChildren.at(
                -1,
              ) ??
              null;

            project.dataset
              .selectedWorkImmersive =
              "true";

            project.dataset
              .selectedWorkActive =
              "false";

            header?.setAttribute(
              "data-selected-work-layer",
              "header",
            );

            footer?.setAttribute(
              "data-selected-work-layer",
              "footer",
            );

            visual.setAttribute(
              "data-selected-work-visual",
              "true",
            );

            visualInner.setAttribute(
              "data-selected-work-visual-inner",
              "true",
            );

            number?.setAttribute(
              "data-selected-work-number",
              "true",
            );

            title?.setAttribute(
              "data-selected-work-title",
              "true",
            );

            year?.setAttribute(
              "data-selected-work-year",
              "true",
            );

            project.style.setProperty(
              "--sw-scroll-y",
              "0px",
            );

            project.style.setProperty(
              "--sw-header-y",
              "0px",
            );

            project.style.setProperty(
              "--sw-footer-y",
              "0px",
            );

            project.style.setProperty(
              "--sw-pointer-x",
              "0px",
            );

            project.style.setProperty(
              "--sw-pointer-y",
              "0px",
            );

            project.style.setProperty(
              "--sw-pointer-rotate",
              "0deg",
            );

            project.style.setProperty(
              "--sw-visual-scale",
              "1",
            );

            project.style.setProperty(
              "--sw-frame-opacity",
              "0",
            );

            project.style.setProperty(
              "--sw-meta-opacity",
              "1",
            );

            return {
              project,
              header,
              visual,
              visualInner,
              footer,

              number,
              title,
              year,

              pointerInside:
                false,

              pointerX:
                0,

              pointerY:
                0,

              pointerRotate:
                0,

              targetPointerX:
                0,

              targetPointerY:
                0,

              targetPointerRotate:
                0,
            };
          },
        )
        .filter(
          (
            state,
          ): state is ProjectMotionState =>
            state !== null,
        );

    if (
      states.length ===
      0
    ) {
      return;
    }

    let measureFrame =
      0;

    let pointerFrame =
      0;

    let previousPointerTime =
      performance.now();

    let destroyed =
      false;

    const pointerCleanups:
      Array<
        () => void
      > = [];

    /*
     * =========================
     * SCROLL SCENE
     * =========================
     *
     * Kita tidak memindahkan section.
     * Hanya memberi depth ringan pada
     * lapisan-lapisan di dalam project.
     */

    const measureProjects =
      () => {
        measureFrame =
          0;

        if (
          destroyed
        ) {
          return;
        }

        const viewportHeight =
          Math.max(
            window.innerHeight,
            1,
          );

        const focusLine =
          viewportHeight *
          0.52;

        const compact =
          mobile.matches;

        const maximumVisualTravel =
          compact
            ? 6
            : 20;

        const maximumHeaderTravel =
          compact
            ? 2
            : 6;

        const maximumFooterTravel =
          compact
            ? 2
            : 7;

        const scaleStrength =
          compact
            ? 0.0015
            : 0.006;

        let nearestIndex =
          0;

        let nearestDistance =
          Number.POSITIVE_INFINITY;

        states.forEach(
          (
            state,
            index,
          ) => {
            const rect =
              state.visual.getBoundingClientRect();

            const visualCenter =
              rect.top +
              rect.height /
                2;

            const distance =
              visualCenter -
              focusLine;

            const absoluteDistance =
              Math.abs(
                distance,
              );

            if (
              absoluteDistance <
              nearestDistance
            ) {
              nearestDistance =
                absoluteDistance;

              nearestIndex =
                index;
            }

            const progress =
              clamp(
                distance /
                  (
                    viewportHeight *
                    0.92
                  ),
                -1,
                1,
              );

            const activeStrength =
              clamp(
                1 -
                  absoluteDistance /
                    (
                      viewportHeight *
                      0.78
                    ),
                0,
                1,
              );

            /*
             * Artwork bergerak sedikit
             * melawan perjalanan viewport.
             */
            const visualY =
              -progress *
              maximumVisualTravel;

            /*
             * Header dan footer sengaja
             * punya arah / magnitude berbeda.
             * Ini menciptakan layered depth.
             */
            const headerY =
              -progress *
              maximumHeaderTravel;

            const footerY =
              progress *
              maximumFooterTravel;

            const visualScale =
              1 +
              activeStrength *
                scaleStrength;

            const frameOpacity =
              activeStrength *
              (
                compact
                  ? 0.08
                  : 0.18
              );

            const metaOpacity =
              0.82 +
              activeStrength *
                0.18;

            state.project.style.setProperty(
              "--sw-scroll-y",
              `${visualY.toFixed(
                3,
              )}px`,
            );

            state.project.style.setProperty(
              "--sw-header-y",
              `${headerY.toFixed(
                3,
              )}px`,
            );

            state.project.style.setProperty(
              "--sw-footer-y",
              `${footerY.toFixed(
                3,
              )}px`,
            );

            state.project.style.setProperty(
              "--sw-visual-scale",
              visualScale.toFixed(
                5,
              ),
            );

            state.project.style.setProperty(
              "--sw-frame-opacity",
              frameOpacity.toFixed(
                4,
              ),
            );

            state.project.style.setProperty(
              "--sw-meta-opacity",
              metaOpacity.toFixed(
                4,
              ),
            );
          },
        );

        states.forEach(
          (
            state,
            index,
          ) => {
            state.project.dataset
              .selectedWorkActive =
              index ===
              nearestIndex
                ? "true"
                : "false";
          },
        );
      };

    const requestMeasure =
      () => {
        if (
          measureFrame !==
          0
        ) {
          return;
        }

        measureFrame =
          window.requestAnimationFrame(
            measureProjects,
          );
      };

    /*
     * =========================
     * POINTER DEPTH
     * =========================
     *
     * Bukan magnetic besar.
     * Artwork hanya mengikuti cursor
     * beberapa pixel supaya terasa hidup.
     */

    const runPointerFrame =
      (
        timestamp: number,
      ) => {
        pointerFrame =
          0;

        if (
          destroyed
        ) {
          return;
        }

        const deltaTime =
          Math.min(
            (
              timestamp -
              previousPointerTime
            ) /
              1000,
            0.064,
          );

        previousPointerTime =
          timestamp;

        let keepAnimating =
          false;

        states.forEach(
          (
            state,
          ) => {
            const lambda =
              state.pointerInside
                ? 13
                : 8.5;

            state.pointerX =
              damp(
                state.pointerX,
                state.targetPointerX,
                lambda,
                deltaTime,
              );

            state.pointerY =
              damp(
                state.pointerY,
                state.targetPointerY,
                lambda,
                deltaTime,
              );

            state.pointerRotate =
              damp(
                state.pointerRotate,
                state.targetPointerRotate,
                lambda,
                deltaTime,
              );

            state.project.style.setProperty(
              "--sw-pointer-x",
              `${state.pointerX.toFixed(
                3,
              )}px`,
            );

            state.project.style.setProperty(
              "--sw-pointer-y",
              `${state.pointerY.toFixed(
                3,
              )}px`,
            );

            state.project.style.setProperty(
              "--sw-pointer-rotate",
              `${state.pointerRotate.toFixed(
                4,
              )}deg`,
            );

            const distanceToTarget =
              Math.abs(
                state.pointerX -
                  state.targetPointerX,
              ) +
              Math.abs(
                state.pointerY -
                  state.targetPointerY,
              ) +
              Math.abs(
                state.pointerRotate -
                  state.targetPointerRotate,
              );

            if (
              distanceToTarget >
              0.01
            ) {
              keepAnimating =
                true;
            }
          },
        );

        if (
          keepAnimating
        ) {
          pointerFrame =
            window.requestAnimationFrame(
              runPointerFrame,
            );
        }
      };

    const requestPointerFrame =
      () => {
        if (
          pointerFrame !==
          0
        ) {
          return;
        }

        previousPointerTime =
          performance.now();

        pointerFrame =
          window.requestAnimationFrame(
            runPointerFrame,
          );
      };

    states.forEach(
      (
        state,
      ) => {
        const handlePointerMove =
          (
            event: PointerEvent,
          ) => {
            if (
              !finePointer.matches
            ) {
              return;
            }

            const rect =
              state.visual.getBoundingClientRect();

            if (
              rect.width <=
                0 ||
              rect.height <=
                0
            ) {
              return;
            }

            const normalizedX =
              clamp(
                (
                  (
                    event.clientX -
                    rect.left
                  ) /
                    rect.width
                ) *
                  2 -
                  1,
                -1,
                1,
              );

            const normalizedY =
              clamp(
                (
                  (
                    event.clientY -
                    rect.top
                  ) /
                    rect.height
                ) *
                  2 -
                  1,
                -1,
                1,
              );

            state.pointerInside =
              true;

            state.targetPointerX =
              normalizedX *
              8;

            state.targetPointerY =
              normalizedY *
              6;

            state.targetPointerRotate =
              normalizedX *
              0.14;

            requestPointerFrame();
          };

        const handlePointerLeave =
          () => {
            state.pointerInside =
              false;

            state.targetPointerX =
              0;

            state.targetPointerY =
              0;

            state.targetPointerRotate =
              0;

            requestPointerFrame();
          };

        state.visual.addEventListener(
          "pointermove",
          handlePointerMove,
          {
            passive: true,
          },
        );

        state.visual.addEventListener(
          "pointerleave",
          handlePointerLeave,
        );

        state.visual.addEventListener(
          "pointercancel",
          handlePointerLeave,
        );

        pointerCleanups.push(
          () => {
            state.visual.removeEventListener(
              "pointermove",
              handlePointerMove,
            );

            state.visual.removeEventListener(
              "pointerleave",
              handlePointerLeave,
            );

            state.visual.removeEventListener(
              "pointercancel",
              handlePointerLeave,
            );
          },
        );
      },
    );

    window.addEventListener(
      "scroll",
      requestMeasure,
      {
        passive: true,
      },
    );

    window.addEventListener(
      "resize",
      requestMeasure,
    );

    const resizeObserver =
      typeof ResizeObserver !==
      "undefined"
        ? new ResizeObserver(
            () => {
              requestMeasure();
            },
          )
        : null;

    resizeObserver?.observe(
      section,
    );

    measureProjects();

    return () => {
      destroyed =
        true;

      window.removeEventListener(
        "scroll",
        requestMeasure,
      );

      window.removeEventListener(
        "resize",
        requestMeasure,
      );

      resizeObserver?.disconnect();

      pointerCleanups.forEach(
        (
          cleanup,
        ) => {
          cleanup();
        },
      );

      if (
        measureFrame !==
        0
      ) {
        window.cancelAnimationFrame(
          measureFrame,
        );
      }

      if (
        pointerFrame !==
        0
      ) {
        window.cancelAnimationFrame(
          pointerFrame,
        );
      }

      states.forEach(
        (
          state,
        ) => {
          delete state.project.dataset
            .selectedWorkImmersive;

          delete state.project.dataset
            .selectedWorkActive;

          state.header?.removeAttribute(
            "data-selected-work-layer",
          );

          state.footer?.removeAttribute(
            "data-selected-work-layer",
          );

          state.visual.removeAttribute(
            "data-selected-work-visual",
          );

          state.visualInner.removeAttribute(
            "data-selected-work-visual-inner",
          );

          state.number?.removeAttribute(
            "data-selected-work-number",
          );

          state.title?.removeAttribute(
            "data-selected-work-title",
          );

          state.year?.removeAttribute(
            "data-selected-work-year",
          );

          [
            "--sw-scroll-y",
            "--sw-header-y",
            "--sw-footer-y",
            "--sw-pointer-x",
            "--sw-pointer-y",
            "--sw-pointer-rotate",
            "--sw-visual-scale",
            "--sw-frame-opacity",
            "--sw-meta-opacity",
          ].forEach(
            (
              property,
            ) => {
              state.project.style.removeProperty(
                property,
              );
            },
          );
        },
      );
    };
  }, []);

  return (
    <span
      className={
        styles.mount
      }
      aria-hidden="true"
    />
  );
}