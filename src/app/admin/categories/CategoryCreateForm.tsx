"use client";

import {
  useActionState,
  useEffect,
  useRef,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  createCategory,
  type CategoryActionState,
} from "./actions";

import styles from "./categories.module.css";


const initialState:
  CategoryActionState = {
  status:
    "idle",

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
      60,
    );
}


export default function CategoryCreateForm() {
  const router =
    useRouter();

  const formRef =
    useRef<HTMLFormElement>(
      null,
    );

  const slugRef =
    useRef<HTMLInputElement>(
      null,
    );

  const slugManualRef =
    useRef(
      false,
    );

  const [
    state,
    formAction,
    pending,
  ] =
    useActionState(
      createCategory,
      initialState,
    );


  useEffect(() => {
    if (
      state.status !==
      "success"
    ) {
      return;
    }

    formRef.current
      ?.reset();

    slugManualRef.current =
      false;

    router.refresh();
  }, [
    router,
    state.status,
  ]);


  function handleNameChange(
    value:
      string,
  ) {
    if (
      slugManualRef.current
    ) {
      return;
    }

    if (
      slugRef.current
    ) {
      slugRef.current.value =
        createSlug(
          value,
        );
    }
  }


  function handleSlugChange(
    input:
      HTMLInputElement,
  ) {
    const normalized =
      createSlug(
        input.value,
      );

    input.value =
      normalized;

    slugManualRef.current =
      normalized.length >
      0;
  }


  return (
    <form
      ref={
        formRef
      }
      className={
        styles.createForm
      }
      action={
        formAction
      }
    >
      <div
        className={
          styles.createIntro
        }
      >
        <span>
          NEW CATEGORY
        </span>

        <p>
          Tambahkan discipline
          utama baru ke archive
          portfolio.
        </p>
      </div>

      <label
        className={
          styles.field
        }
      >
        <span>
          Name
        </span>

        <input
          name="name"
          type="text"
          onChange={(
            event,
          ) =>
            handleNameChange(
              event
                .currentTarget
                .value,
            )
          }
          maxLength={
            60
          }
          placeholder="Photography"
          autoComplete="off"
          required
        />
      </label>

      <label
        className={
          styles.field
        }
      >
        <span>
          Slug
        </span>

        <input
          ref={
            slugRef
          }
          name="slug"
          type="text"
          onChange={(
            event,
          ) =>
            handleSlugChange(
              event.currentTarget,
            )
          }
          maxLength={
            60
          }
          placeholder="photography"
          autoComplete="off"
          required
        />
      </label>

      <button
        type="submit"
        className={
          styles.createButton
        }
        disabled={
          pending
        }
      >
        {pending
          ? "Creating..."
          : "Add category ↗"}
      </button>

      {state.message ? (
        <p
          className={
            styles.notice
          }
          data-status={
            state.status
          }
          role="status"
          aria-live="polite"
        >
          {
            state.message
          }
        </p>
      ) : null}
    </form>
  );
}