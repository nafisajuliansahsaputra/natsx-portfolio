"use client";

import {
  useEffect,
} from "react";

import {
  usePathname,
} from "next/navigation";

import {
  getLocaleFromPathname,
} from "@/i18n/config";


export default function DocumentLocaleController() {
  const pathname =
    usePathname();


  useEffect(
    () => {
      const locale =
        getLocaleFromPathname(
          pathname,
        );

      const root =
        document.documentElement;

      root.lang =
        locale;

      root.dataset.locale =
        locale;
    },
    [
      pathname,
    ],
  );


  return null;
}