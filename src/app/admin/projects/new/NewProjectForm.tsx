"use client";

import {
  useActionState,
  useState,
} from "react";

import {
  createProject,
  type CreateProjectState,
} from "./actions";

import styles from "./new-project.module.css";


export type WorkCategoryOption = {
  id:
    string;

  name:
    string;

  slug:
    string;

  isVisible:
    boolean;
};


type NewProjectFormProps = {
  currentYear:
    number;

  workCategories:
    WorkCategoryOption[];
};


const initialState:
  CreateProjectState = {
  message:
    "",
};


function createSlug(
  value:
    string,
) {
  return value
    .normalize(
      "NFKD",
    )
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      "-",
    )
    .replace(
      /^-+|-+$/g,
      "",
    )
    .slice(
      0,
      100,
    );
}


function FieldError({
  message,
}: {
  message?:
    string;
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


export default function NewProjectForm({
  currentYear,
  workCategories,
}: NewProjectFormProps) {
  const [
    state,
    formAction,
    isPending,
  ] =
    useActionState(
      createProject,
      initialState,
    );

  const [
    title,
    setTitle,
  ] =
    useState(
      "",
    );

  const [
    slug,
    setSlug,
  ] =
    useState(
      "",
    );

  const [
    accentColor,
    setAccentColor,
  ] =
    useState(
      "#5961ED",
    );

  const [
    isSlugManual,
    setIsSlugManual,
  ] =
    useState(
      false,
    );


  function handleTitleChange(
    value:
      string,
  ) {
    setTitle(
      value,
    );

    if (
      !isSlugManual
    ) {
      setSlug(
        createSlug(
          value,
        ),
      );
    }
  }


  function handleSlugChange(
    value:
      string,
  ) {
    setSlug(
      createSlug(
        value,
      ),
    );

    setIsSlugManual(
      value.length >
        0,
    );
  }


  return (
    <form
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
        {/* =========================
            TITLE
        ========================= */}

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
            value={
              title
            }
            onChange={(
              event,
            ) =>
              handleTitleChange(
                event
                  .target
                  .value,
              )
            }
            placeholder="Spall Spill"
            maxLength={
              140
            }
            required
          />

          <FieldError
            message={
              state.errors
                ?.title
            }
          />
        </label>

        {/* =========================
            SLUG
        ========================= */}

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
            value={
              slug
            }
            onChange={(
              event,
            ) =>
              handleSlugChange(
                event
                  .target
                  .value,
              )
            }
            placeholder="spall-spill"
            maxLength={
              100
            }
            required
          />

          <small
            className={
              styles.helper
            }
          >
            URL project:
            /work/
            {
              slug ||
              "project-slug"
            }
          </small>

          <FieldError
            message={
              state.errors
                ?.slug
            }
          />
        </label>

        {/* =========================
            PROJECT NUMBER
        ========================= */}

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
            defaultValue="01"
            placeholder="01"
            maxLength={
              10
            }
            required
          />

          <FieldError
            message={
              state.errors
                ?.project_number
            }
          />
        </label>

        {/* =========================
            YEAR
        ========================= */}

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
              currentYear
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
              state.errors
                ?.year
            }
          />
        </label>

        {/* =========================
            PERIOD
        ========================= */}

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
            placeholder="Jan—Mar 2026"
            maxLength={
              80
            }
          />
        </label>

        {/* =========================
            SUMMARY
        ========================= */}

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
            placeholder="Jelaskan project, masalah yang diselesaikan, dan hasil akhirnya."
            rows={
              6
            }
            maxLength={
              2000
            }
          />

          <FieldError
            message={
              state.errors
                ?.summary
            }
          />
        </label>

        {/* =========================
            WORK CATEGORIES
        ========================= */}

        <section
          className={`${styles.categorySection} ${styles.fullWidth}`}
        >
          <div
            className={
              styles.categoryIntroduction
            }
          >
            <div>
              <span
                className={
                  styles.categoryEyebrow
                }
              >
                ARCHIVE CLASSIFICATION
              </span>

              <h2>
                Work
                <br />

                categories
                <strong>
                  .
                </strong>
              </h2>
            </div>

            <p>
              Pilih kategori besar
              yang dipakai untuk
              filter dan struktur
              Work Archive. Satu
              project boleh berada
              di beberapa kategori.
            </p>
          </div>

          {workCategories.length >
          0 ? (
            <div
              className={
                styles.categoryGrid
              }
            >
              {workCategories.map(
                (
                  category,
                  index,
                ) => (
                  <label
                    className={
                      styles.categoryOption
                    }
                    key={
                      category.id
                    }
                  >
                    <input
                      type="checkbox"
                      name="work_category_ids"
                      value={
                        category.id
                      }
                    />

                    <span
                      className={
                        styles.categoryNumber
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

                    <span
                      className={
                        styles.categoryIdentity
                      }
                    >
                      <strong>
                        {
                          category.name
                        }
                      </strong>

                      <small>
                        /
                        {
                          category.slug
                        }
                      </small>
                    </span>

                    {!category.isVisible ? (
                      <span
                        className={
                          styles.categoryHidden
                        }
                      >
                        Hidden
                      </span>
                    ) : null}

                    <span
                      className={
                        styles.categoryCheck
                      }
                      aria-hidden="true"
                    />
                  </label>
                ),
              )}
            </div>
          ) : (
            <div
              className={
                styles.categoryEmpty
              }
            >
              Belum ada Work
              Category. Buat dulu
              dari Category Manager.
            </div>
          )}

          <small
            className={
              styles.categoryHelper
            }
          >
            Work Categories berbeda
            dari Disciplines.
            Category digunakan untuk
            pengelompokan besar,
            sedangkan Disciplines
            menjelaskan detail
            pekerjaan pada project.
          </small>
        </section>

        {/* =========================
            DISCIPLINES
        ========================= */}

        <label
          className={
            styles.field
          }
        >
          <span>
            Disciplines
          </span>

          <input
            className={
              styles.input
            }
            name="categories"
            type="text"
            placeholder="Product Design, Web Development, Creative Direction"
          />

          <small
            className={
              styles.helper
            }
          >
            Ditampilkan sebagai
            detail discipline di
            bawah nama project.
            Pisahkan dengan koma.
          </small>
        </label>

        {/* =========================
            ROLES
        ========================= */}

        <label
          className={
            styles.field
          }
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

        {/* =========================
            TECH STACK
        ========================= */}

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
            placeholder="Next.js, TypeScript, PostgreSQL, FastAPI"
          />

          <small
            className={
              styles.helper
            }
          >
            Teknologi utama project.
            Pisahkan dengan koma.
          </small>
        </label>

        {/* =========================
            LIVE URL
        ========================= */}

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
            placeholder="https://example.com"
          />

          <FieldError
            message={
              state.errors
                ?.live_url
            }
          />
        </label>

        {/* =========================
            SOURCE REPOSITORY
        ========================= */}

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
            placeholder="https://github.com/owner/repository"
          />

          <small
            className={
              styles.helper
            }
          >
            Opsional. Isi jika source
            repository project dapat
            dibagikan.
          </small>

          <FieldError
            message={
              state.errors
                ?.repository_url
            }
          />
        </label>

        {/* =========================
            PALETTE
        ========================= */}

        <div
          className={`${styles.paletteSection} ${styles.fullWidth}`}
        >
          <div>
            <span
              className={
                styles.paletteTitle
              }
            >
              Project palette
            </span>

            <p>
              Warna ini nantinya
              dipakai sebagai
              identitas visual pada
              halaman project.
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
                      event
                        .target
                        .value,
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
                  state.errors
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
                placeholder="#F4EFE6"
                maxLength={
                  7
                }
              />

              <FieldError
                message={
                  state.errors
                    ?.secondary_color
                }
              />
            </label>
          </div>
        </div>
      </div>

      {/* =========================
          ERROR NOTICE
      ========================= */}

      {state.message ? (
        <div
          className={
            styles.formNotice
          }
          role="alert"
        >
          <span />

          <p>
            {
              state.message
            }
          </p>
        </div>
      ) : null}

      {/* =========================
          ACTIONS
      ========================= */}

      <div
        className={
          styles.actions
        }
      >
        <p>
          Project akan disimpan
          sebagai{" "}
          <strong>
            draft
          </strong>{" "}
          dan belum muncul di
          website publik.
        </p>

        <button
          className={
            styles.submitButton
          }
          type="submit"
          disabled={
            isPending
          }
        >
          {isPending
            ? "Creating project..."
            : "Create draft ↗"}
        </button>
      </div>
    </form>
  );
}