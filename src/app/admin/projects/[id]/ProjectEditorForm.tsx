"use client";

import {
  useActionState,
  useEffect,
  useState,
} from "react";

import {
  useFormStatus,
} from "react-dom";

import {
  useRouter,
} from "next/navigation";

import type {
  Locale,
} from "@/i18n/config";

import {
  localeLabels,
  locales,
} from "@/i18n/config";

import {
  deleteProject,
  updateProjectSettings,
  updateProjectTranslation,
  type UpdateProjectSettingsState,
  type UpdateProjectTranslationState,
} from "./actions";

import styles from "./project-editor.module.css";

export type EditableProjectTranslation = {
  locale: Locale;

  title:
    | string
    | null;

  period:
    | string
    | null;

  summary:
    | string
    | null;

  categories:
    | string[]
    | null;

  roles:
    | string[]
    | null;
};

export type EditableProject = {
  id: string;

  slug: string;

  title: string;

  project_number: string;

  year: number;

  period:
    | string
    | null;

  summary: string;

  categories: string[];

  roles: string[];

  tech_stack: string[];

  project_status: string;

  status: string;

  featured: boolean;

  sort_order: number;

  live_url:
    | string
    | null;

  repository_url:
    | string
    | null;

  accent_color: string;

  secondary_color:
    | string
    | null;

  published_at:
    | string
    | null;

  translations: Record<
    Locale,
    EditableProjectTranslation | null
  >;
};

type ProjectEditorFormProps = {
  project:
    EditableProject;
};

const initialTranslationState:
  UpdateProjectTranslationState =
  {
    status:
      "idle",

    message:
      "",
  };

const initialSettingsState:
  UpdateProjectSettingsState =
  {
    status:
      "idle",

    message:
      "",
  };

function FieldError({
  message,
}: {
  message?: string;
}) {
  if (
    !message
  ) {
    return null;
  }

  return (
    <span
      className={
        styles.errorText
      }
    >
      {
        message
      }
    </span>
  );
}

function DeleteButton() {
  const {
    pending,
  } =
    useFormStatus();

  return (
    <button
      className={
        styles.deleteButton
      }
      type="submit"
      disabled={
        pending
      }
    >
      {pending
        ? "Deleting project..."
        : "Delete project"}
    </button>
  );
}

function hasTranslationContent(
  translation:
    | EditableProjectTranslation
    | null,
) {
  if (
    !translation
  ) {
    return false;
  }

  return Boolean(
    translation.title
      ?.trim() ||
      translation.period
        ?.trim() ||
      translation.summary
        ?.trim() ||
      translation.categories
        ?.length ||
      translation.roles
        ?.length,
  );
}

export default function ProjectEditorForm({
  project,
}: ProjectEditorFormProps) {
  const router =
    useRouter();

  const [
    contentLocale,
    setContentLocale,
  ] =
    useState<Locale>(
      "en",
    );

  const [
    accentColor,
    setAccentColor,
  ] =
    useState(
      project.accent_color ||
        "#5961ED",
    );

  const translationAction =
    updateProjectTranslation.bind(
      null,
      project.id,
    );

  const settingsAction =
    updateProjectSettings.bind(
      null,
      project.id,
    );

  const deleteAction =
    deleteProject.bind(
      null,
      project.id,
    );

  const [
    translationState,
    translationFormAction,
    translationPending,
  ] =
    useActionState(
      translationAction,
      initialTranslationState,
    );

  const [
    settingsState,
    settingsFormAction,
    settingsPending,
  ] =
    useActionState(
      settingsAction,
      initialSettingsState,
    );

  useEffect(() => {
    if (
      translationState.status ===
        "success" ||
      settingsState.status ===
        "success"
    ) {
      router.refresh();
    }
  }, [
    router,
    settingsState.status,
    translationState.status,
  ]);

  const legacyEnglish:
    EditableProjectTranslation =
    {
      locale:
        "en",

      title:
        project.title,

      period:
        project.period,

      summary:
        project.summary,

      categories:
        project.categories,

      roles:
        project.roles,
    };

  const activeTranslation =
    contentLocale ===
      "en"
      ? project
          .translations
          .en ??
        legacyEnglish
      : project
          .translations[
          contentLocale
        ];

  return (
    <div
      className={
        styles.editor
      }
    >
      {/* =========================
          TRANSLATED CONTENT
      ========================= */}

      <form
        key={
          contentLocale
        }
        className={
          styles.form
        }
        action={
          translationFormAction
        }
      >
        <input
          type="hidden"
          name="content_locale"
          value={
            contentLocale
          }
          readOnly
        />

        <section
          className={
            styles.translationPanel
          }
        >
          <div
            className={
              styles.settingIntroduction
            }
          >
            <span>
              Project content
            </span>

            <p>
              Title, period,
              summary,
              categories, dan
              roles dapat memiliki
              copy berbeda untuk
              setiap bahasa.
            </p>
          </div>

          <div
            className={
              styles.languageTabs
            }
            role="group"
            aria-label="Project content language"
          >
            {locales.map(
              (
                locale,
              ) => {
                const active =
                  locale ===
                  contentLocale;

                const ready =
                  locale ===
                    "en" ||
                  hasTranslationContent(
                    project
                      .translations[
                      locale
                    ],
                  );

                return (
                  <button
                    type="button"
                    key={
                      locale
                    }
                    className={
                      active
                        ? `${styles.languageTab} ${styles.languageTabActive}`
                        : styles.languageTab
                    }
                    aria-pressed={
                      active
                    }
                    onClick={() =>
                      setContentLocale(
                        locale,
                      )
                    }
                  >
                    <span>
                      {
                        localeLabels[
                          locale
                        ].short
                      }
                    </span>

                    <strong>
                      {
                        localeLabels[
                          locale
                        ].label
                      }
                    </strong>

                    <small
                      data-ready={
                        ready
                      }
                    >
                      {ready
                        ? "Ready"
                        : "Empty"}
                    </small>
                  </button>
                );
              },
            )}
          </div>

          {contentLocale !==
          "en" ? (
            <p
              className={
                styles.translationHint
              }
            >
              Field yang kosong
              akan memakai English
              sebagai fallback.
              Kosongkan seluruh
              field lalu Save untuk
              menghapus translation
              bahasa ini.
            </p>
          ) : (
            <p
              className={
                styles.translationHint
              }
            >
              English adalah
              canonical fallback
              untuk semua bahasa.
              Title English wajib
              tersedia.
            </p>
          )}
        </section>

        <div
          className={
            styles.fieldGrid
          }
        >
          <label
            className={`${styles.field} ${styles.fullWidth}`}
          >
            <span>
              Project title *
            </span>

            <input
              className={
                styles.input
              }
              name="title"
              type="text"
              defaultValue={
                activeTranslation
                  ?.title ??
                ""
              }
              maxLength={
                140
              }
              required={
                contentLocale ===
                "en"
              }
            />

            <FieldError
              message={
                translationState
                  .errors
                  ?.title
              }
            />
          </label>

          <label
            className={
              styles.field
            }
          >
            <span>
              Period
            </span>

            <input
              className={
                styles.input
              }
              name="period"
              type="text"
              defaultValue={
                activeTranslation
                  ?.period ??
                ""
              }
              placeholder="Jan—Mar 2026"
              maxLength={
                80
              }
            />
          </label>

          <label
            className={
              styles.field
            }
          >
            <span>
              Categories
            </span>

            <input
              className={
                styles.input
              }
              name="categories"
              type="text"
              defaultValue={
                activeTranslation
                  ?.categories
                  ?.join(
                    ", ",
                  ) ??
                ""
              }
              placeholder="Web Design, Development, Branding"
            />

            <small
              className={
                styles.helper
              }
            >
              Pisahkan setiap
              kategori dengan koma.
            </small>
          </label>

          <label
            className={`${styles.field} ${styles.fullWidth}`}
          >
            <span>
              Project summary
            </span>

            <textarea
              className={
                styles.textarea
              }
              name="summary"
              defaultValue={
                activeTranslation
                  ?.summary ??
                ""
              }
              rows={
                6
              }
              maxLength={
                2000
              }
            />

            <FieldError
              message={
                translationState
                  .errors
                  ?.summary
              }
            />
          </label>

          <label
            className={`${styles.field} ${styles.fullWidth}`}
          >
            <span>
              Roles
            </span>

            <input
              className={
                styles.input
              }
              name="roles"
              type="text"
              defaultValue={
                activeTranslation
                  ?.roles
                  ?.join(
                    ", ",
                  ) ??
                ""
              }
              placeholder="UI/UX Designer, Developer"
            />

            <small
              className={
                styles.helper
              }
            >
              Pisahkan setiap role
              dengan koma.
            </small>
          </label>
        </div>

        {translationState.message ? (
          <div
            className={
              styles.formNotice
            }
            data-type={
              translationState.status
            }
            role="status"
            aria-live="polite"
          >
            <span />

            <p>
              {
                translationState.message
              }
            </p>
          </div>
        ) : null}

        <div
          className={
            styles.actions
          }
        >
          <p>
            Menyimpan copy untuk{" "}
            <strong>
              {
                localeLabels[
                  contentLocale
                ].label
              }
            </strong>{" "}
            tidak mengubah bahasa
            lainnya.
          </p>

          <button
            className={
              styles.saveButton
            }
            type="submit"
            disabled={
              translationPending
            }
          >
            {translationPending
              ? "Saving content..."
              : `Save ${contentLocale.toUpperCase()} content ↗`}
          </button>
        </div>
      </form>

      {/* =========================
          SHARED SETTINGS
      ========================= */}

      <form
        className={`${styles.form} ${styles.settingsForm}`}
        action={
          settingsFormAction
        }
      >
        <div
          className={
            styles.formSectionHeading
          }
        >
          <span>
            Shared settings
          </span>

          <p>
            Setting berikut berlaku
            ke semua bahasa.
          </p>
        </div>

        <div
          className={
            styles.fieldGrid
          }
        >
          <label
            className={
              styles.field
            }
          >
            <span>
              Project slug *
            </span>

            <input
              className={
                styles.input
              }
              name="slug"
              type="text"
              defaultValue={
                project.slug
              }
              maxLength={
                100
              }
              required
              readOnly={
                Boolean(
                  project.published_at,
                )
              }
            />

            <small
              className={
                styles.helper
              }
            >
              {project.published_at
                ? "Slug dikunci setelah publish pertama agar URL project tetap stabil."
                : "Slug masih dapat diubah sebelum project pertama kali dipublikasikan."}
            </small>

            <FieldError
              message={
                settingsState
                  .errors
                  ?.slug
              }
            />
          </label>

          <label
            className={
              styles.field
            }
          >
            <span>
              Project number *
            </span>

            <input
              className={
                styles.input
              }
              name="project_number"
              type="text"
              defaultValue={
                project.project_number
              }
              maxLength={
                10
              }
              required
            />

            <FieldError
              message={
                settingsState
                  .errors
                  ?.project_number
              }
            />
          </label>

          <label
            className={
              styles.field
            }
          >
            <span>
              Year *
            </span>

            <input
              className={
                styles.input
              }
              name="year"
              type="number"
              defaultValue={
                project.year
              }
              min={
                2000
              }
              max={
                2100
              }
              required
            />

            <FieldError
              message={
                settingsState
                  .errors
                  ?.year
              }
            />
          </label>

          <label
            className={`${styles.field} ${styles.fullWidth}`}
          >
            <span>
              Tech stack
            </span>

            <input
              className={
                styles.input
              }
              name="tech_stack"
              type="text"
              defaultValue={
                project.tech_stack.join(
                  ", ",
                )
              }
              placeholder="Next.js, TypeScript, PostgreSQL, FastAPI"
            />

            <small
              className={
                styles.helper
              }
            >
              Teknologi utama project.
              Pisahkan dengan koma.
              Field ini sama di semua
              bahasa.
            </small>
          </label>

          <label
            className={`${styles.field} ${styles.fullWidth}`}
          >
            <span>
              Project status
            </span>

            <input
              className={
                styles.input
              }
              name="project_status"
              type="text"
              defaultValue={
                project.project_status
              }
              placeholder="In Development"
            />

            <small
              className={
                styles.helper
              }
            >
              Status publik project,
              misalnya In Development,
              V1 Complete, Complete, atau
              Reconstruction.
            </small>

            <FieldError
              message={
                settingsState
                  .errors
                  ?.project_status
              }
            />
          </label>

          <label
            className={`${styles.field} ${styles.fullWidth}`}
          >
            <span>
              Live project URL
            </span>

            <input
              className={
                styles.input
              }
              name="live_url"
              type="url"
              defaultValue={
                project.live_url ??
                ""
              }
              placeholder="https://example.com"
            />

            <FieldError
              message={
                settingsState
                  .errors
                  ?.live_url
              }
            />
          </label>

          <label
            className={`${styles.field} ${styles.fullWidth}`}
          >
            <span>
              Source repository URL
            </span>

            <input
              className={
                styles.input
              }
              name="repository_url"
              type="url"
              defaultValue={
                project.repository_url ??
                ""
              }
              placeholder="https://github.com/owner/repository"
            />

            <small
              className={
                styles.helper
              }
            >
              Repository source untuk
              project ini. Kosongkan
              jika project tidak punya
              source repository publik.
            </small>

            <FieldError
              message={
                settingsState
                  .errors
                  ?.repository_url
              }
            />
          </label>

          <section
            className={`${styles.settingsPanel} ${styles.fullWidth}`}
          >
            <div
              className={
                styles.settingIntroduction
              }
            >
              <span>
                Publication settings
              </span>

              <p>
                Atur visibilitas,
                status publikasi,
                dan urutan project
                pada website.
              </p>
            </div>

            <div
              className={
                styles.settingsGrid
              }
            >
              <label
                className={
                  styles.field
                }
              >
                <span>
                  Status
                </span>

                <select
                  className={
                    styles.input
                  }
                  name="status"
                  defaultValue={
                    project.status
                  }
                >
                  <option
                    value="draft"
                  >
                    Draft
                  </option>

                  <option
                    value="published"
                  >
                    Published
                  </option>

                  <option
                    value="archived"
                  >
                    Archived
                  </option>
                </select>

                <FieldError
                  message={
                    settingsState
                      .errors
                      ?.status
                  }
                />
              </label>

              <label
                className={
                  styles.field
                }
              >
                <span>
                  Sort order
                </span>

                <input
                  className={
                    styles.input
                  }
                  name="sort_order"
                  type="number"
                  defaultValue={
                    project.sort_order
                  }
                  min={
                    0
                  }
                  required
                />

                <FieldError
                  message={
                    settingsState
                      .errors
                      ?.sort_order
                  }
                />
              </label>

              <label
                className={
                  styles.checkboxCard
                }
              >
                <input
                  name="featured"
                  type="checkbox"
                  defaultChecked={
                    project.featured
                  }
                />

                <span
                  className={
                    styles.customCheckbox
                  }
                />

                <span>
                  <strong>
                    Featured project
                  </strong>

                  <small>
                    Tampilkan sebagai
                    project utama.
                  </small>
                </span>
              </label>
            </div>
          </section>

          <section
            className={`${styles.palettePanel} ${styles.fullWidth}`}
          >
            <div
              className={
                styles.settingIntroduction
              }
            >
              <span>
                Project palette
              </span>

              <p>
                Warna digunakan
                sebagai identitas
                visual project dan
                sama di semua bahasa.
              </p>
            </div>

            <div
              className={
                styles.paletteGrid
              }
            >
              <label
                className={
                  styles.field
                }
              >
                <span>
                  Accent color
                </span>

                <div
                  className={
                    styles.colorControl
                  }
                >
                  <input
                    className={
                      styles.colorInput
                    }
                    name="accent_color"
                    type="color"
                    value={
                      accentColor
                    }
                    onChange={(
                      event,
                    ) =>
                      setAccentColor(
                        event.target.value,
                      )
                    }
                  />

                  <span>
                    {
                      accentColor.toUpperCase()
                    }
                  </span>
                </div>

                <FieldError
                  message={
                    settingsState
                      .errors
                      ?.accent_color
                  }
                />
              </label>

              <label
                className={
                  styles.field
                }
              >
                <span>
                  Secondary color
                </span>

                <input
                  className={
                    styles.input
                  }
                  name="secondary_color"
                  type="text"
                  defaultValue={
                    project.secondary_color ??
                    ""
                  }
                  placeholder="#F4EFE6"
                  maxLength={
                    7
                  }
                />

                <FieldError
                  message={
                    settingsState
                      .errors
                      ?.secondary_color
                  }
                />
              </label>
            </div>
          </section>
        </div>

        {settingsState.message ? (
          <div
            className={
              styles.formNotice
            }
            data-type={
              settingsState.status
            }
            role="status"
            aria-live="polite"
          >
            <span />

            <p>
              {
                settingsState.message
              }
            </p>
          </div>
        ) : null}

        <div
          className={
            styles.actions
          }
        >
          <p>
            Shared settings berlaku
            ke EN, ID, dan DE.
          </p>

          <button
            className={
              styles.saveButton
            }
            type="submit"
            disabled={
              settingsPending
            }
          >
            {settingsPending
              ? "Saving settings..."
              : "Save project settings ↗"}
          </button>
        </div>
      </form>

      <section
        className={
          styles.dangerZone
        }
      >
        <div>
          <span>
            DANGER ZONE
          </span>

          <h2>
            Delete this project.
          </h2>

          <p>
            Project, seluruh section,
            dan seluruh translation
            di dalamnya akan dihapus
            secara permanen.
          </p>
        </div>

        <form
          action={
            deleteAction
          }
          onSubmit={(
            event,
          ) => {
            const confirmed =
              window.confirm(
                `Hapus project "${project.title}" secara permanen?`,
              );

            if (
              !confirmed
            ) {
              event.preventDefault();
            }
          }}
        >
          <DeleteButton />
        </form>
      </section>
    </div>
  );
}