"use client";

import type { FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

import styles from "./login.module.css";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErrorMessage("");
    setIsLoading(true);

    const supabase = createClient();

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className={styles.page}>
      <section className={styles.loginSide}>
        <div className={styles.loginInner}>
          <header className={styles.loginHeader}>
            <Link
              href="/"
              className={styles.brand}
              aria-label="NATSX portfolio"
            >
              <Image
                src="/images/branding/natsx-logo-black.png"
                alt="NATSX"
                width={1110}
                height={380}
                priority
                className={styles.brandLogo}
              />
            </Link>

            <Link
              className={styles.backLink}
              href="/"
            >
              Portfolio
              <span aria-hidden="true">↗</span>
            </Link>
          </header>

          <div className={styles.loginContent}>
            <div className={styles.eyebrow}>
              <span className={styles.dot} />
              PRIVATE ACCESS / 01
            </div>

            <div className={styles.headingGroup}>
              <h1>
                Welcome
                <br />
                back<span>.</span>
              </h1>

              <p>
                Enter the control room to manage
                projects, case studies, and the NATSX
                portfolio archive.
              </p>
            </div>

            <form
              className={styles.form}
              onSubmit={handleSubmit}
            >
              <label className={styles.field}>
                <span>Email</span>

                <div className={styles.inputShell}>
                  <span
                    className={styles.inputIcon}
                    aria-hidden="true"
                  >
                    @
                  </span>

                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="name@email.com"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    required
                  />
                </div>
              </label>

              <label className={styles.field}>
                <span>Password</span>

                <div className={styles.inputShell}>
                  <span
                    className={styles.inputIcon}
                    aria-hidden="true"
                  >
                    •
                  </span>

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="current-password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    required
                  />

                  <button
                    className={styles.passwordToggle}
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current,
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>

              {errorMessage ? (
                <div
                  className={styles.error}
                  role="alert"
                >
                  <span />

                  <p>{errorMessage}</p>
                </div>
              ) : null}

              <button
                className={styles.submitButton}
                type="submit"
                disabled={isLoading}
              >
                <span>
                  {isLoading
                    ? "Authenticating"
                    : "Enter dashboard"}
                </span>

                <span aria-hidden="true">
                  {isLoading ? "•••" : "↗"}
                </span>
              </button>
            </form>

            <div className={styles.securityNote}>
              <span className={styles.securityNumber}>
                01
              </span>

              <p>
                Authorized NATSX administrator access
                only.
              </p>
            </div>
          </div>

          <footer className={styles.loginFooter}>
            <span>NATSX © 2026</span>

            <span>
              DIGITAL CREATOR / INDONESIA
            </span>
          </footer>
        </div>
      </section>

      <section
        className={styles.visualSide}
        aria-hidden="true"
      >
        <div className={styles.visualPanel}>
          <div className={styles.visualGrid} />
          <div className={styles.visualGlow} />

          <header className={styles.visualHeader}>
            <Image
              src="/images/branding/natsx-logo-black.png"
              alt=""
              width={1110}
              height={380}
              priority
              className={styles.visualLogo}
            />

            <div className={styles.systemStatus}>
              <i />
              <span>SYSTEM READY</span>
            </div>
          </header>

          <div className={styles.visualIdentity}>
            <span>ADMIN / CONTROL ROOM</span>
            <span>NATSX PORTFOLIO SYSTEM</span>
          </div>

          <div className={styles.monogramStage}>
            <div className={styles.monogram}>N</div>

            <div className={styles.orbit} />

            <div className={styles.orbitPoint} />

            <div className={styles.coordinate}>
              06°12&apos;S / 106°49&apos;E
            </div>
          </div>

          <div className={styles.visualMain}>
            <div className={styles.visualEyebrow}>
              <span>PORTFOLIO SYSTEM</span>
              <span>2026 / N</span>
            </div>

            <h2>
              Design.
              <br />
              Build.
              <br />
              <em>Publish.</em>
            </h2>

            <p>
              One place to shape the work behind the
              portfolio—from raw project to published
              case study.
            </p>
          </div>

          <div className={styles.systemRail}>
            <div className={styles.railIntro}>
              <span>SYSTEM / 01</span>

              <strong>
                From idea
                <br />
                to experience.
              </strong>
            </div>

            <div className={styles.railItem}>
              <span>01</span>
              <strong>Projects</strong>
              <p>Identity & metadata</p>
            </div>

            <div className={styles.railItem}>
              <span>02</span>
              <strong>Stories</strong>
              <p>Case study system</p>
            </div>

            <div className={styles.railItem}>
              <span>03</span>
              <strong>Media</strong>
              <p>Images & motion</p>
            </div>
          </div>

          <footer className={styles.visualFooter}>
            <span>
              PRIVATE INTERFACE / AUTHORIZED ONLY
            </span>

            <span>N / 26</span>
          </footer>
        </div>
      </section>
    </main>
  );
}