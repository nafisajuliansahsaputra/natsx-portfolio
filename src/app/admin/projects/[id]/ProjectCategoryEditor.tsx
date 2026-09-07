"use client";

import {
  useActionState,
  useEffect,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  updateProjectCategories,
  type UpdateProjectCategoriesState,
} from "./category-actions";

import styles from "./ProjectCategoryEditor.module.css";


export type EditableWorkCategory = {
  id:
    string;

  name:
    string;

  slug:
    string;

  sortOrder:
    number;

  isVisible:
    boolean;
};


type ProjectCategoryEditorProps = {
  projectId:
    string;

  categories:
    EditableWorkCategory[];

  selectedCategoryIds:
    string[];
};


const initialState:
  UpdateProjectCategoriesState = {
  status:
    "idle",

  message:
    "",
};


export default function ProjectCategoryEditor({
  projectId,
  categories,
  selectedCategoryIds,
}: ProjectCategoryEditorProps) {
  const router =
    useRouter();

  const action =
    updateProjectCategories.bind(
      null,
      projectId,
    );

  const [
    state,
    formAction,
    pending,
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
      router.refresh();
    }
  }, [
    router,
    state.status,
  ]);

  const selectedSet =
    new Set(
      selectedCategoryIds,
    );

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
          styles.introduction
        }
      >
        <div>
          <span>
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
          untuk mengelompokkan
          project pada Work
          Archive. Satu project
          boleh berada di lebih
          dari satu kategori.
        </p>
      </div>

      {categories.length >
      0 ? (
        <div
          className={
            styles.categoryGrid
          }
        >
          {categories.map(
            (
              category,
              index,
            ) => {
              const selected =
                selectedSet.has(
                  category.id,
                );

              return (
                <label
                  className={
                    styles.category
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
                    defaultChecked={
                      selected
                    }
                  />

                  <span
                    className={
                      styles.categoryIndex
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
                        styles.hiddenBadge
                      }
                    >
                      Hidden
                    </span>
                  ) : null}

                  <span
                    className={
                      styles.check
                    }
                    aria-hidden="true"
                  />
                </label>
              );
            },
          )}
        </div>
      ) : (
        <div
          className={
            styles.empty
          }
        >
          <p>
            Belum ada work
            category.
          </p>

          <span>
            Buat kategori dari
            Category Manager
            terlebih dahulu.
          </span>
        </div>
      )}

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

      <div
        className={
          styles.actions
        }
      >
        <p>
          Ini berbeda dari
          disciplines seperti
          Product Design, UI/UX,
          atau Art Direction.
        </p>

        <button
          type="submit"
          disabled={
            pending ||
            categories.length ===
              0
          }
        >
          {pending
            ? "Saving categories..."
            : "Save categories ↗"}
        </button>
      </div>
    </form>
  );
}