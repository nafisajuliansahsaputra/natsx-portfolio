"use client";

import {
  useActionState,
  useEffect,
  useRef,
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
  createSection,
  deleteSection,
  moveSection,
  updateSectionSettings,
  updateSectionTranslation,
  type SectionActionState,
} from "./actions";

import FinaleSectionEditor from "./FinaleSectionEditor";
import GallerySectionEditor from "./GallerySectionEditor";
import ImageSectionEditor from "./ImageSectionEditor";
import MetricsSectionEditor from "./MetricsSectionEditor";
import QuoteSectionEditor from "./QuoteSectionEditor";

import styles from "./sections.module.css";

export type SectionTranslation = {
  locale: Locale;

  eyebrow:
    | string
    | null;

  heading:
    | string
    | null;

  body:
    | string
    | null;

  content: Record<
    string,
    unknown
  >;
};

export type SectionRow = {
  id: string;
  project_id: string;
  section_type: string;

  eyebrow:
    | string
    | null;

  heading:
    | string
    | null;

  body:
    | string
    | null;

  content: Record<
    string,
    unknown
  >;

  theme: string;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;

  translations: Record<
    Locale,
    SectionTranslation | null
  >;
};

type SectionManagerProps = {
  projectId: string;

  sections:
    SectionRow[];
};

const initialState:
  SectionActionState = {
  status:
    "idle",

  message:
    "",
};

const sectionTypes = [
  {
    value:
      "overview",

    label:
      "Overview",
  },

  {
    value:
      "narrative",

    label:
      "Narrative / Process",
  },

  {
    value:
      "statement",

    label:
      "Large Statement",
  },

  {
    value:
      "image",

    label:
      "Single Image",
  },

  {
    value:
      "gallery",

    label:
      "Image Gallery",
  },

  {
    value:
      "metrics",

    label:
      "Results / Metrics",
  },

  {
    value:
      "quote",

    label:
      "Quote",
  },

  {
    value:
      "finale",

    label:
      "Final Showcase",
  },
];

function getSectionTypeLabel(
  value: string,
) {
  return (
    sectionTypes.find(
      (
        type,
      ) =>
        type.value ===
        value,
    )?.label ??
    value
  );
}

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

function ServerButton({
  label,
  pendingLabel,
  className,
  disabled = false,
}: {
  label: string;
  pendingLabel: string;
  className: string;
  disabled?: boolean;
}) {
  const {
    pending,
  } =
    useFormStatus();

  return (
    <button
      className={
        className
      }
      type="submit"
      disabled={
        pending ||
        disabled
      }
    >
      {pending
        ? pendingLabel
        : label}
    </button>
  );
}

function hasTranslationContent(
  translation:
    | SectionTranslation
    | null,
) {
  if (
    !translation
  ) {
    return false;
  }

  return Boolean(
    translation.eyebrow
      ?.trim() ||
      translation.heading
        ?.trim() ||
      translation.body
        ?.trim() ||
      Object.keys(
        translation.content,
      ).length >
        0,
  );
}

function AddSectionForm({
  projectId,
}: {
  projectId: string;
}) {
  const router =
    useRouter();

  const formRef =
    useRef<HTMLFormElement>(
      null,
    );

  const action =
    createSection.bind(
      null,
      projectId,
    );

  const [
    state,
    formAction,
    isPending,
  ] =
    useActionState(
      action,
      initialState,
    );

  useEffect(() => {
    if (
      state.status ===
      "success"
    ) {
      formRef.current
        ?.reset();

      router.refresh();
    }
  }, [
    router,
    state.status,
  ]);

  return (
    <section
      className={
        styles.addPanel
      }
    >
      <div
        className={
          styles.panelIntroduction
        }
      >
        <span>
          ADD NEW SECTION
        </span>

        <div>
          <h2>
            Build the story.
          </h2>

          <p>
            Section baru dibuat
            dengan initial English
            copy. Bahasa Indonesia
            dan Deutsch dapat diisi
            setelah section dibuat.
          </p>
        </div>
      </div>

      <form
        ref={
          formRef
        }
        className={
          styles.form
        }
        action={
          formAction
        }
      >
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
              Section type
            </span>

            <select
              className={
                styles.input
              }
              name="section_type"
              defaultValue="narrative"
            >
              {sectionTypes.map(
                (
                  type,
                ) => (
                  <option
                    value={
                      type.value
                    }
                    key={
                      type.value
                    }
                  >
                    {
                      type.label
                    }
                  </option>
                ),
              )}
            </select>

            <FieldError
              message={
                state.errors
                  ?.section_type
              }
            />
          </label>

          <label
            className={
              styles.field
            }
          >
            <span>
              Theme
            </span>

            <select
              className={
                styles.input
              }
              name="theme"
              defaultValue="light"
            >
              <option value="light">
                Light
              </option>

              <option value="dark">
                Dark
              </option>

              <option value="accent">
                Accent
              </option>
            </select>

            <FieldError
              message={
                state.errors
                  ?.theme
              }
            />
          </label>

          <label
            className={
              styles.field
            }
          >
            <span>
              English eyebrow
            </span>

            <input
              className={
                styles.input
              }
              name="eyebrow"
              type="text"
              placeholder="01 / CONTEXT"
              maxLength={
                100
              }
            />

            <FieldError
              message={
                state.errors
                  ?.eyebrow
              }
            />
          </label>

          <label
            className={
              styles.field
            }
          >
            <span>
              English heading
            </span>

            <input
              className={
                styles.input
              }
              name="heading"
              type="text"
              placeholder="The challenge."
              maxLength={
                300
              }
            />

            <FieldError
              message={
                state.errors
                  ?.heading
              }
            />
          </label>

          <label
            className={`${styles.field} ${styles.fullWidth}`}
          >
            <span>
              English body
            </span>

            <textarea
              className={
                styles.textarea
              }
              name="body"
              placeholder="Jelaskan konteks, proses, pemikiran, atau hasil project."
              rows={
                5
              }
              maxLength={
                10000
              }
            />

            <FieldError
              message={
                state.errors
                  ?.body
              }
            />
          </label>
        </div>

        {state.message ? (
          <div
            className={
              styles.notice
            }
            data-type={
              state.status
            }
            role="status"
          >
            <span />

            <p>
              {
                state.message
              }
            </p>
          </div>
        ) : null}

        <div
          className={
            styles.addActions
          }
        >
          <p>
            Section otomatis
            ditambahkan pada urutan
            terakhir.
          </p>

          <button
            className={
              styles.primaryButton
            }
            type="submit"
            disabled={
              isPending
            }
          >
            {isPending
              ? "Adding section..."
              : "Add section ↗"}
          </button>
        </div>
      </form>
    </section>
  );
}

function SectionCard({
  projectId,
  section,
  index,
  totalSections,
}: {
  projectId: string;
  section: SectionRow;
  index: number;
  totalSections: number;
}) {
  const router =
    useRouter();

  const [
    contentLocale,
    setContentLocale,
  ] =
    useState<Locale>(
      "en",
    );

  const translationAction =
    updateSectionTranslation.bind(
      null,
      projectId,
      section.id,
    );

  const settingsAction =
    updateSectionSettings.bind(
      null,
      projectId,
      section.id,
    );

  const moveAction =
    moveSection.bind(
      null,
      projectId,
      section.id,
    );

  const removeAction =
    deleteSection.bind(
      null,
      projectId,
      section.id,
    );

  const [
    translationState,
    translationFormAction,
    translationPending,
  ] =
    useActionState(
      translationAction,
      initialState,
    );

  const [
    settingsState,
    settingsFormAction,
    settingsPending,
  ] =
    useActionState(
      settingsAction,
      initialState,
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
    SectionTranslation = {
    locale:
      "en",

    eyebrow:
      section.eyebrow,

    heading:
      section.heading,

    body:
      section.body,

    content:
      {},
  };

  const activeTranslation =
    contentLocale ===
      "en"
      ? section
          .translations
          .en ??
        legacyEnglish
      : section
          .translations[
          contentLocale
        ];

  const activeTranslationContent =
    section.translations[
      contentLocale
    ]?.content ??
    {};

  const canonicalHeading =
    section.translations
      .en?.heading ||
    section.heading ||
    getSectionTypeLabel(
      section.section_type,
    );

  return (
    <article
      className={
        styles.sectionCard
      }
      data-theme={
        section.theme
      }
    >
      <header
        className={
          styles.cardHeader
        }
      >
        <div
          className={
            styles.cardIdentity
          }
        >
          <span
            className={
              styles.cardNumber
            }
          >
            {String(
              index +
                1,
            ).padStart(
              2,
              "0",
            )}
          </span>

          <div>
            <h2>
              {
                canonicalHeading
              }
            </h2>

            <div
              className={
                styles.cardMeta
              }
            >
              <span>
                {
                  getSectionTypeLabel(
                    section.section_type,
                  )
                }
              </span>

              <span>
                {
                  section.theme
                }
              </span>

              <span
                data-visible={
                  section.is_visible
                }
                className={
                  styles.visibilityBadge
                }
              >
                {section.is_visible
                  ? "Visible"
                  : "Hidden"}
              </span>
            </div>
          </div>
        </div>

        <span
          className={
            styles.dragLabel
          }
        >
          ORDER{" "}
          {String(
            section.sort_order,
          ).padStart(
            2,
            "0",
          )}
        </span>
      </header>

      <div
        className={
          styles.translationBlock
        }
      >
        <div
          className={
            styles.sectionLanguageTabs
          }
          role="group"
          aria-label="Section content language"
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
                  section
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
                      ? `${styles.sectionLanguageTab} ${styles.sectionLanguageTabActive}`
                      : styles.sectionLanguageTab
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

        <p
          className={
            styles.sectionLanguageHint
          }
        >
          {contentLocale ===
          "en"
            ? "English adalah canonical fallback untuk section ini."
            : "Field kosong akan fallback ke English. Specialized content yang sudah locale-aware mengikuti tab aktif ini."}
        </p>

        <form
          key={
            contentLocale
          }
          className={
            styles.cardForm
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
                Eyebrow
              </span>

              <input
                className={
                  styles.input
                }
                name="eyebrow"
                type="text"
                defaultValue={
                  activeTranslation
                    ?.eyebrow ??
                  ""
                }
                placeholder="01 / CONTEXT"
                maxLength={
                  100
                }
              />

              <FieldError
                message={
                  translationState
                    .errors
                    ?.eyebrow
                }
              />
            </label>

            <label
              className={
                styles.field
              }
            >
              <span>
                Heading
              </span>

              <input
                className={
                  styles.input
                }
                name="heading"
                type="text"
                defaultValue={
                  activeTranslation
                    ?.heading ??
                  ""
                }
                placeholder="The challenge."
                maxLength={
                  300
                }
              />

              <FieldError
                message={
                  translationState
                    .errors
                    ?.heading
                }
              />
            </label>

            <label
              className={`${styles.field} ${styles.fullWidth}`}
            >
              <span>
                Body
              </span>

              <textarea
                className={
                  styles.textarea
                }
                name="body"
                defaultValue={
                  activeTranslation
                    ?.body ??
                  ""
                }
                rows={
                  6
                }
                maxLength={
                  10000
                }
              />

              <FieldError
                message={
                  translationState
                    .errors
                    ?.body
                }
              />
            </label>
          </div>

          <div
            className={
              styles.cardSettings
            }
          >
            <p
              className={
                styles.sectionSaveHint
              }
            >
              Menyimpan{" "}
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
                ? "Saving..."
                : `Save ${contentLocale.toUpperCase()} content`}
            </button>
          </div>

          {translationState.message ? (
            <div
              className={
                styles.notice
              }
              data-type={
                translationState.status
              }
              role="status"
            >
              <span />

              <p>
                {
                  translationState.message
                }
              </p>
            </div>
          ) : null}
        </form>
      </div>

      {section.section_type ===
      "image" ? (
        <ImageSectionEditor
          key={`image-${section.id}-${contentLocale}`}
          projectId={
            projectId
          }
          section={
            section
          }
          locale={
            contentLocale
          }
          translationContent={
            activeTranslationContent
          }
        />
      ) : section.section_type ===
        "gallery" ? (
        <GallerySectionEditor
          key={`gallery-${section.id}-${contentLocale}`}
          projectId={
            projectId
          }
          section={
            section
          }
          locale={
            contentLocale
          }
          translationContent={
            activeTranslationContent
          }
        />
      ) : section.section_type ===
        "metrics" ? (
        <MetricsSectionEditor
          key={`metrics-${section.id}-${contentLocale}`}
          projectId={
            projectId
          }
          section={
            section
          }
          locale={
            contentLocale
          }
          translationContent={
            activeTranslationContent
          }
        />
      ) : section.section_type ===
        "quote" ? (
<QuoteSectionEditor
  key={`quote-${section.id}-${contentLocale}`}
  projectId={
    projectId
  }
  section={
    section
  }
  locale={
    contentLocale
  }
  translationContent={
    activeTranslationContent
  }
/>
      ) : section.section_type ===
        "finale" ? (
<FinaleSectionEditor
  key={`finale-${section.id}-${contentLocale}`}
  projectId={
    projectId
  }
  section={
    section
  }
  locale={
    contentLocale
  }
  translationContent={
    activeTranslationContent
  }
/>
      ) : null}

      <form
        className={
          styles.sharedSectionSettings
        }
        action={
          settingsFormAction
        }
      >
        <div
          className={
            styles.sharedSectionHeading
          }
        >
          <span>
            SHARED SETTINGS
          </span>

          <p>
            Type, theme,
            visibility, media dan
            layout berlaku ke semua
            bahasa.
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
              Section type
            </span>

            <select
              className={
                styles.input
              }
              name="section_type"
              defaultValue={
                section.section_type
              }
            >
              {sectionTypes.map(
                (
                  type,
                ) => (
                  <option
                    value={
                      type.value
                    }
                    key={
                      type.value
                    }
                  >
                    {
                      type.label
                    }
                  </option>
                ),
              )}
            </select>

            <FieldError
              message={
                settingsState
                  .errors
                  ?.section_type
              }
            />
          </label>

          <label
            className={
              styles.field
            }
          >
            <span>
              Theme
            </span>

            <select
              className={
                styles.input
              }
              name="theme"
              defaultValue={
                section.theme
              }
            >
              <option value="light">
                Light
              </option>

              <option value="dark">
                Dark
              </option>

              <option value="accent">
                Accent
              </option>
            </select>

            <FieldError
              message={
                settingsState
                  .errors
                  ?.theme
              }
            />
          </label>
        </div>

        <div
          className={
            styles.cardSettings
          }
        >
          <label
            className={
              styles.visibilityToggle
            }
          >
            <input
              name="is_visible"
              type="checkbox"
              defaultChecked={
                section.is_visible
              }
            />

            <span
              className={
                styles.customCheckbox
              }
            />

            <span>
              <strong>
                Visible on public
                page
              </strong>

              <small>
                Matikan untuk
                menyembunyikan
                section tanpa
                menghapusnya.
              </small>
            </span>
          </label>

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
              ? "Saving..."
              : "Save shared settings"}
          </button>
        </div>

        {settingsState.message ? (
          <div
            className={
              styles.notice
            }
            data-type={
              settingsState.status
            }
            role="status"
          >
            <span />

            <p>
              {
                settingsState.message
              }
            </p>
          </div>
        ) : null}
      </form>

      <footer
        className={
          styles.cardToolbar
        }
      >
        <div
          className={
            styles.reorderActions
          }
        >
          <form
            action={
              moveAction
            }
          >
            <input
              name="direction"
              type="hidden"
              value="up"
            />

            <ServerButton
              className={
                styles.secondaryButton
              }
              label="↑ Move up"
              pendingLabel="Moving..."
              disabled={
                index ===
                0
              }
            />
          </form>

          <form
            action={
              moveAction
            }
          >
            <input
              name="direction"
              type="hidden"
              value="down"
            />

            <ServerButton
              className={
                styles.secondaryButton
              }
              label="↓ Move down"
              pendingLabel="Moving..."
              disabled={
                index ===
                totalSections -
                  1
              }
            />
          </form>
        </div>

        <form
          action={
            removeAction
          }
          onSubmit={(
            event,
          ) => {
            const confirmed =
              window.confirm(
                `Hapus section "${canonicalHeading}"?`,
              );

            if (
              !confirmed
            ) {
              event.preventDefault();
            }
          }}
        >
          <ServerButton
            className={
              styles.deleteButton
            }
            label="Delete section"
            pendingLabel="Deleting..."
          />
        </form>
      </footer>
    </article>
  );
}

export default function SectionManager({
  projectId,
  sections,
}: SectionManagerProps) {
  return (
    <div
      className={
        styles.manager
      }
    >
      <AddSectionForm
        projectId={
          projectId
        }
      />

      <section
        className={
          styles.sectionArchive
        }
      >
        <div
          className={
            styles.archiveHeader
          }
        >
          <div>
            <span
              className={
                styles.dot
              }
            />

            <span>
              SECTION ARCHIVE
            </span>
          </div>

          <span>
            {
              sections.length
            }{" "}
            RECORDS
          </span>
        </div>

        {sections.length ===
        0 ? (
          <div
            className={
              styles.emptyState
            }
          >
            <span>
              NO SECTIONS YET
            </span>

            <h2>
              Start with
              <br />

              the context
              <span>
                .
              </span>
            </h2>

            <p>
              Buat section pertama
              untuk mulai menyusun
              cerita project.
            </p>
          </div>
        ) : (
          <div
            className={
              styles.sectionList
            }
          >
            {sections.map(
              (
                section,
                index,
              ) => (
                <SectionCard
                  projectId={
                    projectId
                  }
                  section={
                    section
                  }
                  index={
                    index
                  }
                  totalSections={
                    sections.length
                  }
                  key={
                    section.id
                  }
                />
              ),
            )}
          </div>
        )}
      </section>
    </div>
  );
}