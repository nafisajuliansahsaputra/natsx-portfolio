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

import {
  getWebglTextureUrl,
} from "@/lib/webgl-texture-url";

import styles from "./BastManagementArtwork.module.css";

const BastEditorialScene =
  dynamic(
    () =>
      import(
        "./BastEditorialScene"
      ),
    {
      ssr:
        false,
    },
  );

const SCENE_PRELOAD_MARGIN =
  "800px 0px";

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
    useState(
      false,
    );

  /* =========================================================
     LAZY THREE.JS SCENE
  ========================================================= */

  useEffect(
    () => {
      const currentArtwork =
        artworkRef.current;

      if (
        !currentArtwork
      ) {
        return;
      }

      const artwork:
        HTMLDivElement =
          currentArtwork;

      if (
        typeof IntersectionObserver ===
        "undefined"
      ) {
        const frame =
          window.requestAnimationFrame(
            () => {
              setShouldLoadScene(
                true,
              );
            },
          );

        return () => {
          window.cancelAnimationFrame(
            frame,
          );
        };
      }

      const observer =
        new IntersectionObserver(
          (
            entries,
          ) => {
            const entry =
              entries[0];

            if (
              !entry ||
              !entry.isIntersecting
            ) {
              return;
            }

            setShouldLoadScene(
              true,
            );

            /*
             * Hanya perlu trigger sekali.
             *
             * Setelah Three.js scene mounted,
             * lifecycle visibility ditangani
             * langsung BastEditorialScene.
             */
            observer.disconnect();
          },
          {
            root:
              null,

            rootMargin:
              SCENE_PRELOAD_MARGIN,

            threshold:
              0.01,
          },
        );

      observer.observe(
        artwork,
      );

      return () => {
        observer.disconnect();
      };
    },
    [],
  );

  useEffect(
    () => {
      const artwork =
        artworkRef.current;

      if (!artwork) {
        return;
      }

      let inView =
        typeof IntersectionObserver ===
        "undefined";

      const syncActivity =
        () => {
          artwork.dataset.bastActive =
            inView &&
            !document.hidden
              ? "true"
              : "false";
        };

      const observer =
        typeof IntersectionObserver !==
        "undefined"
          ? new IntersectionObserver(
              (
                [
                  entry,
                ],
              ) => {
                inView =
                  Boolean(
                    entry
                      ?.isIntersecting,
                  );

                syncActivity();
              },
              {
                rootMargin:
                  "15% 0px 15% 0px",

                threshold:
                  0,
              },
            )
          : null;

      observer?.observe(
        artwork,
      );

      syncActivity();

      document.addEventListener(
        "visibilitychange",
        syncActivity,
      );

      return () => {
        observer
          ?.disconnect();

        document.removeEventListener(
          "visibilitychange",
          syncActivity,
        );

        delete artwork.dataset
          .bastActive;
      };
    },
    [],
  );

  const optimizedScreenUrl =
    getWebglTextureUrl(
      primaryVisual,
      1920,
    );

  return (
    <div
      ref={artworkRef}
      className={styles.artwork}
      data-bast-featured="true"
      data-bast-active="false"
    >
      <div className={styles.orbit} aria-hidden="true" />
      <div className={styles.orbitBubble} aria-hidden="true" />

      <div className={styles.copy} aria-hidden="true">
        <h4 className={styles.headline}>BAST</h4>
        <p className={styles.systemName}>
          BERITA ACARA<br />
          SERAH TERIMA<br />
          MANAGEMENT SYSTEM
        </p>
        <span className={styles.copyRule} />
        <p className={styles.description}>
          From process to proof.<br />
          All in one system.
        </p>
      </div>

      <div className={styles.scene}>
        {shouldLoadScene ? (
          <BastEditorialScene
            screenUrl={optimizedScreenUrl}
            label={project.title + " — " + visualLabel}
          />
        ) : null}
      </div>

      {secondaryVisual ? (
        <div className={styles.documentStage} aria-hidden="true">
          <div className={styles.documentShadow} />
          <div className={styles.documentSheet}>
            <Image
              src={secondaryVisual}
              alt=""
              fill
              sizes="(max-width: 700px) 30vw, 24vw"
              className={styles.documentImage}
            />
          </div>
        </div>
      ) : null}

      <div className={styles.topNote} aria-hidden="true">
        <i />
        <p>DOKUMEN LEBIH TERATUR,<br />KERJA LEBIH MAJU.</p>
      </div>
    </div>
  );
}
