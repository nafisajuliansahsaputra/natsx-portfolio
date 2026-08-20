"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import {
  deleteProject,
  updateProject,
  type UpdateProjectState,
} from "./actions";
import styles from "./project-editor.module.css";

export type EditableProject = {
  id: string;
  slug: string;
  title: string;
  project_number: string;
  year: number;
  period: string | null;
  summary: string;
  categories: string[];
  roles: string[];
  status: string;
  featured: boolean;
  sort_order: number;
  live_url: string | null;
  accent_color: string;
  secondary_color: string | null;
  published_at: string | null;
};

type ProjectEditorFormProps = {
  project: EditableProject;
};

const initialState: UpdateProjectState = {
  status: "idle",
  message: "",
};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <span className={styles.errorText}>{message}</span>;
}

function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className={styles.deleteButton}
      type="submit"
      disabled={pending}
    >
      {pending ? "Deleting project..." : "Delete project"}
    </button>
  );
}

export default function ProjectEditorForm({
  project,
}: ProjectEditorFormProps) {
  const router = useRouter();

  const updateAction = updateProject.bind(null, project.id);
  const deleteAction = deleteProject.bind(null, project.id);

  const [state, formAction, isPending] = useActionState(
    updateAction,
    initialState,
  );

  const [accentColor, setAccentColor] = useState(
    project.accent_color || "#5961ED",
  );

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [router, state.status]);

  return (
    <div className={styles.editor}>
      <form className={styles.form} action={formAction}>
        <div className={styles.fieldGrid}>
          <label className={`${styles.field} ${styles.fullWidth}`}>
            <span>Project title *</span>

            <input
              className={styles.input}
              name="title"
              type="text"
              defaultValue={project.title}
              maxLength={140}
              required
            />

            <FieldError message={state.errors?.title} />
          </label>

          <label className={styles.field}>
            <span>Project slug *</span>

<input
  className={
    styles.input
  }
  name="slug"
  type="text"
  defaultValue={
    project.slug
  }
  maxLength={100}
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

            <FieldError message={state.errors?.slug} />
          </label>

          <label className={styles.field}>
            <span>Project number *</span>

            <input
              className={styles.input}
              name="project_number"
              type="text"
              defaultValue={project.project_number}
              maxLength={10}
              required
            />

            <FieldError message={state.errors?.project_number} />
          </label>

          <label className={styles.field}>
            <span>Year *</span>

            <input
              className={styles.input}
              name="year"
              type="number"
              defaultValue={project.year}
              min={1900}
              max={2100}
              required
            />

            <FieldError message={state.errors?.year} />
          </label>

          <label className={styles.field}>
            <span>Period</span>

            <input
              className={styles.input}
              name="period"
              type="text"
              defaultValue={project.period ?? ""}
              placeholder="Jan—Mar 2026"
              maxLength={80}
            />
          </label>

          <label className={`${styles.field} ${styles.fullWidth}`}>
            <span>Project summary</span>

            <textarea
              className={styles.textarea}
              name="summary"
              defaultValue={project.summary}
              rows={6}
              maxLength={2000}
            />

            <FieldError message={state.errors?.summary} />
          </label>

          <label className={styles.field}>
            <span>Categories</span>

            <input
              className={styles.input}
              name="categories"
              type="text"
              defaultValue={project.categories.join(", ")}
              placeholder="Web Design, Development, Branding"
            />

            <small className={styles.helper}>
              Pisahkan setiap kategori dengan koma.
            </small>
          </label>

          <label className={styles.field}>
            <span>Roles</span>

            <input
              className={styles.input}
              name="roles"
              type="text"
              defaultValue={project.roles.join(", ")}
              placeholder="UI/UX Designer, Developer"
            />

            <small className={styles.helper}>
              Pisahkan setiap role dengan koma.
            </small>
          </label>

          <label className={`${styles.field} ${styles.fullWidth}`}>
            <span>Live project URL</span>

            <input
              className={styles.input}
              name="live_url"
              type="url"
              defaultValue={project.live_url ?? ""}
              placeholder="https://example.com"
            />

            <FieldError message={state.errors?.live_url} />
          </label>

          <section className={`${styles.settingsPanel} ${styles.fullWidth}`}>
            <div className={styles.settingIntroduction}>
              <span>Publication settings</span>

              <p>
                Atur visibilitas, status publikasi, dan urutan project pada
                website.
              </p>
            </div>

            <div className={styles.settingsGrid}>
              <label className={styles.field}>
                <span>Status</span>

                <select
                  className={styles.input}
                  name="status"
                  defaultValue={project.status}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>

                <FieldError message={state.errors?.status} />
              </label>

              <label className={styles.field}>
                <span>Sort order</span>

                <input
                  className={styles.input}
                  name="sort_order"
                  type="number"
                  defaultValue={project.sort_order}
                  min={0}
                  required
                />

                <FieldError message={state.errors?.sort_order} />
              </label>

              <label className={styles.checkboxCard}>
                <input
                  name="featured"
                  type="checkbox"
                  defaultChecked={project.featured}
                />

                <span className={styles.customCheckbox} />

                <span>
                  <strong>Featured project</strong>
                  <small>Tampilkan sebagai project utama.</small>
                </span>
              </label>
            </div>
          </section>

          <section className={`${styles.palettePanel} ${styles.fullWidth}`}>
            <div className={styles.settingIntroduction}>
              <span>Project palette</span>

              <p>
                Warna ini digunakan sebagai identitas visual pada halaman
                detail project.
              </p>
            </div>

            <div className={styles.paletteGrid}>
              <label className={styles.field}>
                <span>Accent color</span>

                <div className={styles.colorControl}>
                  <input
                    className={styles.colorInput}
                    name="accent_color"
                    type="color"
                    value={accentColor}
                    onChange={(event) => setAccentColor(event.target.value)}
                  />

                  <span>{accentColor.toUpperCase()}</span>
                </div>

                <FieldError message={state.errors?.accent_color} />
              </label>

              <label className={styles.field}>
                <span>Secondary color</span>

                <input
                  className={styles.input}
                  name="secondary_color"
                  type="text"
                  defaultValue={project.secondary_color ?? ""}
                  placeholder="#F4EFE6"
                  maxLength={7}
                />

                <FieldError message={state.errors?.secondary_color} />
              </label>
            </div>
          </section>
        </div>

        {state.message ? (
          <div
            className={styles.formNotice}
            data-type={state.status}
            role="status"
            aria-live="polite"
          >
            <span />
            <p>{state.message}</p>
          </div>
        ) : null}

        <div className={styles.actions}>
          <p>
            Perubahan hanya diterapkan setelah tombol Save Changes ditekan.
          </p>

          <button
            className={styles.saveButton}
            type="submit"
            disabled={isPending}
          >
            {isPending ? "Saving changes..." : "Save changes ↗"}
          </button>
        </div>
      </form>

      <section className={styles.dangerZone}>
        <div>
          <span>DANGER ZONE</span>
          <h2>Delete this project.</h2>

          <p>
            Project dan seluruh section di dalamnya akan dihapus secara
            permanen.
          </p>
        </div>

        <form
          action={deleteAction}
          onSubmit={(event) => {
            const confirmed = window.confirm(
              `Hapus project "${project.title}" secara permanen?`,
            );

            if (!confirmed) {
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