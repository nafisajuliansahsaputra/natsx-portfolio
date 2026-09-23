import type {
  CSSProperties,
} from "react";

import Image from "next/image";

import AttendanceSystemArtwork from "@/components/home/AttendanceSystemArtwork";
import BastManagementArtwork from "@/components/home/BastManagementArtwork";
import FiveAmVisionArtwork from "@/components/home/FiveAmVisionArtwork";
import SpallSpillArtwork from "@/components/home/SpallSpillArtwork";

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
  primaryVisual,
  secondaryVisual,
  fallbackImage,
  copy,
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


  /*
   * Projects without a coded Selected Work visual keep the
   * original image preview. The /work frame itself is owned
   * by the existing archive layout and is intentionally not
   * changed here.
   */
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


  const visualLabel =
    project.disciplines
      .slice(
        0,
        2,
      )
      .join(
        " / ",
      ) ||
    copy.selectedProject;


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
      <div
        className={
          styles.selectedArtwork
        }
        data-archive-selected-artwork={
          variant
        }
      >
        {variant ===
        "spall" ? (
          <SpallSpillArtwork
            project={
              project
            }
            secondaryVisual={
              secondaryVisual
            }
            visualLabel={
              visualLabel
            }
          />
        ) : null}

        {variant ===
        "vision" ? (
          <FiveAmVisionArtwork
            copy={
              copy.visionArtwork
            }
            mode="archive"
          />
        ) : null}

        {variant ===
        "bast" ? (
          <BastManagementArtwork
            project={
              project
            }
            primaryVisual={
              primaryVisual
            }
            secondaryVisual={
              secondaryVisual
            }
            visualLabel={
              visualLabel
            }
          />
        ) : null}

        {variant ===
        "attendance" ? (
          <AttendanceSystemArtwork
            project={
              project
            }
            primaryVisual={
              primaryVisual
            }
            secondaryVisual={
              secondaryVisual
            }
          />
        ) : null}
      </div>
    </div>
  );
}
