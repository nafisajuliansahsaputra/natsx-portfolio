"use client";

import {
  useEffect,
  useRef,
} from "react";

import styles from "./HeroAmbientSignature.module.css";

/*
 * More vertices than V1.
 *
 * Dense enough to create organic curves,
 * but still light for a single Hero scene.
 */
const GRID_COLUMNS =
  18;

const GRID_ROWS =
  22;

const CURVE_TENSION =
  0.72;

type GridVertex = {
  baseX: number;
  baseY: number;

  x: number;
  y: number;

  velocityX: number;
  velocityY: number;

  targetX: number;
  targetY: number;
};

type Point = {
  x: number;
  y: number;
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

function getVertexIndex(
  row: number,
  column: number,
) {
  return (
    row *
      (
        GRID_COLUMNS +
        1
      ) +
    column
  );
}

/*
 * ==================================
 * CATMULL-ROM → CUBIC BÉZIER
 * ==================================
 *
 * Grid vertex tetap menjadi control data,
 * tetapi garis yang terlihat bukan lagi
 * straight segment antarvertex.
 *
 * Hasilnya jauh lebih fluid.
 */
function createSmoothPath(
  points: Point[],
) {
  if (
    points.length ===
    0
  ) {
    return "";
  }

  if (
    points.length ===
    1
  ) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  let path =
    `M ${points[0].x.toFixed(
      2,
    )} ${points[0].y.toFixed(
      2,
    )}`;

  for (
    let index = 0;
    index <
    points.length - 1;
    index += 1
  ) {
    const previous =
      points[
        Math.max(
          index - 1,
          0,
        )
      ];

    const current =
      points[
        index
      ];

    const next =
      points[
        index + 1
      ];

    const afterNext =
      points[
        Math.min(
          index + 2,
          points.length - 1,
        )
      ];

    const control1X =
      current.x +
      (
        next.x -
        previous.x
      ) /
        6 *
        CURVE_TENSION;

    const control1Y =
      current.y +
      (
        next.y -
        previous.y
      ) /
        6 *
        CURVE_TENSION;

    const control2X =
      next.x -
      (
        afterNext.x -
        current.x
      ) /
        6 *
        CURVE_TENSION;

    const control2Y =
      next.y -
      (
        afterNext.y -
        current.y
      ) /
        6 *
        CURVE_TENSION;

    path +=
      ` C ${control1X.toFixed(
        2,
      )} ${control1Y.toFixed(
        2,
      )}, ${control2X.toFixed(
        2,
      )} ${control2Y.toFixed(
        2,
      )}, ${next.x.toFixed(
        2,
      )} ${next.y.toFixed(
        2,
      )}`;
  }

  return path;
}

export default function HeroAmbientSignature() {
  const rootRef =
    useRef<HTMLDivElement>(
      null,
    );

  const stageRef =
    useRef<HTMLDivElement>(
      null,
    );

  const svgRef =
    useRef<SVGSVGElement>(
      null,
    );

  const horizontalRefs =
    useRef<
      Array<
        SVGPathElement | null
      >
    >(
      [],
    );

  const verticalRefs =
    useRef<
      Array<
        SVGPathElement | null
      >
    >(
      [],
    );

  useEffect(() => {
    const root =
      rootRef.current;

    const stage =
      stageRef.current;

    const svg =
      svgRef.current;

    if (
      !root ||
      !stage ||
      !svg
    ) {
      return;
    }

    const hero =
      root.closest<HTMLElement>(
        "[data-home-hero]",
      );

    if (!hero) {
      return;
    }

    const visual =
      hero.querySelector<HTMLElement>(
        '[data-motion-hero-piece="visual"]',
      );

    if (!visual) {
      return;
    }

    /*
     * Stable non-null references.
     */
    const stageElement =
      stage;

    const svgElement =
      svg;

    const heroElement =
      hero;

    const visualElement =
      visual;

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );

    const finePointer =
      window.matchMedia(
        "(hover: hover) and (pointer: fine)",
      );

    let width =
      0;

    let height =
      0;

    let vertices:
      GridVertex[] =
      [];

    let pointerX =
      0;

    let pointerY =
      0;

    let pointerActive =
      false;

    let frameId:
      | number
      | null =
      null;

    let previousTime =
      performance.now();

    let destroyed =
      false;

    /*
     * =========================
     * BUILD GRID
     * =========================
     */

    function buildGrid() {
      const heroRect =
        heroElement.getBoundingClientRect();

      const visualRect =
        visualElement.getBoundingClientRect();

      width =
        Math.max(
          visualRect.width,
          1,
        );

      height =
        Math.max(
          visualRect.height,
          1,
        );

      stageElement.style.left =
        `${
          visualRect.left -
          heroRect.left
        }px`;

      stageElement.style.top =
        `${
          visualRect.top -
          heroRect.top
        }px`;

      stageElement.style.width =
        `${width}px`;

      stageElement.style.height =
        `${height}px`;

      svgElement.setAttribute(
        "viewBox",
        `0 0 ${width} ${height}`,
      );

      const nextVertices:
        GridVertex[] =
        [];

      for (
        let row = 0;
        row <=
        GRID_ROWS;
        row += 1
      ) {
        for (
          let column = 0;
          column <=
          GRID_COLUMNS;
          column += 1
        ) {
          const x =
            (
              column /
              GRID_COLUMNS
            ) *
            width;

          const y =
            (
              row /
              GRID_ROWS
            ) *
            height;

          nextVertices.push(
            {
              baseX:
                x,

              baseY:
                y,

              x,
              y,

              velocityX:
                0,

              velocityY:
                0,

              targetX:
                x,

              targetY:
                y,
            },
          );
        }
      }

      vertices =
        nextVertices;

      updateLines();

      stageElement.dataset.gridReady =
        "true";
    }

    /*
     * =========================
     * DRAW SMOOTH PATHS
     * =========================
     */

    function updateLines() {
      if (
        vertices.length ===
        0
      ) {
        return;
      }

      /*
       * Horizontal.
       */
      for (
        let row = 0;
        row <=
        GRID_ROWS;
        row += 1
      ) {
        const pathElement =
          horizontalRefs.current[
            row
          ];

        if (
          !pathElement
        ) {
          continue;
        }

        const points:
          Point[] =
          [];

        for (
          let column = 0;
          column <=
          GRID_COLUMNS;
          column += 1
        ) {
          const vertex =
            vertices[
              getVertexIndex(
                row,
                column,
              )
            ];

          if (
            !vertex
          ) {
            continue;
          }

          points.push(
            {
              x:
                vertex.x,

              y:
                vertex.y,
            },
          );
        }

        pathElement.setAttribute(
          "d",
          createSmoothPath(
            points,
          ),
        );
      }

      /*
       * Vertical.
       */
      for (
        let column = 0;
        column <=
        GRID_COLUMNS;
        column += 1
      ) {
        const pathElement =
          verticalRefs.current[
            column
          ];

        if (
          !pathElement
        ) {
          continue;
        }

        const points:
          Point[] =
          [];

        for (
          let row = 0;
          row <=
          GRID_ROWS;
          row += 1
        ) {
          const vertex =
            vertices[
              getVertexIndex(
                row,
                column,
              )
            ];

          if (
            !vertex
          ) {
            continue;
          }

          points.push(
            {
              x:
                vertex.x,

              y:
                vertex.y,
            },
          );
        }

        pathElement.setAttribute(
          "d",
          createSmoothPath(
            points,
          ),
        );
      }
    }

    /*
     * =========================
     * SOFT RADIAL FIELD
     * =========================
     */

    function updateTargets() {
      const fieldRadius =
        clamp(
          Math.min(
            width,
            height,
          ) *
            0.42,
          190,
          290,
        );

      /*
       * Less displacement than V1.
       *
       * Smooth deformation looks stronger
       * visually even with smaller travel.
       */
      const maxDisplacement =
        clamp(
          width *
            0.043,
          20,
          34,
        );

      vertices.forEach(
        (
          vertex,
        ) => {
          if (
            !pointerActive
          ) {
            vertex.targetX =
              vertex.baseX;

            vertex.targetY =
              vertex.baseY;

            return;
          }

          const deltaX =
            vertex.baseX -
            pointerX;

          const deltaY =
            vertex.baseY -
            pointerY;

          const distance =
            Math.sqrt(
              deltaX *
                deltaX +
                deltaY *
                  deltaY,
            );

          if (
            distance >=
            fieldRadius
          ) {
            vertex.targetX =
              vertex.baseX;

            vertex.targetY =
              vertex.baseY;

            return;
          }

          /*
           * Avoid singularity exactly
           * under the pointer.
           */
          const safeDistance =
            Math.max(
              distance,
              0.001,
            );

          const rawForce =
            1 -
            safeDistance /
              fieldRadius;

          /*
           * Softer falloff than V1.
           *
           * Large affected region,
           * smooth center.
           */
          const force =
            Math.pow(
              rawForce,
              2.25,
            );

          const directionX =
            deltaX /
            safeDistance;

          const directionY =
            deltaY /
            safeDistance;

          /*
           * Slightly stronger horizontally.
           *
           * Hero portrait is vertical,
           * so this opens the mesh around
           * the silhouette more elegantly.
           */
          const displacement =
            maxDisplacement *
            force;

          vertex.targetX =
            vertex.baseX +
            directionX *
              displacement *
              1.08;

          vertex.targetY =
            vertex.baseY +
            directionY *
              displacement *
              0.9;
        },
      );
    }

    /*
     * =========================
     * SPRING LOOP
     * =========================
     */

    function renderFrame(
      timestamp: number,
    ) {
      frameId =
        null;

      if (
        destroyed
      ) {
        return;
      }

      const deltaTime =
        Math.min(
          (
            timestamp -
            previousTime
          ) /
            16.667,
          1.8,
        );

      previousTime =
        timestamp;

      updateTargets();

      /*
       * Softer than V1.
       */
      const spring =
        pointerActive
          ? 0.078
          : 0.038;

      const damping =
        pointerActive
          ? 0.78
          : 0.845;

      const correctedDamping =
        Math.pow(
          damping,
          deltaTime,
        );

      let moving =
        false;

      vertices.forEach(
        (
          vertex,
        ) => {
          vertex.velocityX +=
            (
              vertex.targetX -
              vertex.x
            ) *
            spring *
            deltaTime;

          vertex.velocityY +=
            (
              vertex.targetY -
              vertex.y
            ) *
            spring *
            deltaTime;

          vertex.velocityX *=
            correctedDamping;

          vertex.velocityY *=
            correctedDamping;

          vertex.x +=
            vertex.velocityX *
            deltaTime;

          vertex.y +=
            vertex.velocityY *
            deltaTime;

          const distanceToTarget =
            Math.abs(
              vertex.targetX -
              vertex.x,
            ) +
            Math.abs(
              vertex.targetY -
              vertex.y,
            );

          const energy =
            Math.abs(
              vertex.velocityX,
            ) +
            Math.abs(
              vertex.velocityY,
            );

          if (
            distanceToTarget >
              0.018 ||
            energy >
              0.018
          ) {
            moving =
              true;
          }
        },
      );

      updateLines();

      if (
        moving ||
        pointerActive
      ) {
        requestFrame();
      }
    }

    function requestFrame() {
      if (
        frameId !==
        null
      ) {
        return;
      }

      previousTime =
        performance.now();

      frameId =
        window.requestAnimationFrame(
          renderFrame,
        );
    }

    /*
     * =========================
     * POINTER
     * =========================
     */

    function handlePointerEnter() {
      if (
        reducedMotion.matches ||
        !finePointer.matches
      ) {
        return;
      }

      pointerActive =
        true;

      stageElement.dataset.fieldActive =
        "true";

      requestFrame();
    }

    function handlePointerMove(
      event: PointerEvent,
    ) {
      if (
        reducedMotion.matches ||
        !finePointer.matches
      ) {
        return;
      }

      const rect =
        visualElement.getBoundingClientRect();

      pointerX =
        clamp(
          event.clientX -
            rect.left,
          0,
          rect.width,
        );

      pointerY =
        clamp(
          event.clientY -
            rect.top,
          0,
          rect.height,
        );

      pointerActive =
        true;

      stageElement.dataset.fieldActive =
        "true";

      requestFrame();
    }

    function handlePointerLeave() {
      pointerActive =
        false;

      stageElement.dataset.fieldActive =
        "false";

      requestFrame();
    }

    /*
     * =========================
     * RESIZE
     * =========================
     */

    const resizeObserver =
      typeof ResizeObserver !==
      "undefined"
        ? new ResizeObserver(
            () => {
              buildGrid();

              requestFrame();
            },
          )
        : null;

    resizeObserver?.observe(
      heroElement,
    );

    resizeObserver?.observe(
      visualElement,
    );

    buildGrid();

    if (
      !reducedMotion.matches &&
      finePointer.matches
    ) {
      visualElement.addEventListener(
        "pointerenter",
        handlePointerEnter,
      );

      visualElement.addEventListener(
        "pointermove",
        handlePointerMove,
      );

      visualElement.addEventListener(
        "pointerleave",
        handlePointerLeave,
      );

      visualElement.addEventListener(
        "pointercancel",
        handlePointerLeave,
      );
    }

    return () => {
      destroyed =
        true;

      resizeObserver?.disconnect();

      visualElement.removeEventListener(
        "pointerenter",
        handlePointerEnter,
      );

      visualElement.removeEventListener(
        "pointermove",
        handlePointerMove,
      );

      visualElement.removeEventListener(
        "pointerleave",
        handlePointerLeave,
      );

      visualElement.removeEventListener(
        "pointercancel",
        handlePointerLeave,
      );

      if (
        frameId !==
        null
      ) {
        window.cancelAnimationFrame(
          frameId,
        );
      }
    };
  }, []);

  const horizontalLines =
    Array.from(
      {
        length:
          GRID_ROWS +
          1,
      },
      (
        _,
        row,
      ) => {
        const major =
          row %
            6 ===
          0;

        return (
          <path
            key={`row-${row}`}
            ref={(
              node,
            ) => {
              horizontalRefs.current[
                row
              ] =
                node;
            }}
            className={
              major
                ? `${styles.gridLine} ${styles.majorLine}`
                : styles.gridLine
            }
            d=""
          />
        );
      },
    );

  const verticalLines =
    Array.from(
      {
        length:
          GRID_COLUMNS +
          1,
      },
      (
        _,
        column,
      ) => {
        const major =
          column %
            6 ===
          0;

        return (
          <path
            key={`column-${column}`}
            ref={(
              node,
            ) => {
              verticalRefs.current[
                column
              ] =
                node;
            }}
            className={
              major
                ? `${styles.gridLine} ${styles.majorLine}`
                : styles.gridLine
            }
            d=""
          />
        );
      },
    );

  return (
    <div
      ref={
        rootRef
      }
      className={
        styles.signature
      }
      data-hero-ambient-signature
      aria-hidden="true"
    >
      <div
        ref={
          stageRef
        }
        className={
          styles.gridStage
        }
        data-grid-ready="false"
        data-field-active="false"
      >
        <svg
          ref={
            svgRef
          }
          className={
            styles.gridSvg
          }
          preserveAspectRatio="none"
        >
          <g
            className={
              styles.gridGroup
            }
          >
            {
              horizontalLines
            }

            {
              verticalLines
            }
          </g>
        </svg>
      </div>
    </div>
  );
}