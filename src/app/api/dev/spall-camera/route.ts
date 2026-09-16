import { promises as fs } from "node:fs";
import path from "node:path";

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Vector3 = [number, number, number];

type CameraPreset = {
  position: Vector3;
  target: Vector3;
  fov: number;
};

function isVector3(value: unknown): value is Vector3 {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every(
      (item) =>
        typeof item === "number" &&
        Number.isFinite(item),
    )
  );
}

function isCameraPreset(
  value: unknown,
): value is CameraPreset {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false;
  }

  const preset =
    value as Partial<CameraPreset>;

  return (
    isVector3(preset.position) &&
    isVector3(preset.target) &&
    typeof preset.fov === "number" &&
    Number.isFinite(preset.fov) &&
    preset.fov > 0 &&
    preset.fov < 180
  );
}

export async function POST(
  request: Request,
) {
  if (
    process.env.NODE_ENV !==
    "development"
  ) {
    return NextResponse.json(
      {
        error:
          "Camera calibration is only available in development.",
      },
      {
        status: 404,
      },
    );
  }

  try {
    const body =
      (await request.json()) as unknown;

    if (!isCameraPreset(body)) {
      return NextResponse.json(
        {
          error:
            "Invalid camera preset.",
        },
        {
          status: 400,
        },
      );
    }

    const filePath =
      path.join(
        process.cwd(),
        "public",
        "spall-camera-preset.json",
      );

    await fs.writeFile(
      filePath,
      `${JSON.stringify(
        body,
        null,
        2,
      )}\n`,
      "utf8",
    );

    return NextResponse.json({
      ok: true,
      preset: body,
    });
  } catch (error) {
    console.error(
      "Failed to save Spall camera preset:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to save camera preset.",
      },
      {
        status: 500,
      },
    );
  }
}