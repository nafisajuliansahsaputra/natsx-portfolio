import {
  createHash,
} from "node:crypto";

import {
  NextResponse,
} from "next/server";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  CLOUDINARY_PREFIX,
} from "@/lib/cloudinary-media";

import {
  getPortfolioImageServerLimit,
  isAllowedImageMimeType,
} from "@/lib/portfolio-media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID =
  "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";

const IMAGE_PATH = new RegExp(
  `^projects/(${UUID})/(?:covers/(?:hero|card)/|sections/(${UUID})/(?:gallery/|finale/)?)(${UUID})\\.(jpg|jpeg|png|webp|avif|gif)$`,
  "i",
);

const EXT_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
};

function noStore(
  body: object,
  status: number,
) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(
  request: Request,
) {
  const cloudName =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();

  const apiKey =
    process.env.CLOUDINARY_API_KEY?.trim();

  const apiSecret =
    process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    return noStore({
      error: "Cloudinary belum dikonfigurasi di server.",
    }, 503);
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } =
    await supabase.auth.getUser();

  if (authError || !user) {
    return noStore({ error: "Login admin diperlukan." }, 401);
  }

  const { data: adminUser, error: adminError } =
    await supabase.from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

  if (adminError || !adminUser) {
    return noStore({ error: "Akses admin ditolak." }, 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return noStore({ error: "Request JSON tidak valid." }, 400);
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return noStore({ error: "Data upload tidak valid." }, 400);
  }

  const input = body as Record<string, unknown>;
  const path = input.path;
  const mimeType = input.mimeType;
  const size = input.size;

  if (
    typeof path !== "string" ||
    typeof mimeType !== "string" ||
    !isAllowedImageMimeType(mimeType) ||
    typeof size !== "number" ||
    !Number.isSafeInteger(size) ||
    size <= 0 ||
    size > getPortfolioImageServerLimit(mimeType)
  ) {
    return noStore({ error: "Path, jenis, atau ukuran image tidak valid." }, 400);
  }

  const match = IMAGE_PATH.exec(path);
  if (!match || EXT_MIME[match[4].toLowerCase()] !== mimeType) {
    return noStore({ error: "Path upload tidak sesuai format portfolio." }, 400);
  }

  const projectId = match[1];
  const sectionId = match[2];

  const { data: project, error: projectError } =
    await supabase.from("projects")
      .select("id").eq("id", projectId).maybeSingle();

  if (projectError || !project) {
    return noStore({ error: "Project tidak ditemukan." }, 404);
  }

  if (sectionId) {
    const { data: section, error: sectionError } =
      await supabase.from("project_sections")
        .select("id")
        .eq("id", sectionId)
        .eq("project_id", projectId)
        .maybeSingle();

    if (sectionError || !section) {
      return noStore({ error: "Section tidak ditemukan." }, 404);
    }
  }

  const publicId =
    `${CLOUDINARY_PREFIX}/${path.replace(/\.[^.\/]+$/, "")}`;
  const timestamp = Math.floor(Date.now() / 1000);
  // Cloudinary signs the alphabetically sorted request parameters plus secret.
  const signature = createHash("sha1")
    .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  return noStore({
    cloudName,
    apiKey,
    publicId,
    timestamp,
    signature,
  }, 200);
}
