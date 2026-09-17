"use client";

import {
  useEffect,
  useRef,
} from "react";

import Image from "next/image";

import {
  site,
} from "@/data/site";

import baseStyles from "./About.module.css";
import styles from "./AboutIdentityPortrait.module.css";

type AboutIdentityPortraitProps = {
  nameLabel: string;

  identityLabel: string;

  basedInLabel: string;
};

function clamp(
  value: number,
  minimum: number,
  maximum: number,
) {
  return Math.min(
    Math.max(
      value,
      minimum,
    ),
    maximum,
  );
}

export default function AboutIdentityPortrait({
  nameLabel,
  identityLabel,
  basedInLabel,
}: AboutIdentityPortraitProps) {
  const rootRef =
    useRef<HTMLDivElement>(
      null,
    );

  const frameRef =
    useRef<number | null>(
      null,
    );

  useEffect(() => {
    const root =
      rootRef.current;

    if (!root) {
      return;
    }

    const column =
      root.closest<HTMLElement>(
        '[data-motion-scroll="about-portrait"]',
      );

    if (!column) {
      return;
    }

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );

    const update =
      () => {
        const viewportHeight =
          window.innerHeight;

        const columnRect =
          column.getBoundingClientRect();

        const travel =
          Math.max(
            columnRect.height -
              viewportHeight *
                0.42,
            1,
          );

        const progress =
          clamp(
            (
              viewportHeight *
                0.34 -
              columnRect.top
            ) /
              travel,
            0,
            1,
          );

        const motionProgress =
          reducedMotion.matches
            ? 0
            : progress;

        root.style.setProperty(
          "--portrait-x",
          `${
            (
              motionProgress -
              0.5
            ) *
            7
          }px`,
        );

        root.style.setProperty(
          "--portrait-y",
          `${
            motionProgress *
            -7
          }px`,
        );

        root.style.setProperty(
          "--portrait-scale",
          `${
            1 +
            motionProgress *
              0.018
          }`,
        );

        root.style.setProperty(
          "--circle-x",
          `${
            motionProgress *
            20
          }px`,
        );

        root.style.setProperty(
          "--circle-y",
          `${
            motionProgress *
            -14
          }px`,
        );

        root.style.setProperty(
          "--horizontal-x",
          `${
            (
              motionProgress -
              0.5
            ) *
            9
          }px`,
        );

        root.style.setProperty(
          "--vertical-x",
          `${
            (
              motionProgress -
              0.5
            ) *
            -6
          }px`,
        );

        frameRef.current =
          null;
      };

    const requestUpdate =
      () => {
        if (
          frameRef.current !==
          null
        ) {
          return;
        }

        frameRef.current =
          window.requestAnimationFrame(
            update,
          );
      };

    window.addEventListener(
      "scroll",
      requestUpdate,
      {
        passive:
          true,
      },
    );

    window.addEventListener(
      "resize",
      requestUpdate,
    );

    reducedMotion.addEventListener(
      "change",
      requestUpdate,
    );

    const resizeObserver =
      "ResizeObserver" in
      window
        ? new ResizeObserver(
            requestUpdate,
          )
        : null;

    resizeObserver?.observe(
      column,
    );

    requestUpdate();

    return () => {
      window.removeEventListener(
        "scroll",
        requestUpdate,
      );

      window.removeEventListener(
        "resize",
        requestUpdate,
      );

      reducedMotion.removeEventListener(
        "change",
        requestUpdate,
      );

      resizeObserver?.disconnect();

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

  return (
    <div
      ref={
        rootRef
      }
      className={
        styles.root
      }
      data-about-identity
    >
      <div
        className={
          styles.sticky
        }
        data-about-identity-sticky
      >
        <div
          className={`${baseStyles.portraitFrame} ${styles.frame}`}
        >
          <div
            className={`${baseStyles.portraitCircle} ${styles.circle}`}
            aria-hidden="true"
          />

          <div
            className={`${baseStyles.portraitLineHorizontal} ${styles.horizontalAxis}`}
            aria-hidden="true"
          />

          <div
            className={`${baseStyles.portraitLineVertical} ${styles.verticalAxis}`}
            aria-hidden="true"
          />

          <Image
            src="/images/natsx-abt.webp"
            alt={
              site.person
            }
            fill
            sizes="(max-width: 700px) 100vw, 45vw"
            className={`${baseStyles.portrait} ${styles.portrait}`}
          />

          <span
            className={`${baseStyles.signaturePlus} ${styles.plus}`}
            aria-hidden="true"
          >
            +
          </span>
        </div>

        <div
          className={`${baseStyles.profileMeta} ${styles.profileMeta}`}
        >
          <div>
            <span
              className={
                baseStyles.metaLabel
              }
            >
              {
                nameLabel
              }
            </span>

            <span>
              {
                site.person
              }
            </span>
          </div>

          <div>
            <span
              className={
                baseStyles.metaLabel
              }
            >
              {
                identityLabel
              }
            </span>

            <span>
              {
                site.name
              }
            </span>
          </div>

          <div>
            <span
              className={
                baseStyles.metaLabel
              }
            >
              {
                basedInLabel
              }
            </span>

            <span>
              {
                site.location
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}