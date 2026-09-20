"use client";

import styles from "./InnerFooter.module.css";

type InnerFooterBackToTopProps = {
  label:
    string;
};

export default function InnerFooterBackToTop({
  label,
}: InnerFooterBackToTopProps) {
  return (
    <button
      type="button"
      className={
        styles.backToTop
      }
      onClick={() => {
        window.scrollTo({
          top:
            0,

          behavior:
            "smooth",
        });
      }}
    >
      {
        label
      }

      <span
        aria-hidden="true"
      >
        ↑
      </span>
    </button>
  );
}
