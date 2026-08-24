"use client";

import {
  useRef,
} from "react";

import type {
  PointerEvent as ReactPointerEvent,
} from "react";

import type {
  Locale,
} from "@/i18n/config";

import styles from "./PlaygroundLab.module.css";

type PlaygroundLabProps = {
  locale: Locale;
};

type LabCopy = {
  label: string;
  meta: string;

  experiments: {
    kinetic: {
      title: string;
      category: string;
      description: string;
      instruction: string;
    };

    magnetic: {
      title: string;
      category: string;
      description: string;
      instruction: string;
    };

    spatial: {
      title: string;
      category: string;
      description: string;
      instruction: string;
    };

    cursor: {
      title: string;
      category: string;
      description: string;
      instruction: string;
    };
  };
};

const LAB_COPY: Record<
  Locale,
  LabCopy
> = {
  en: {
    label:
      "Live Lab",

    meta:
      "Move / Hover / Interrupt",

    experiments: {
      kinetic: {
        title:
          "Kinetic Type",

        category:
          "Typography / Motion",

        description:
          "A live study in scale, tension, tracking, and how typography can react without losing its structure.",

        instruction:
          "Move the cursor",
      },

      magnetic: {
        title:
          "Magnetic Field",

        category:
          "Interaction / Creative Code",

        description:
          "A responsive field where a rigid system temporarily gives way to the presence of the viewer.",

        instruction:
          "Disturb the field",
      },

      spatial: {
        title:
          "Spatial Composition",

        category:
          "Depth / Composition",

        description:
          "Simple forms are arranged as layers rather than decoration, using movement to reveal hierarchy and depth.",

        instruction:
          "Explore the depth",
      },

      cursor: {
        title:
          "Break the Grid",

        category:
          "Type / Cursor Study",

        description:
          "A typographic system that keeps its editorial rhythm until the cursor begins to interfere with it.",

        instruction:
          "Interrupt the type",
      },
    },
  },

  id: {
    label:
      "Live Lab",

    meta:
      "Gerak / Hover / Ganggu",

    experiments: {
      kinetic: {
        title:
          "Kinetic Type",

        category:
          "Tipografi / Motion",

        description:
          "Eksperimen langsung tentang skala, tension, tracking, dan bagaimana tipografi dapat bereaksi tanpa kehilangan strukturnya.",

        instruction:
          "Gerakkan kursor",
      },

      magnetic: {
        title:
          "Magnetic Field",

        category:
          "Interaksi / Creative Code",

        description:
          "Sebuah field responsif di mana sistem yang kaku sementara bereaksi terhadap kehadiran pengunjung.",

        instruction:
          "Ganggu field-nya",
      },

      spatial: {
        title:
          "Spatial Composition",

        category:
          "Depth / Komposisi",

        description:
          "Bentuk sederhana diperlakukan sebagai layer, bukan dekorasi, dengan gerakan yang memperlihatkan hierarki dan kedalaman.",

        instruction:
          "Jelajahi kedalamannya",
      },

      cursor: {
        title:
          "Break the Grid",

        category:
          "Tipografi / Studi Kursor",

        description:
          "Sistem tipografi yang mempertahankan ritme editorial sampai kursor mulai mengganggu komposisinya.",

        instruction:
          "Ganggu tipografinya",
      },
    },
  },

  de: {
    label:
      "Live Lab",

    meta:
      "Bewegen / Hover / Stören",

    experiments: {
      kinetic: {
        title:
          "Kinetic Type",

        category:
          "Typografie / Motion",

        description:
          "Eine Live-Studie über Maßstab, Spannung, Laufweite und darüber, wie Typografie reagieren kann, ohne ihre Struktur zu verlieren.",

        instruction:
          "Cursor bewegen",
      },

      magnetic: {
        title:
          "Magnetic Field",

        category:
          "Interaktion / Creative Code",

        description:
          "Ein reaktives Feld, in dem ein starres System vorübergehend auf die Anwesenheit des Betrachters reagiert.",

        instruction:
          "Das Feld stören",
      },

      spatial: {
        title:
          "Spatial Composition",

        category:
          "Tiefe / Komposition",

        description:
          "Einfache Formen werden als räumliche Ebenen behandelt, deren Bewegung Hierarchie und Tiefe sichtbar macht.",

        instruction:
          "Tiefe erkunden",
      },

      cursor: {
        title:
          "Break the Grid",

        category:
          "Typografie / Cursor-Studie",

        description:
          "Ein typografisches System behält seinen redaktionellen Rhythmus, bis der Cursor beginnt, die Komposition zu stören.",

        instruction:
          "Typografie stören",
      },
    },
  },
};

const MAGNETIC_COLUMNS =
  9;

const MAGNETIC_ROWS =
  6;

const MAGNETIC_DOTS =
  Array.from(
    {
      length:
        MAGNETIC_COLUMNS *
        MAGNETIC_ROWS,
    },
    (
      _,
      index,
    ) => ({
      id:
        index,

      column:
        index %
        MAGNETIC_COLUMNS,

      row:
        Math.floor(
          index /
            MAGNETIC_COLUMNS,
        ),
    }),
  );

function isReducedMotion() {
  if (
    typeof window ===
    "undefined"
  ) {
    return false;
  }

  return window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
}

function getNormalizedPointer(
  event: ReactPointerEvent<HTMLElement>,
) {
  const rect =
    event.currentTarget.getBoundingClientRect();

  const localX =
    event.clientX -
    rect.left;

  const localY =
    event.clientY -
    rect.top;

  const normalizedX =
    (
      localX /
        rect.width -
      0.5
    ) *
    2;

  const normalizedY =
    (
      localY /
        rect.height -
      0.5
    ) *
    2;

  return {
    rect,
    localX,
    localY,
    normalizedX,
    normalizedY,
  };
}

export default function PlaygroundLab({
  locale,
}: PlaygroundLabProps) {
  const copy =
    LAB_COPY[
      locale
    ];

  return (
    <section
      className={
        styles.lab
      }
      aria-labelledby="playground-live-lab"
    >
      <div className="site-container">
        <div
          className={
            styles.labHeader
          }
          data-motion-scroll="playground-lab-header"
        >
          <div
            className={
              styles.labLabel
            }
          >
            <span
              className={
                styles.labDot
              }
            />

            <span
              id="playground-live-lab"
            >
              {
                copy.label
              }
            </span>
          </div>

          <span
            className={
              styles.labMeta
            }
          >
            {
              copy.meta
            }
          </span>
        </div>
      </div>

      <div
        className={
          styles.experiments
        }
      >
        <KineticExperiment
          copy={
            copy.experiments
              .kinetic
          }
        />

        <MagneticExperiment
          copy={
            copy.experiments
              .magnetic
          }
        />

        <SpatialExperiment
          copy={
            copy.experiments
              .spatial
          }
        />

        <CursorExperiment
          copy={
            copy.experiments
              .cursor
          }
        />
      </div>
    </section>
  );
}

function KineticExperiment({
  copy,
}: {
  copy:
    LabCopy["experiments"]["kinetic"];
}) {
  const visualRef =
    useRef<HTMLDivElement>(
      null,
    );

  function handlePointerMove(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    if (
      isReducedMotion()
    ) {
      return;
    }

    const element =
      visualRef.current;

    if (
      !element
    ) {
      return;
    }

    const {
      normalizedX,
      normalizedY,
    } =
      getNormalizedPointer(
        event,
      );

    element.style.setProperty(
      "--kinetic-x",
      `${normalizedX * 26}px`,
    );

    element.style.setProperty(
      "--kinetic-y",
      `${normalizedY * 18}px`,
    );

    element.style.setProperty(
      "--kinetic-x-reverse",
      `${normalizedX * -18}px`,
    );

    element.style.setProperty(
      "--kinetic-y-reverse",
      `${normalizedY * -12}px`,
    );

    element.style.setProperty(
      "--kinetic-skew",
      `${normalizedX * -5}deg`,
    );

    element.style.setProperty(
      "--kinetic-rotate",
      `${normalizedY * 1.8}deg`,
    );
  }

  function resetPointer() {
    const element =
      visualRef.current;

    if (
      !element
    ) {
      return;
    }

    element.style.removeProperty(
      "--kinetic-x",
    );

    element.style.removeProperty(
      "--kinetic-y",
    );

    element.style.removeProperty(
      "--kinetic-x-reverse",
    );

    element.style.removeProperty(
      "--kinetic-y-reverse",
    );

    element.style.removeProperty(
      "--kinetic-skew",
    );

    element.style.removeProperty(
      "--kinetic-rotate",
    );
  }

  return (
    <article
      className={`${styles.experiment} ${styles.kineticExperiment}`}
      data-motion-scroll="playground-experiment"
    >
      <ExperimentMeta
        number="01"
        copy={
          copy
        }
        theme="dark"
      />

      <div
        ref={
          visualRef
        }
        className={
          styles.kineticVisual
        }
        onPointerMove={
          handlePointerMove
        }
        onPointerLeave={
          resetPointer
        }
        aria-hidden="true"
      >
        <div
          className={
            styles.kineticTop
          }
        >
          <span>
            TYPE / MOTION
          </span>

          <span>
            001
          </span>
        </div>

        <div
          className={
            styles.kineticWords
          }
        >
          <span
            className={
              styles.kineticWordA
            }
          >
            MOVE
          </span>

          <span
            className={
              styles.kineticWordB
            }
          >
            WITH
          </span>

          <span
            className={
              styles.kineticWordC
            }
          >
            INTENT
          </span>
        </div>

        <div
          className={
            styles.kineticAxis
          }
        >
          <span />

          <span />
        </div>
      </div>
    </article>
  );
}

function MagneticExperiment({
  copy,
}: {
  copy:
    LabCopy["experiments"]["magnetic"];
}) {
  const visualRef =
    useRef<HTMLDivElement>(
      null,
    );

  function handlePointerMove(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    if (
      isReducedMotion()
    ) {
      return;
    }

    const element =
      visualRef.current;

    if (
      !element
    ) {
      return;
    }

    const {
      rect,
      localX,
      localY,
    } =
      getNormalizedPointer(
        event,
      );

    element.style.setProperty(
      "--field-x",
      `${localX}px`,
    );

    element.style.setProperty(
      "--field-y",
      `${localY}px`,
    );

    const dots =
      element.querySelectorAll<HTMLElement>(
        "[data-magnetic-dot]",
      );

    dots.forEach(
      (
        dot,
      ) => {
        const column =
          Number(
            dot.dataset.column ??
              0,
          );

        const row =
          Number(
            dot.dataset.row ??
              0,
          );

        const dotX =
          (
            column +
            0.5
          ) /
          MAGNETIC_COLUMNS *
          rect.width;

        const dotY =
          (
            row +
            0.5
          ) /
          MAGNETIC_ROWS *
          rect.height;

        const deltaX =
          dotX -
          localX;

        const deltaY =
          dotY -
          localY;

        const distance =
          Math.sqrt(
            deltaX *
              deltaX +
              deltaY *
                deltaY,
          );

        const radius =
          Math.min(
            190,
            rect.width *
              0.22,
          );

        const force =
          Math.max(
            0,
            1 -
              distance /
                radius,
          );

        if (
          force <= 0 ||
          distance ===
            0
        ) {
          dot.style.transform =
            "";

          return;
        }

        const amount =
          force *
          force *
          34;

        const offsetX =
          deltaX /
          distance *
          amount;

        const offsetY =
          deltaY /
          distance *
          amount;

        dot.style.transform =
          `translate3d(${offsetX}px, ${offsetY}px, 0) scale(${1 + force * 0.5})`;
      },
    );
  }

  function resetPointer() {
    const element =
      visualRef.current;

    if (
      !element
    ) {
      return;
    }

    element.style.removeProperty(
      "--field-x",
    );

    element.style.removeProperty(
      "--field-y",
    );

    element
      .querySelectorAll<HTMLElement>(
        "[data-magnetic-dot]",
      )
      .forEach(
        (
          dot,
        ) => {
          dot.style.transform =
            "";
        },
      );
  }

  return (
    <article
      className={`${styles.experiment} ${styles.magneticExperiment}`}
      data-motion-scroll="playground-experiment"
    >
      <ExperimentMeta
        number="02"
        copy={
          copy
        }
        theme="light"
      />

      <div
        ref={
          visualRef
        }
        className={
          styles.magneticVisual
        }
        onPointerMove={
          handlePointerMove
        }
        onPointerLeave={
          resetPointer
        }
        aria-hidden="true"
      >
        <div
          className={
            styles.magneticGrid
          }
        >
          {MAGNETIC_DOTS.map(
            (
              dot,
            ) => (
              <span
                key={
                  dot.id
                }
                data-magnetic-dot
                data-column={
                  dot.column
                }
                data-row={
                  dot.row
                }
              />
            ),
          )}
        </div>

        <span
          className={
            styles.fieldCursor
          }
        />

        <div
          className={
            styles.fieldCoordinates
          }
        >
          <span>
            FIELD / 02
          </span>

          <span>
            SYSTEM DISTURBANCE
          </span>
        </div>
      </div>
    </article>
  );
}

function SpatialExperiment({
  copy,
}: {
  copy:
    LabCopy["experiments"]["spatial"];
}) {
  const visualRef =
    useRef<HTMLDivElement>(
      null,
    );

  function handlePointerMove(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    if (
      isReducedMotion()
    ) {
      return;
    }

    const element =
      visualRef.current;

    if (
      !element
    ) {
      return;
    }

    const {
      normalizedX,
      normalizedY,
    } =
      getNormalizedPointer(
        event,
      );

    element.style.setProperty(
      "--space-a-x",
      `${normalizedX * 12}px`,
    );

    element.style.setProperty(
      "--space-a-y",
      `${normalizedY * 10}px`,
    );

    element.style.setProperty(
      "--space-b-x",
      `${normalizedX * -24}px`,
    );

    element.style.setProperty(
      "--space-b-y",
      `${normalizedY * -18}px`,
    );

    element.style.setProperty(
      "--space-c-x",
      `${normalizedX * 34}px`,
    );

    element.style.setProperty(
      "--space-c-y",
      `${normalizedY * 24}px`,
    );

    element.style.setProperty(
      "--space-line",
      `${normalizedX * 7}deg`,
    );
  }

  function resetPointer() {
    const element =
      visualRef.current;

    if (
      !element
    ) {
      return;
    }

    [
      "--space-a-x",
      "--space-a-y",
      "--space-b-x",
      "--space-b-y",
      "--space-c-x",
      "--space-c-y",
      "--space-line",
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
    <article
      className={`${styles.experiment} ${styles.spatialExperiment}`}
      data-motion-scroll="playground-experiment"
    >
      <ExperimentMeta
        number="03"
        copy={
          copy
        }
        theme="dark"
      />

      <div
        ref={
          visualRef
        }
        className={
          styles.spatialVisual
        }
        onPointerMove={
          handlePointerMove
        }
        onPointerLeave={
          resetPointer
        }
        aria-hidden="true"
      >
        <span
          className={
            styles.spatialIndex
          }
        >
          DEPTH / 03
        </span>

        <div
          className={
            styles.spatialCircle
          }
        />

        <div
          className={
            styles.spatialFrame
          }
        />

        <div
          className={
            styles.spatialBlock
          }
        />

        <div
          className={
            styles.spatialLine
          }
        />

        <span
          className={
            styles.spatialPlus
          }
        >
          +
        </span>
      </div>
    </article>
  );
}

function CursorExperiment({
  copy,
}: {
  copy:
    LabCopy["experiments"]["cursor"];
}) {
  const visualRef =
    useRef<HTMLDivElement>(
      null,
    );

  function handlePointerMove(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    if (
      isReducedMotion()
    ) {
      return;
    }

    const element =
      visualRef.current;

    if (
      !element
    ) {
      return;
    }

    element.style.setProperty(
      "--cursor-x",
      `${event.clientX -
      event.currentTarget.getBoundingClientRect()
        .left}px`,
    );

    element.style.setProperty(
      "--cursor-y",
      `${event.clientY -
      event.currentTarget.getBoundingClientRect()
        .top}px`,
    );

    const letters =
      element.querySelectorAll<HTMLElement>(
        "[data-cursor-letter]",
      );

    letters.forEach(
      (
        letter,
        index,
      ) => {
        const bounds =
          letter.getBoundingClientRect();

        const centerX =
          bounds.left +
          bounds.width /
            2;

        const centerY =
          bounds.top +
          bounds.height /
            2;

        const deltaX =
          centerX -
          event.clientX;

        const deltaY =
          centerY -
          event.clientY;

        const distance =
          Math.sqrt(
            deltaX *
              deltaX +
              deltaY *
                deltaY,
          );

        const radius =
          170;

        const force =
          Math.max(
            0,
            1 -
              distance /
                radius,
          );

        if (
          force <= 0 ||
          distance ===
            0
        ) {
          letter.style.transform =
            "";

          return;
        }

        const direction =
          index % 2 ===
            0
            ? 1
            : -1;

        const x =
          deltaX /
          distance *
          force *
          22;

        const y =
          deltaY /
          distance *
          force *
          16;

        const rotation =
          force *
          7 *
          direction;

        letter.style.transform =
          `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)`;
      },
    );
  }

  function resetPointer() {
    const element =
      visualRef.current;

    if (
      !element
    ) {
      return;
    }

    element.style.removeProperty(
      "--cursor-x",
    );

    element.style.removeProperty(
      "--cursor-y",
    );

    element
      .querySelectorAll<HTMLElement>(
        "[data-cursor-letter]",
      )
      .forEach(
        (
          letter,
        ) => {
          letter.style.transform =
            "";
        },
      );
  }

  return (
    <article
      className={`${styles.experiment} ${styles.cursorExperiment}`}
      data-motion-scroll="playground-experiment"
    >
      <ExperimentMeta
        number="04"
        copy={
          copy
        }
        theme="light"
      />

      <div
        ref={
          visualRef
        }
        className={
          styles.cursorVisual
        }
        onPointerMove={
          handlePointerMove
        }
        onPointerLeave={
          resetPointer
        }
        aria-hidden="true"
      >
        <div
          className={
            styles.cursorMeta
          }
        >
          <span>
            NATSX / TYPE
          </span>

          <span>
            BREAK SYSTEM / 04
          </span>
        </div>

        <CursorWord
          word="BREAK"
          className={
            styles.cursorWordA
          }
        />

        <CursorWord
          word="THE"
          className={
            styles.cursorWordB
          }
        />

        <CursorWord
          word="GRID"
          className={
            styles.cursorWordC
          }
        />

        <span
          className={
            styles.cursorFollower
          }
        />

        <div
          className={
            styles.cursorRule
          }
        />
      </div>
    </article>
  );
}

function CursorWord({
  word,
  className,
}: {
  word: string;
  className: string;
}) {
  return (
    <div
      className={`${styles.cursorWord} ${className}`}
    >
      {word
        .split("")
        .map(
          (
            letter,
            index,
          ) => (
            <span
              key={`${letter}-${index}`}
              data-cursor-letter
            >
              {
                letter
              }
            </span>
          ),
        )}
    </div>
  );
}

function ExperimentMeta({
  number,
  copy,
  theme,
}: {
  number: string;

  copy: {
    title: string;
    category: string;
    description: string;
    instruction: string;
  };

  theme:
    | "light"
    | "dark";
}) {
  return (
    <div
      className={`${styles.experimentMeta} ${
        theme ===
        "dark"
          ? styles.metaDark
          : styles.metaLight
      }`}
    >
      <div
        className={
          styles.experimentIdentity
        }
      >
        <span
          className={
            styles.experimentNumber
          }
        >
          {
            number
          }
        </span>

        <div>
          <h2>
            {
              copy.title
            }
          </h2>

          <span
            className={
              styles.experimentCategory
            }
          >
            {
              copy.category
            }
          </span>
        </div>
      </div>

      <div
        className={
          styles.experimentDescription
        }
      >
        <p>
          {
            copy.description
          }
        </p>

        <span
          className={
            styles.experimentInstruction
          }
        >
          <i />

          {
            copy.instruction
          }
        </span>
      </div>
    </div>
  );
}