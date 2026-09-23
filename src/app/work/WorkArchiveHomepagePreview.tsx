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
    </div>
  );
}
