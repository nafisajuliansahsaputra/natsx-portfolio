"use client";

import type {
  ComponentProps,
} from "react";

import Link from "next/link";

import {
  usePathname,
} from "next/navigation";

import {
  getLocaleFromPathname,
  localizePath,
} from "@/i18n/config";

type LocaleLinkProps =
  Omit<
    ComponentProps<
      typeof Link
    >,
    "href"
  > & {
    href: string;
  };

export default function LocaleLink({
  href,
  ...props
}: LocaleLinkProps) {
  const pathname =
    usePathname();

  const locale =
    getLocaleFromPathname(
      pathname,
    );

  return (
    <Link
      {...props}
      href={
        localizePath(
          href,
          locale,
        )
      }
    />
  );
}