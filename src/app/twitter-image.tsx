import {
  ImageResponse,
} from "next/og";

import NatsxSocialCard from "@/components/seo/NatsxSocialCard";

export const alt =
  "NATSX — Digital Creator";

export const size = {
  width:
    1200,

  height:
    630,
};

export const contentType =
  "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    <NatsxSocialCard />,
    {
      ...size,
    },
  );
}