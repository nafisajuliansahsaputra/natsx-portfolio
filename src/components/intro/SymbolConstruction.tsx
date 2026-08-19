import Image from "next/image";

import styles from "./SymbolConstruction.module.css";

const FULL_LOGO_SOURCE =
  "/images/branding/natsx-logo-black.png";

const DIAGONAL_SOURCE =
  "/images/branding/natsx-symbol-diagonal.png";

const QUOTE_TOP_SOURCE =
  "/images/branding/natsx-symbol-quote-top.png";

const QUOTE_BOTTOM_SOURCE =
  "/images/branding/natsx-symbol-quote-bottom.png";

export default function SymbolConstruction() {
  return (
    <div className={styles.root}>
      {/* =========================
          APPROVED MAIN MORPH
      ========================= */}

      <div className={styles.primitive} />

      {/* =========================
          APPROVED DIAGONAL HANDOFF
      ========================= */}

      <div className={styles.diagonalHandoff}>
        <Image
          src={FULL_LOGO_SOURCE}
          alt=""
          fill
          priority
          unoptimized
          sizes="760px"
          className={styles.image}
        />
      </div>

      {/* =========================
          QUOTE BUILDERS
      ========================= */}

      <div className={styles.quoteConstruction}>
        <div
          className={`${styles.quoteBuilder} ${styles.quoteTopBuilder}`}
        >
          <span className={styles.quoteBody} />
          <span className={styles.quoteTail} />
        </div>

        <div
          className={`${styles.quoteBuilder} ${styles.quoteBottomBuilder}`}
        >
          <span className={styles.quoteBody} />
          <span className={styles.quoteTail} />
        </div>
      </div>

      {/* =========================
          EXACT FINAL SYMBOL
      ========================= */}

      <div className={styles.symbolMover}>
        <div className={styles.symbolAsset}>
          <Image
            src={DIAGONAL_SOURCE}
            alt=""
            fill
            priority
            unoptimized
            sizes="132px"
            className={`${styles.image} ${styles.exactLayer} ${styles.exactDiagonal}`}
          />

          <Image
            src={QUOTE_TOP_SOURCE}
            alt=""
            fill
            priority
            unoptimized
            sizes="132px"
            className={`${styles.image} ${styles.exactLayer} ${styles.exactQuoteTop}`}
          />

          <Image
            src={QUOTE_BOTTOM_SOURCE}
            alt=""
            fill
            priority
            unoptimized
            sizes="132px"
            className={`${styles.image} ${styles.exactLayer} ${styles.exactQuoteBottom}`}
          />
        </div>
      </div>
    </div>
  );
}