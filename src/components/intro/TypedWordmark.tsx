import Image from "next/image";

import styles from "./TypedWordmark.module.css";

const letters = [
  {
    key: "n",
    src: "/images/branding/natsx-wordmark-n.png",
    className: styles.letterN,
  },
  {
    key: "a",
    src: "/images/branding/natsx-wordmark-a.png",
    className: styles.letterA,
  },
  {
    key: "t",
    src: "/images/branding/natsx-wordmark-t.png",
    className: styles.letterT,
  },
  {
    key: "s",
    src: "/images/branding/natsx-wordmark-s.png",
    className: styles.letterS,
  },
  {
    key: "x",
    src: "/images/branding/natsx-wordmark-x.png",
    className: styles.letterX,
  },
];

export default function TypedWordmark() {
  return (
    <div className={styles.wordmark}>
      {letters.map(
        ({
          key,
          src,
          className,
        }) => (
          <Image
            key={key}
            src={src}
            alt=""
            fill
            priority
            unoptimized
            sizes="486px"
            className={`${styles.letter} ${className}`}
          />
        ),
      )}
    </div>
  );
}