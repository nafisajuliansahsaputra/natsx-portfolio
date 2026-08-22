"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { useRouter } from "next/navigation";

import type { Locale } from "@/i18n/config";
import {
  IMAGE_MEDIA_MIME_TYPES,
  MAX_PORTFOLIO_MEDIA_FILE_SIZE,
  PORTFOLIO_MEDIA_BUCKET,
  getGallerySectionMedia,
  isAllowedImageMimeType,
  type GallerySectionItem,
  type PortfolioImageMimeType,
  type PortfolioMediaAsset,
} from "@/lib/portfolio-media";
import { createClient } from "@/lib/supabase/client";

import {
  saveGallerySectionMedia,
  type SectionActionState,
} from "./actions";
import {
  saveGallerySectionLocalizedCopy,
  type GalleryLocalizedCopyInput,
  type SpecializedTranslationState,
} from "./specialized-translation-actions";
import styles from "./sections.module.css";

type GalleryDraftItem = {
  id: string;
  asset: PortfolioMediaAsset | null;
  baseAlt: string;
  baseCaption: string;
  alt: string;
  caption: string;
  pendingFile: File | null;
  pendingPreviewUrl: string | null;
};

type GalleryCopy = {
  alt: string;
  caption: string;
};

type GallerySectionEditorProps = {
  projectId: string;
  section: {
    id: string;
    content: Record<string, unknown>;
  };
  locale: Locale;
  translationContent: Record<string, unknown>;
};

const initialMediaState: SectionActionState = {
  status: "idle",
  message: "",
};

const initialTranslationState: SpecializedTranslationState = {
  status: "idle",
  message: "",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getLocalizedGalleryCopy(content: Record<string, unknown>) {
  const result = new Map<string, GalleryCopy>();

  if (!isRecord(content.gallery) || !isRecord(content.gallery.copyById)) {
    return result;
  }

  for (const [itemId, value] of Object.entries(content.gallery.copyById)) {
    if (!isRecord(value)) continue;

    result.set(itemId, {
      alt: typeof value.alt === "string" ? value.alt : "",
      caption: typeof value.caption === "string" ? value.caption : "",
    });
  }

  return result;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getImageExtension(mimeType: PortfolioImageMimeType) {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/avif":
      return "avif";
    case "image/gif":
      return "gif";
  }
}

function validateFile(file: File) {
  if (!isAllowedImageMimeType(file.type)) {
    return (
      `Format "${file.name}" tidak didukung. ` +
      "Gunakan JPEG, PNG, WebP, AVIF, atau GIF."
    );
  }

  if (file.size > MAX_PORTFOLIO_MEDIA_FILE_SIZE) {
    return `"${file.name}" melebihi batas 50 MB.`;
  }

  return null;
}

function getSavedStructureKey(
  items: Array<{ id: string; asset: PortfolioMediaAsset }>,
) {
  return items.map((item) => `${item.id}:${item.asset.path}`).join("|");
}

function getDraftStructureKey(items: GalleryDraftItem[]) {
  return items
    .map((item) => {
      if (item.pendingFile) {
        return `${item.id}:pending:${item.pendingFile.name}:${item.pendingFile.size}`;
      }

      return `${item.id}:${item.asset?.path ?? "missing"}`;
    })
    .join("|");
}

export default function GallerySectionEditor({
  projectId,
  section,
  locale,
  translationContent,
}: GallerySectionEditorProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<Set<string>>(new Set());

  const initialGallery = getGallerySectionMedia(section.content);
  const localizedCopy = getLocalizedGalleryCopy(translationContent);

  const [items, setItems] = useState<GalleryDraftItem[]>(() =>
    (initialGallery?.items ?? []).map((item) => {
      const copy = localizedCopy.get(item.id);

      return {
        id: item.id,
        asset: item.asset,
        baseAlt: item.alt,
        baseCaption: item.caption,
        alt: locale === "en" ? item.alt : (copy?.alt ?? ""),
        caption: locale === "en" ? item.caption : (copy?.caption ?? ""),
        pendingFile: null,
        pendingPreviewUrl: null,
      };
    }),
  );

  const [savedStructureKey, setSavedStructureKey] = useState(
    getSavedStructureKey(initialGallery?.items ?? []),
  );
  const [isMediaPending, setIsMediaPending] = useState(false);
  const [isCopyPending, setIsCopyPending] = useState(false);
  const [mediaStatus, setMediaStatus] =
    useState<SectionActionState>(initialMediaState);
  const [copyStatus, setCopyStatus] =
    useState<SpecializedTranslationState>(initialTranslationState);

  const hasSharedDraftChanges =
    getDraftStructureKey(items) !== savedStructureKey;

  useEffect(() => {
    const objectUrls = objectUrlsRef.current;

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
      objectUrls.clear();
    };
  }, []);

  function createPreviewUrl(file: File) {
    const url = URL.createObjectURL(file);
    objectUrlsRef.current.add(url);
    return url;
  }

  function revokePreviewUrl(url: string | null) {
    if (!url) return;
    URL.revokeObjectURL(url);
    objectUrlsRef.current.delete(url);
  }

  function getPublicUrl(asset: PortfolioMediaAsset | null) {
    if (!asset) return null;
    return supabase.storage.from(asset.bucket).getPublicUrl(asset.path).data.publicUrl;
  }

  function handleAddFiles(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (selectedFiles.length === 0) return;

    for (const file of selectedFiles) {
      const error = validateFile(file);
      if (error) {
        setMediaStatus({ status: "error", message: error });
        return;
      }
    }

    const nextItems = selectedFiles.map(
      (file): GalleryDraftItem => ({
        id: globalThis.crypto.randomUUID(),
        asset: null,
        baseAlt: "",
        baseCaption: "",
        alt: "",
        caption: "",
        pendingFile: file,
        pendingPreviewUrl: createPreviewUrl(file),
      }),
    );

    setItems((current) => [...current, ...nextItems]);
    setMediaStatus(initialMediaState);
    setCopyStatus(initialTranslationState);
  }

  function handleReplaceFile(
    itemId: string,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setMediaStatus({ status: "error", message: error });
      return;
    }

    setItems((current) =>
      current.map((item) => {
        if (item.id !== itemId) return item;
        revokePreviewUrl(item.pendingPreviewUrl);

        return {
          ...item,
          pendingFile: file,
          pendingPreviewUrl: createPreviewUrl(file),
        };
      }),
    );

    setMediaStatus(initialMediaState);
  }

  function updateLocalizedItem(
    itemId: string,
    field: "alt" | "caption",
    value: string,
  ) {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item,
      ),
    );
    setCopyStatus(initialTranslationState);
  }

  function removeItem(itemId: string) {
    setItems((current) => {
      const target = current.find((item) => item.id === itemId);
      revokePreviewUrl(target?.pendingPreviewUrl ?? null);
      return current.filter((item) => item.id !== itemId);
    });

    setMediaStatus({
      status: "idle",
      message:
        "Image removed from shared draft. Save shared gallery to apply the change.",
    });
  }

  function moveItem(itemId: string, direction: "up" | "down") {
    setItems((current) => {
      const currentIndex = current.findIndex((item) => item.id === itemId);
      if (currentIndex === -1) return current;

      const destinationIndex =
        direction === "up" ? currentIndex - 1 : currentIndex + 1;

      if (destinationIndex < 0 || destinationIndex >= current.length) {
        return current;
      }

      const next = [...current];
      [next[currentIndex], next[destinationIndex]] = [
        next[destinationIndex],
        next[currentIndex],
      ];
      return next;
    });

    setMediaStatus(initialMediaState);
  }

  async function uploadDraftItem(
    item: GalleryDraftItem,
  ): Promise<GallerySectionItem> {
    if (!item.pendingFile) {
      if (!item.asset) throw new Error("Gallery item tidak memiliki file.");

      return {
        id: item.id,
        asset: item.asset,
        alt: item.baseAlt.trim(),
        caption: item.baseCaption.trim(),
      };
    }

    const file = item.pendingFile;
    const mimeType = file.type;

    if (!isAllowedImageMimeType(mimeType)) {
      throw new Error(`Format "${file.name}" tidak didukung.`);
    }

    if (file.size > MAX_PORTFOLIO_MEDIA_FILE_SIZE) {
      throw new Error(`"${file.name}" melebihi 50 MB.`);
    }

    const extension = getImageExtension(mimeType);
    const storageId = globalThis.crypto.randomUUID();
    const path =
      `projects/${projectId}` +
      `/sections/${section.id}` +
      `/gallery/${storageId}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(PORTFOLIO_MEDIA_BUCKET)
      .upload(path, file, {
        cacheControl: "3600",
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Upload "${file.name}" gagal: ${uploadError.message}`);
    }

    return {
      id: item.id,
      asset: {
        bucket: PORTFOLIO_MEDIA_BUCKET,
        path,
        mimeType,
        size: file.size,
        originalName: file.name,
      },
      alt: item.baseAlt.trim(),
      caption: item.baseCaption.trim(),
    };
  }

  async function handleSaveSharedGallery() {
    setIsMediaPending(true);
    setMediaStatus(initialMediaState);

    try {
      const nextItems: GallerySectionItem[] = [];
      for (const item of items) nextItems.push(await uploadDraftItem(item));

      const result = await saveGallerySectionMedia(projectId, section.id, {
        items: nextItems,
      });

      if (result.status === "error") {
        setMediaStatus(result);
        return;
      }

      const currentCopy = new Map(
        items.map((item) => [
          item.id,
          { alt: item.alt, caption: item.caption },
        ] as const),
      );

      items.forEach((item) => revokePreviewUrl(item.pendingPreviewUrl));

      setItems(
        nextItems.map((item) => {
          const copy = currentCopy.get(item.id);
          return {
            id: item.id,
            asset: item.asset,
            baseAlt: item.alt,
            baseCaption: item.caption,
            alt: locale === "en" ? item.alt : (copy?.alt ?? ""),
            caption:
              locale === "en" ? item.caption : (copy?.caption ?? ""),
            pendingFile: null,
            pendingPreviewUrl: null,
          };
        }),
      );

      setSavedStructureKey(getSavedStructureKey(nextItems));
      setMediaStatus(result);
      router.refresh();
    } catch (error) {
      setMediaStatus({
        status: "error",
        message:
          error instanceof Error ? error.message : "Gallery gagal disimpan.",
      });
    } finally {
      setIsMediaPending(false);
    }
  }

  async function handleSaveLocalizedCopy() {
    if (hasSharedDraftChanges) {
      setCopyStatus({
        status: "error",
        message:
          "Simpan shared gallery terlebih dahulu sebelum menyimpan translation.",
      });
      return;
    }

    if (items.some((item) => !item.asset || item.pendingFile)) {
      setCopyStatus({
        status: "error",
        message:
          "Semua gallery image harus tersimpan sebagai shared media terlebih dahulu.",
      });
      return;
    }

    setIsCopyPending(true);
    setCopyStatus(initialTranslationState);

    const payload: GalleryLocalizedCopyInput[] = items.map((item) => ({
      id: item.id,
      alt: item.alt,
      caption: item.caption,
    }));

    try {
      const result = await saveGallerySectionLocalizedCopy(
        projectId,
        section.id,
        locale,
        payload,
      );

      setCopyStatus(result);

      if (result.status === "success") {
        if (locale === "en") {
          setItems((current) =>
            current.map((item) => ({
              ...item,
              baseAlt: item.alt.trim(),
              baseCaption: item.caption.trim(),
              alt: item.alt.trim(),
              caption: item.caption.trim(),
            })),
          );
        }

        router.refresh();
      }
    } catch {
      setCopyStatus({
        status: "error",
        message:
          "Gagal menyimpan localized gallery copy. Refresh halaman lalu coba lagi.",
      });
    } finally {
      setIsCopyPending(false);
    }
  }

  return (
    <section className={styles.galleryEditor}>
      <div className={styles.galleryEditorHeader}>
        <div>
          <span>SHARED GALLERY MEDIA</span>
          <strong>{String(items.length).padStart(2, "0")} IMAGES</strong>
        </div>

        <p>
          File, urutan, replace, dan remove berlaku ke English, Indonesia, dan
          Deutsch. Alt text serta caption mengikuti bahasa aktif.
        </p>
      </div>

      <label className={styles.galleryUploadControl}>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={IMAGE_MEDIA_MIME_TYPES.join(",")}
          onChange={handleAddFiles}
          disabled={isMediaPending}
        />
        <span>+ Add shared images</span>
        <small>JPEG, PNG, WebP, AVIF, GIF · max 50 MB each</small>
      </label>

      {items.length === 0 ? (
        <div className={styles.galleryEmpty}>
          <span>EMPTY GALLERY</span>
          <p>Add shared images to start building this visual sequence.</p>
        </div>
      ) : (
        <div className={styles.galleryGrid}>
          {items.map((item, index) => {
            const previewUrl =
              item.pendingPreviewUrl ?? getPublicUrl(item.asset);
            const fileName =
              item.pendingFile?.name ?? item.asset?.originalName ?? "Image";
            const fileSize = item.pendingFile?.size ?? item.asset?.size ?? 0;

            return (
              <article className={styles.galleryCard} key={item.id}>
                <div className={styles.galleryCardHeader}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <button
                      type="button"
                      className={styles.galleryOrderButton}
                      onClick={() => moveItem(item.id, "up")}
                      disabled={isMediaPending || index === 0}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className={styles.galleryOrderButton}
                      onClick={() => moveItem(item.id, "down")}
                      disabled={isMediaPending || index === items.length - 1}
                    >
                      ↓
                    </button>
                  </div>
                </div>

                {previewUrl ? (
                  <div
                    className={styles.galleryPreviewImage}
                    role="img"
                    aria-label={
                      locale === "en"
                        ? item.alt.trim() || "Gallery image preview"
                        : item.baseAlt || "Gallery image preview"
                    }
                    style={{
                      backgroundImage: `url(${JSON.stringify(previewUrl)})`,
                    }}
                  >
                    {item.pendingFile ? <span>UNSAVED</span> : null}
                  </div>
                ) : (
                  <div className={styles.galleryPreviewEmpty}>NO PREVIEW</div>
                )}

                <div className={styles.galleryFileMeta}>
                  <span>{fileName}</span>
                  <span>{formatFileSize(fileSize)}</span>
                </div>

                <div className={styles.galleryCardActions}>
                  <label className={styles.galleryReplaceButton}>
                    <input
                      type="file"
                      accept={IMAGE_MEDIA_MIME_TYPES.join(",")}
                      onChange={(event) => handleReplaceFile(item.id, event)}
                      disabled={isMediaPending}
                    />
                    Replace shared image
                  </label>

                  <button
                    className={styles.mediaDangerButton}
                    type="button"
                    onClick={() => removeItem(item.id)}
                    disabled={isMediaPending}
                  >
                    Remove
                  </button>
                </div>

                <div className={styles.galleryItemFields}>
                  {locale !== "en" ? (
                    <p className={styles.sectionLanguageHint}>
                      English reference — Alt: <strong>{item.baseAlt || "—"}</strong>
                      {" · "}Caption:{" "}
                      <strong>{item.baseCaption || "—"}</strong>
                    </p>
                  ) : null}

                  <label className={styles.field}>
                    <span>{locale.toUpperCase()} alt text</span>
                    <input
                      className={styles.input}
                      type="text"
                      value={item.alt}
                      onChange={(event) =>
                        updateLocalizedItem(item.id, "alt", event.target.value)
                      }
                      maxLength={500}
                      placeholder={
                        locale === "en"
                          ? "Describe this image"
                          : "Leave empty to use English"
                      }
                      disabled={isCopyPending}
                    />
                  </label>

                  <label className={styles.field}>
                    <span>{locale.toUpperCase()} caption</span>
                    <textarea
                      className={styles.textarea}
                      value={item.caption}
                      onChange={(event) =>
                        updateLocalizedItem(item.id, "caption", event.target.value)
                      }
                      rows={3}
                      maxLength={1000}
                      placeholder={
                        locale === "en"
                          ? "Optional visual caption"
                          : "Leave empty to use English"
                      }
                      disabled={isCopyPending}
                    />
                  </label>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {mediaStatus.message ? (
        <div
          className={styles.mediaStatus}
          data-type={mediaStatus.status}
          role="status"
          aria-live="polite"
        >
          <span />
          <p>{mediaStatus.message}</p>
        </div>
      ) : null}

      <div className={styles.galleryFooter}>
        <p>
          Add, replace, remove, dan urutan adalah shared. Simpan bagian ini
          sebelum menyimpan localized copy.
        </p>
        <button
          type="button"
          className={styles.mediaPrimaryButton}
          onClick={handleSaveSharedGallery}
          disabled={isMediaPending || !hasSharedDraftChanges}
        >
          {isMediaPending ? "Saving shared gallery..." : "Save shared gallery ↗"}
        </button>
      </div>

      <div className={styles.sharedSectionSettings}>
        <div className={styles.galleryEditorHeader}>
          <div>
            <span>{locale.toUpperCase()} GALLERY COPY</span>
            <strong>{String(items.length).padStart(2, "0")} ITEMS</strong>
          </div>
          <p>
            Alt text dan caption mengikuti tab bahasa aktif. Field kosong pada
            ID/DE akan fallback ke English.
          </p>
        </div>

        {copyStatus.message ? (
          <div
            className={styles.mediaStatus}
            data-type={copyStatus.status}
            role="status"
            aria-live="polite"
          >
            <span />
            <p>{copyStatus.message}</p>
          </div>
        ) : null}

        <div className={styles.galleryFooter}>
          <p>
            {locale === "en"
              ? "English adalah canonical fallback untuk semua gallery copy."
              : "Kosongkan field yang ingin memakai copy English."}
          </p>
          <button
            type="button"
            className={styles.mediaPrimaryButton}
            onClick={handleSaveLocalizedCopy}
            disabled={isCopyPending || hasSharedDraftChanges}
          >
            {isCopyPending
              ? `Saving ${locale.toUpperCase()} copy...`
              : `Save ${locale.toUpperCase()} gallery copy ↗`}
          </button>
        </div>
      </div>
    </section>
  );
}