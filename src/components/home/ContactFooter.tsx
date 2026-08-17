import Image from "next/image";
import styles from "./ContactFooter.module.css";

const socials = [
  {
    label: "Email",
    href: "mailto:your-email@example.com",
  },
  {
    label: "LinkedIn",
    href: "#",
  },
  {
    label: "Instagram",
    href: "#",
  },
];

export default function ContactFooter() {
  return (
    <section className={styles.section} id="contact">
      <div className="site-container">
        <div className={styles.top}>
          <div className={styles.label}>
            <span className={styles.dot} />
            <span>06 / Contact</span>
          </div>

          <span className={styles.availability}>
            Open to selected opportunities
          </span>
        </div>

        <div className={styles.main}>
          <p className={styles.eyebrow}>Have an idea?</p>

          <a
            href="mailto:your-email@example.com"
            className={styles.mainLink}
          >
            <h2 className={styles.heading}>
              Let&apos;s make
              <br />
              something worth
              <br />
              experiencing<span>.</span>
            </h2>

            <span className={styles.mainArrow}>↗</span>
          </a>
        </div>

        <div className={styles.contactRow}>
          <p className={styles.contactIntro}>
            For collaborations, freelance work, creative projects,
            or just a good conversation.
          </p>

          <div className={styles.socials}>
            {socials.map((social) => (
              <a
                href={social.href}
                key={social.label}
                target={social.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  social.href.startsWith("http")
                    ? "noreferrer"
                    : undefined
                }
              >
                <span>{social.label}</span>
                <span className={styles.socialArrow}>↗</span>
              </a>
            ))}
          </div>
        </div>

        <footer className={styles.footer}>
          <div className={styles.brand}>
            <Image
              src="/images/branding/natsx-logo-black.png"
              alt="NATSX"
              width={1110}
              height={380}
              className={styles.logo}
            />
          </div>

<div className={styles.footerMeta}>
  <div>
    <span className={styles.metaLabel}>
      Designed & built by
    </span>

    <span>Nafisa Juliansah Saputra</span>
  </div>

  <div>
    <span className={styles.metaLabel}>
      Portfolio
    </span>

    <span>NATSX / Digital Creator</span>
  </div>

  <div className={styles.copyright}>
    <span>© 2026 NATSX</span>
    <span>Indonesia</span>
  </div>
</div>
        </footer>
      </div>
    </section>
  );
}