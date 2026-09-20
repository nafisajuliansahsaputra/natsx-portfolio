import Image from "next/image";

import FiveAmVisionMotionRoot from "./FiveAmVisionMotionRoot";

import styles from "./FiveAmVisionArtwork.module.css";


type VisionArtworkCopy = {
  disciplineLabel: string;

  identity: string;

  artDirection: string;

  digitalDesign: string;

  philosophyLine1: string;

  philosophyLine2: string;

  philosophyLine3: string;

  tagline: string;
};


type FiveAmVisionArtworkProps = {
  copy:
    VisionArtworkCopy;

  mode?:
    | "home"
    | "archive";
};


export default function FiveAmVisionArtwork({
  copy,
  mode = "home",
}: FiveAmVisionArtworkProps) {
  const archive =
    mode ===
    "archive";


  return (
    <FiveAmVisionMotionRoot
      className={
        styles.artwork
      }
      mode={
        mode
      }
    >
      <div
        className={
          styles.ambient
        }
        data-vision-part="ambient"
      />

      <div
        className={
          styles.frame
        }
        data-vision-part="frame"
      />

      <div
        className={
          styles.orbit
        }
        data-vision-part="orbit"
      />

      <div
        className={
          styles.type
        }
        data-vision-part="type"
      >
        <span>
          5AM
        </span>

        <span>
          Vision
        </span>
      </div>

      <div
        className={
          styles.topMeta
        }
        data-vision-part="top-meta"
      >
        <span
          className={
            styles.topLogo
          }
          data-vision-part="top-logo"
        >
          <Image
            src="/images/projects/5am-vision/5am-logo.png"
            alt=""
            fill
            loading="lazy"
            sizes={
              archive
                ? "24px"
                : "(max-width: 700px) 28px, (max-width: 960px) 34px, 42px"
            }
            className={
              styles.topLogoImage
            }
            data-vision-part="top-logo-image"
          />
        </span>

        <span
          className={
            styles.topRule
          }
          data-vision-part="top-rule"
        />

        <span
          className={
            styles.topIndex
          }
          data-vision-part="top-index"
        >
          02
        </span>
      </div>

      <div
        className={
          styles.leftMeta
        }
        data-vision-part="left-meta"
      >
        <span
          className={
            styles.metaLabel
          }
          data-vision-part="meta-label"
        >
          {
            copy.disciplineLabel
          }
        </span>

        <span>
          {
            copy.identity
          }
        </span>

        <span>
          {
            copy.artDirection
          }
        </span>

        <span>
          {
            copy.digitalDesign
          }
        </span>
      </div>

      <div
        className={
          styles.rightStatement
        }
        data-vision-part="right-statement"
      >
        <span>
          {
            copy.philosophyLine1
          }
        </span>

        <span>
          {
            copy.philosophyLine2
          }
        </span>

        <span>
          {
            copy.philosophyLine3
          }
        </span>

        <i
          className={
            styles.rightRule
          }
          data-vision-part="right-rule"
        />
      </div>

      <span
        className={
          styles.tagline
        }
        data-vision-part="tagline"
      >
        {
          copy.tagline
        }
      </span>

      <div
        className={
          styles.character
        }
        data-vision-part="character"
      >
        <Image
          src="/images/projects/5am-vision/aven-cutout.png"
          alt=""
          fill
          loading="lazy"
          sizes={
            archive
              ? "360px"
              : "(max-width: 700px) 74vw, (max-width: 960px) 56vw, 42vw"
          }
          className={
            styles.characterImage
          }
          data-vision-part="character-image"
        />
      </div>
    </FiveAmVisionMotionRoot>
  );
}