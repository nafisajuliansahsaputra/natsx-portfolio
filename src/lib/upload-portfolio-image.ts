"use client";

import {
  isTrustedCloudinaryUrl,
} from "@/lib/cloudinary-media";

type CloudinarySignature = {
  cloudName: string;
  apiKey: string;
  publicId: string;
  timestamp: number;
  signature: string;
};

type CloudinaryUploadResult = {
  secure_url?: string;
  public_id?: string;
  resource_type?: string;
  error?: {
    message?: string;
  };
};

/*
 * Images upload browser -> Cloudinary. They never pass through Supabase
 * Storage or the Vercel server. Only the returned CDN URL is saved in CMS JSON.
 */
export async function uploadPortfolioImage(
  file: File,
  path: string,
): Promise<string> {
  const signedResponse = await fetch(
    "/api/admin/media/cloudinary-sign",
    {
      method: "POST",
      cache: "no-store",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path,
        mimeType: file.type,
        size: file.size,
      }),
    },
  );

  const signed = await signedResponse.json() as
    CloudinarySignature & { error?: string };

  if (!signedResponse.ok) {
    throw new Error(signed.error || "Gagal meminta izin upload Cloudinary.");
  }

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", signed.apiKey);
  form.append("timestamp", String(signed.timestamp));
  form.append("public_id", signed.publicId);
  form.append("signature", signed.signature);

  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(signed.cloudName)}/image/upload`,
    {
      method: "POST",
      body: form,
    },
  );

  const result =
    await uploadResponse.json() as CloudinaryUploadResult;

  if (!uploadResponse.ok) {
    throw new Error(
      result.error?.message || "Upload Cloudinary gagal.",
    );
  }

  if (
    result.resource_type !== "image" ||
    result.public_id !== signed.publicId ||
    typeof result.secure_url !== "string" ||
    !isTrustedCloudinaryUrl(result.secure_url, path)
  ) {
    throw new Error(
      "Cloudinary mengembalikan URL tidak sesuai upload yang diminta.",
    );
  }

  return result.secure_url;
}
