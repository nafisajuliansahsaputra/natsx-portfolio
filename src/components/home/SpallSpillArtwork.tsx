"use client";

import dynamic from "next/dynamic";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  PublicProject,
} from "@/lib/public-projects";

import styles from "./SpallSpillArtwork.module.css";


const SpallEditorialScene =
  dynamic(
    () =>
      import(
        "./SpallEditorialScene"
      ),
    {
      ssr:
        false,
    },
  );


const SCENE_PRELOAD_MARGIN =
  "500px 0px";


type Props = {
  project:
    PublicProject;

  primaryVisual:
    | string
    | null;

  secondaryVisual:
    | string
    | null;

  visualLabel:
    string;
};


export default function SpallSpillArtwork({
  project,
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


  useEffect(
    () => {
      const artwork =
        artworkRef.current;

      if (
        !artwork
      ) {
        return;
      }


      /*
       * =====================================================
       * LAZY 3D SCENE GATE
       * =====================================================
       *
       * SpallEditorialScene membawa Three.js
       * dan model GLB iPhone yang cukup berat.
       *
       * Scene tidak perlu dimount ketika
       * artwork Spall masih jauh dari viewport.
       *
       * Kita mulai memuat scene sedikit sebelum
       * user sampai ke section agar model punya
       * waktu untuk siap tanpa membebani initial
       * homepage load.
       *
       * Setelah scene pernah dimuat, scene tetap
       * mounted supaya model tidak perlu dibuat
       * ulang ketika user scroll naik / turun.
       */


      if (
        typeof IntersectionObserver ===
        "undefined"
      ) {
        /*
         * Fallback untuk environment/browser
         * yang tidak menyediakan
         * IntersectionObserver.
         *
         * State update dijalankan melalui
         * requestAnimationFrame agar tidak
         * dilakukan secara sinkron di body
         * useEffect.
         */
        const fallbackFrame =
          window.requestAnimationFrame(
            () => {
              setShouldLoadScene(
                true,
              );
            },
          );


        return () => {
          window.cancelAnimationFrame(
            fallbackFrame,
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
             * Gate hanya dibutuhkan sekali.
             *
             * Setelah scene dimount,
             * lifecycle visibility dan render
             * tetap ditangani langsung oleh
             * SpallEditorialScene.
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


  return (
    <div
      ref={
        artworkRef
      }
      className={
        styles.artwork
      }
      data-spall-featured="true"
    >
      <div
        className={
          styles.light
        }
        aria-hidden="true"
      />


      <div
        className={
          styles.copy
        }
        aria-hidden="true"
      >
        <p
          className={
            styles.headline
          }
        >
          <span>
            YOUR
          </span>

          <span>
            SPACE.
          </span>
        </p>


        <p
          className={
            styles.subline
          }
        >
          your spill.
        </p>


        <p
          className={
            styles.description
          }
        >
          ONE IDENTITY.
          <br />

          MANY THINGS
          <br />

          TO DISCOVER.
        </p>


        <span
          className={
            styles.rule
          }
        />


        <span
          className={
            styles.wordmark
          }
        >
          spall spill.
        </span>
      </div>


      <div
        className={
          styles.scene
        }
      >
        {
          shouldLoadScene
            ? (
              <SpallEditorialScene
                screenUrl={
                  secondaryVisual
                }
                label={`${project.title} — ${visualLabel}`}
              />
            )
            : null
        }
      </div>


      <span
        className={
          styles.topNote
        }
        aria-hidden="true"
      >
        A MORE
        <br />

        CONNECTED
        <br />

        YOU
      </span>


      <div
        className={
          styles.footer
        }
        aria-hidden="true"
      >
        <span>
          IDENTITY / SPILL / PRODUCT / RESOURCE
        </span>

        <span>
          {
            project.number
          }
          {" — "}
          {
            project.year
          }
        </span>
      </div>
    </div>
  );
}