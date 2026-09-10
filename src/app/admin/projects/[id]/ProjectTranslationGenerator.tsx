"use client";

import {
  useActionState,
  useEffect,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  generateProjectTranslations,
  type GenerateProjectTranslationState,
} from "./translation-actions";

import styles from "./ProjectTranslationGenerator.module.css";

type ProjectTranslationGeneratorProps = {
  projectId: string;
  projectTitle: string;
};

const initialState:
  GenerateProjectTranslationState = {
  status:
    "idle",

  message:
    "",
};

export default function ProjectTranslationGenerator({
  projectId,
  projectTitle,
}: ProjectTranslationGeneratorProps) {
  const router =
    useRouter();

  const generateAction =
    generateProjectTranslations.bind(
      null,
      projectId,
    );

  const [
    state,
    formAction,
    pending,
  ] =
    useActionState(
      generateAction,
      initialState,
    );

  useEffect(() => {
    if (
      state.status ===
      "success"
    ) {
      router.refresh();
    }
  }, [
    router,
    state.status,
  ]);

  return (
    <form
      className={
        styles.panel
      }
      action={
        formAction
      }
    >
      <header
        className={
          styles.header
        }
      >
        <div>
          <span
            className={
              styles.kicker
            }
          >
            NATSX TRANSLATION
          </span>

          <h2>
            Generate once.
            <br />
            Localize everywhere.
          </h2>
        </div>

        <p>
          English menjadi source
          of truth untuk{" "}
          <strong>
            {projectTitle}
          </strong>
          . Translation Engine akan
          membaca project copy dan
          seluruh content section,
          lalu menghasilkan localized
          copy tanpa menyentuh media,
          URL, layout, atau shared
          settings.
        </p>
      </header>

      <section
        className={
          styles.block
        }
      >
        <div
          className={
            styles.blockHeading
          }
        >
          <span>
            01
          </span>

          <div>
            <strong>
              Target languages
            </strong>

            <small>
              Pilih bahasa yang
              ingin digenerate dari
              English.
            </small>
          </div>
        </div>

        <div
          className={
            styles.languageGrid
          }
        >
          <label
            className={
              styles.choiceCard
            }
          >
            <input
              type="checkbox"
              name="target_locales"
              value="id"
              defaultChecked
            />

            <span
              className={
                styles.checkmark
              }
            />

            <span>
              <strong>
                ID
              </strong>

              <span>
                Bahasa Indonesia
              </span>

              <small>
                Natural creative
                portfolio tone
              </small>
            </span>
          </label>

          <label
            className={
              styles.choiceCard
            }
          >
            <input
              type="checkbox"
              name="target_locales"
              value="de"
              defaultChecked
            />

            <span
              className={
                styles.checkmark
              }
            />

            <span>
              <strong>
                DE
              </strong>

              <span>
                Deutsch
              </span>

              <small>
                Native professional
                German
              </small>
            </span>
          </label>
        </div>
      </section>

      <section
        className={
          styles.block
        }
      >
        <div
          className={
            styles.blockHeading
          }
        >
          <span>
            02
          </span>

          <div>
            <strong>
              Generation mode
            </strong>

            <small>
              Tentukan perlakuan
              terhadap translation
              yang sudah ada.
            </small>
          </div>
        </div>

        <div
          className={
            styles.modeGrid
          }
        >
          <label
            className={
              styles.modeCard
            }
          >
            <input
              type="radio"
              name="translation_mode"
              value="missing"
              defaultChecked
            />

            <span
              className={
                styles.radio
              }
            />

            <span>
              <strong>
                Fill missing
              </strong>

              <small>
                Recommended. Field
                ID/DE yang sudah lu
                edit manual tidak
                ditimpa.
              </small>
            </span>
          </label>

          <label
            className={
              styles.modeCard
            }
          >
            <input
              type="radio"
              name="translation_mode"
              value="overwrite"
            />

            <span
              className={
                styles.radio
              }
            />

            <span>
              <strong>
                Regenerate all
              </strong>

              <small>
                Generate ulang semua
                field translation
                yang didukung dari
                English terbaru.
              </small>
            </span>
          </label>
        </div>
      </section>

      <div
        className={
          styles.rules
        }
      >
        <div>
          <span>
            Protected
          </span>

          <p>
            Brand, project name,
            teknologi, section ID,
            item ID, media asset,
            URL, layout, dan shared
            settings tidak dapat
            diubah oleh translation
            model.
          </p>
        </div>

        <div>
          <span>
            Before generate
          </span>

          <p>
            Pastikan perubahan
            English sudah disimpan
            terlebih dahulu.
            Generator membaca
            canonical English dari
            database, bukan field
            yang masih belum di-save.
          </p>
        </div>
      </div>

      {state.message ? (
        <div
          className={
            styles.notice
          }
          data-status={
            state.status
          }
          role="status"
          aria-live="polite"
        >
          <span />

          <p>
            {
              state.message
            }
          </p>
        </div>
      ) : null}

      <footer
        className={
          styles.footer
        }
      >
        <p>
          One source.
          Two localized versions.
          Structured validation
          before database write.
        </p>

        <button
          type="submit"
          disabled={
            pending
          }
        >
          {pending
            ? "Generating translations..."
            : "Generate translations ↗"}
        </button>
      </footer>
    </form>
  );
}