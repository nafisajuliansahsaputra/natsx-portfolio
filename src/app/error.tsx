"use client";

import PublicRouteError from "@/components/system/PublicRouteError";

export default function ErrorPage({
  reset,
}: {
  error: Error & {
    digest?: string;
  };

  reset:
    () => void;
}) {
  return (
    <PublicRouteError
      reset={
        reset
      }
    />
  );
}