"use client";

import { useActionState, useState } from "react";
import {
  createProject,
  type CreateProjectState,
} from "./actions";
import styles from "./new-project.module.css";

type NewProjectFormProps = {
  currentYear: number;
};

const initialState: CreateProjectState = {
  message: "",
};

function createSlug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <span className={styles.errorText}>{message}</span>;
}

export default function NewProjectForm({
  currentYear,
}: NewProjectFormProps) {
  const [state, formAction, isPending] = useActionState(
    createProject,
    initialState,
  );

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManual, setIsSlugManual] = useState(false);

  function handleTitleChange(value: string) {
    setTitle(value);

    if (!isSlugManual) {
      setSlug(createSlug(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlug(createSlug(value));
    setIsSlugManual(value.length > 0);
  }

  return (
    <form className={styles.form} action={formAction}>
      <div className={styles.fieldGrid}>
        <label className={`${styles.field} ${styles.fullWidth}`}>
          <span>Project title *</span>

          <input
            className={styles.input}
            name="title"
            type="text"
            value={title}
            onChange={(event) => handleTitleChange(event.target.value)}
            placeholder="Spall Spill"
            maxLength={140}
            required
          />

          <FieldError message={state.errors?.title} />
        </label>

        <label className={styles.field}>
          <span>Project slug *</span>

          <input
            className={styles.input}
            name="slug"
            type="text"
            value={slug}
            onChange={(event) => handleSlugChange(event.target.value)}
            placeholder="spall-spill"
            maxLength={100}
            required
          />

          <small className={styles.helper}>
            URL project: /project/{slug || "project-slug"}
          </small>

          <FieldError message={state.errors?.slug} />
        </label>

        <label className={styles.field}>
          <span>Project number *</span>

          <input
            className={styles.input}
            name="project_number"
            type="text"
            defaultValue="01"
            placeholder="01"
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
            defaultValue={currentYear}
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
            placeholder="Jan—Mar 2026"
            maxLength={80}
          />
        </label>

        <label className={`${styles.field} ${styles.fullWidth}`}>
          <span>Project summary</span>

          <textarea
            className={styles.textarea}
            name="summary"
            placeholder="Jelaskan project, masalah yang diselesaikan, dan hasil akhirnya."
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
            placeholder="https://example.com"
          />

          <FieldError message={state.errors?.live_url} />
        </label>

        <div className={`${styles.paletteSection} ${styles.fullWidth}`}>
          <div>
            <span className={styles.paletteTitle}>Project palette</span>

            <p>
              Warna ini nantinya dipakai sebagai identitas visual pada halaman
              project.
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
                  defaultValue="#5961ED"
                />

                <span>#5961ED</span>
              </div>

              <FieldError message={state.errors?.accent_color} />
            </label>

            <label className={styles.field}>
              <span>Secondary color</span>

              <input
                className={styles.input}
                name="secondary_color"
                type="text"
                placeholder="#F4EFE6"
                maxLength={7}
              />

              <FieldError message={state.errors?.secondary_color} />
            </label>
          </div>
        </div>
      </div>

      {state.message ? (
        <div className={styles.formNotice} role="alert">
          <span />
          <p>{state.message}</p>
        </div>
      ) : null}

      <div className={styles.actions}>
        <p>
          Project akan disimpan sebagai <strong>draft</strong> dan belum muncul
          di website publik.
        </p>

        <button className={styles.submitButton} type="submit" disabled={isPending}>
          {isPending ? "Creating project..." : "Create draft ↗"}
        </button>
      </div>
    </form>
  );
}