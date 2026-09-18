"use client";

import dynamic from "next/dynamic";
import Image from "next/image";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  PublicProject,
} from "@/lib/public-projects";

import styles from "./BastManagementArtwork.module.css";

const BastEditorialScene =
  dynamic(
    () =>
      import(
        "./BastEditorialScene"
      ),
    {
      ssr: false,
    },
  );

const SCENE_PRELOAD_MARGIN =
  "500px 0px";

type Props = {
  project:
    PublicProject;

  primaryVisual:
    string | null;

  secondaryVisual:
    string | null;

  visualLabel:
    string;
};

export default function BastManagementArtwork({
  project,
  primaryVisual,
  secondaryVisual,
  visualLabel,
}: Props) {
  const artworkRef =
    useRef<HTMLDivElement>(
      null,
    );

  const [
    shouldLoadScene,
    setShouldLoadScene,
  ] =
    useState(false);

  useEffect(
    () => {
      const artwork =
        artworkRef.current;

      if (!artwork) {
        return;
      }

      if (
        typeof IntersectionObserver ===
        "undefined"
      ) {
        const frame =
          window.requestAnimationFrame(
            () =>
              setShouldLoadScene(
                true,
              ),
          );

        return () =>
          window.cancelAnimationFrame(
            frame,
          );
      }

      const observer =
        new IntersectionObserver(
          (entries) => {
            if (
              !entries[0]
                ?.isIntersecting
            ) {
              return;
            }

            setShouldLoadScene(
              true,
            );

            observer.disconnect();
          },
          {
            rootMargin:
              SCENE_PRELOAD_MARGIN,

            threshold:
              0.01,
          },
        );

      observer.observe(
        artwork,
      );

      return () =>
        observer.disconnect();
    },
    [],
  );

  return (
    <div
      ref={artworkRef}
      className={
        styles.artwork
      }
      data-bast-featured="true"
    >
      <div
        className={
          styles.light
        }
        aria-hidden="true"
      />

      <div
        className={
          styles.grid
        }
        aria-hidden="true"
      />

      <div
        className={
          styles.orbit
        }
        aria-hidden="true"
      />

      <div
        className={
          styles.orbitBubble
        }
        aria-hidden="true"
      />

      {/* LEFT COPY */}

      <div
        className={
          styles.copy
        }
        aria-hidden="true"
      >
        <h4
          className={
            styles.headline
          }
        >
          BAST
        </h4>

        <span
          className={
            styles.titleRule
          }
        />

        <p
          className={
            styles.systemName
          }
        >
          BERITA ACARA
          <br />

          SERAH TERIMA
          <br />

          MANAGEMENT SYSTEM
        </p>

        <span
          className={
            styles.copyRule
          }
        />

        <p
          className={
            styles.description
          }
        >
          FROM PROCESS
          <br />

          TO PROOF.
          <br />

          ALL IN ONE SYSTEM.
        </p>
      </div>

      {/* FLOATING DOCUMENT ICON */}

      <div
        className={
          styles.documentIconCard
        }
        aria-hidden="true"
      >
        <span
          className={
            styles.documentIcon
          }
        >
          <i />
          <i />
          <i />
        </span>
      </div>

      {/* THREE.JS */}

      <div
        className={
          styles.scene
        }
      >
        {
          shouldLoadScene
            ? (
              <BastEditorialScene
                screenUrl={
                  primaryVisual
                }
                documentUrl={
                  secondaryVisual
                }
                label={`${project.title} — ${visualLabel}`}
              />
            )
            : null
        }
      </div>

      {/* FOREGROUND DOCUMENT */}

      {
        secondaryVisual
          ? (
            <div
              className={
                styles.documentStage
              }
              aria-hidden="true"
            >
              <div
                className={
                  styles.documentShadow
                }
              />

              <div
                className={
                  styles.documentSheet
                }
              >
                <Image
                  src={
                    secondaryVisual
                  }
                  alt=""
                  fill
                  sizes="24vw"
                  className={
                    styles.documentImage
                  }
                  unoptimized
                />
              </div>
            </div>
          )
          : null
      }

      {/* TOP RIGHT NOTE */}

      <div
        className={
          styles.topNote
        }
        aria-hidden="true"
      >
        <span>
          DOKUMEN
        </span>

        <span>
          LEBIH TERATUR
        </span>

        <span>
          KINERJA LEBIH MAJU
        </span>

        <i />
      </div>

      {/* SUCCESS */}

      <div
        className={
          styles.successCard
        }
        aria-hidden="true"
      >
        <span
          className={
            styles.successIcon
          }
        >
          ✓
        </span>

        <div>
          <strong>
            Dokumen Berhasil Dicetak
          </strong>

          <small>
            BAST-2026-014
          </small>
        </div>
      </div>

      {/* TOTAL */}

      <div
        className={
          styles.totalCard
        }
        aria-hidden="true"
      >
        <div
          className={
            styles.totalDocumentIcon
          }
        >
          <i />
          <i />
        </div>

        <div
          className={
            styles.totalCopy
          }
        >
          <strong>
            128
          </strong>

          <small>
            Total BAST
          </small>
        </div>

        <div
          className={
            styles.miniChart
          }
        >
          <span />
          <span />
          <span />
        </div>
      </div>

      {/* WORKFLOW */}

      <div
        className={
          styles.workflow
        }
        aria-hidden="true"
      >
        <div
          className={
            styles.workflowTrack
          }
        />

        <WorkflowItem
          symbol="+"
          text="Buat & Ajukan"
        />

        <WorkflowItem
          symbol="✓"
          text="Verifikasi"
        />

        <WorkflowItem
          symbol="✓"
          text="Selesai"
          active
        />
      </div>

      {/* FOOTER */}

      <div
        className={
          styles.bottomLeft
        }
        aria-hidden="true"
      >
        <span>
          DIGITAL WORKFLOW
        </span>

        <span>
          REAL IMPACT
        </span>

        <i />
      </div>

      <div
        className={
          styles.bottomRight
        }
        aria-hidden="true"
      >
        <span>
          PEMERINTAH
        </span>

        <span>
          LEBIH EFISIEN
        </span>

        <span>
          MASA DEPAN LEBIH BAIK
        </span>

        <i />
      </div>
    </div>
  );
}

function WorkflowItem({
  symbol,
  text,
  active = false,
}: {
  symbol:
    string;

  text:
    string;

  active?:
    boolean;
}) {
  return (
    <div
      className={`${styles.workflowItem} ${
        active
          ? styles.workflowActive
          : ""
      }`}
    >
      <span>
        {symbol}
      </span>

      <strong>
        {text}
      </strong>
    </div>
  );
}