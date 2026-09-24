import type {
  CSSProperties,
} from "react";

import Image from "next/image";

import type {
  PublicProject,
} from "@/lib/public-projects";

import styles from "./WorkArchiveHomepagePreview.module.css";


type HomepageArchiveVariant =
  | "spall"
  | "vision"
  | "bast"
  | "attendance";


type WorkArchivePreviewCopy = {
  selectedProject:
    string;

  visionArtwork: {
    disciplineLabel:
      string;

    identity:
      string;

    artDirection:
      string;

    digitalDesign:
      string;

    philosophyLine1:
      string;

    philosophyLine2:
      string;

    philosophyLine3:
      string;

    tagline:
      string;
  };
};


type WorkArchiveHomepagePreviewProps = {
  project:
    PublicProject;

  primaryVisual:
    | string
    | null;

  secondaryVisual:
    | string
    | null;

  fallbackImage:
    | string
    | null;

  copy:
    WorkArchivePreviewCopy;
};


const STATIC_THUMBNAILS:
  Record<
    HomepageArchiveVariant,
    string
  > = {
    spall:
      "/images/work-thumbnails/spall.webp",

    vision:
      "/images/work-thumbnails/vision.webp",

    bast:
      "/images/work-thumbnails/bast.webp",

    attendance:
      "/images/work-thumbnails/attendance.webp",
  };


function getHomepageArchiveVariant(
  slug:
    string,
):
  | HomepageArchiveVariant
  | null {
  switch (
    slug
  ) {
    case "spall-spill":
      return "spall";

    case "5am-vision":
      return "vision";

    case "bast-management-system":
      return "bast";

    case "nusantara-stay":
    case "attendance-system":
    case "smart-attendance-system":
      return "attendance";

    default:
      return null;
  }
}


export function hasHomepageArchiveArtwork(
  slug:
    string,
) {
  return (
    getHomepageArchiveVariant(
      slug,
    ) !==
    null
  );
}


export default function WorkArchiveHomepagePreview({
  project,
  fallbackImage,
}: WorkArchiveHomepagePreviewProps) {
  const variant =
    getHomepageArchiveVariant(
      project.slug,
    );

  const rootStyle = {
    "--accent":
      project.accentColor,

    "--project-secondary":
      project.secondaryColor ??
      "#deddd7",
  } as CSSProperties;


  if (
    !variant
  ) {
    if (
      !fallbackImage
    ) {
      return null;
    }

    return (
      <div
        className={
          styles.root
        }
        data-archive-home-preview="fallback"
        style={
          rootStyle
        }
      >
        <Image
          src={
            fallbackImage
          }
          alt=""
          fill
          loading="lazy"
          sizes="(max-width: 700px) 1px, (max-width: 1200px) 420px, 480px"
          className={
            styles.fallbackImage
          }
        />
      </div>
    );
  }


  return (
    <div
      className={
        styles.root
      }
      data-archive-home-preview={
        variant
      }
      style={
        rootStyle
      }
    >
      <Image
        src={
          STATIC_THUMBNAILS[
            variant
          ]
        }
        alt=""
        fill
        unoptimized
        loading="eager"
        sizes="1400px"
        className={
          styles.staticSnapshot
        }
      />

      {variant ===
      "spall" ? (
        <svg
          className={
            styles.spallSoonOverlay
          }
          viewBox="0 0 1666 374"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M 390 38 L 382 43 L 379 51 L 377 67 L 373 84 L 372 95 L 368 112 L 367 123 L 363 140 L 362 151 L 360 157 L 359 168 L 355 185 L 354 196 L 350 213 L 349 224 L 347 230 L 346 241 L 344 247 L 344 252 L 342 258 L 342 263 L 341 264 L 341 269 L 339 275 L 335 301 L 340 310 L 342 307 L 347 307 L 351 310 L 353 315 L 448 339 L 454 337 L 458 333 L 460 328 L 487 193 L 489 188 L 493 164 L 495 159 L 504 111 L 506 106 L 512 76 L 512 70 L 510 65 L 505 60 L 501 58 L 491 57 L 470 52 L 465 52 L 439 46 L 434 46 L 398 38 Z"
            fill="#234c37"
          />

          <rect
            x="421"
            y="47"
            width="49"
            height="15"
            rx="7.5"
            fill="#050608"
            transform="rotate(10.3 445.5 54.5)"
          />

          <text
            x="420"
            y="197"
            fill="#f3f0e8"
            fontFamily="Arial, Helvetica, sans-serif"
            fontSize="30"
            fontWeight="700"
            textAnchor="middle"
            dominantBaseline="middle"
            transform="rotate(10.3 420 197)"
          >
            soon
          </text>
        </svg>
      ) : null}


    </div>
  );
}
