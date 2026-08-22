export const locales = [
  "en",
  "id",
  "de",
] as const;

export type Locale =
  (typeof locales)[number];

export const defaultLocale: Locale =
  "en";

export const localizedLocales = [
  "id",
  "de",
] as const;

export type LocalizedLocale =
  (typeof localizedLocales)[number];

export const localeLabels: Record<
  Locale,
  {
    short: string;
    label: string;
  }
> = {
  en: {
    short: "EN",
    label: "English",
  },

  id: {
    short: "ID",
    label: "Indonesia",
  },

  de: {
    short: "DE",
    label: "Deutsch",
  },
};

export function isLocale(
  value:
    | string
    | null
    | undefined,
): value is Locale {
  return locales.includes(
    value as Locale,
  );
}

export function isLocalizedLocale(
  value:
    | string
    | null
    | undefined,
): value is LocalizedLocale {
  return localizedLocales.includes(
    value as LocalizedLocale,
  );
}

export function getLocaleFromPathname(
  pathname: string,
): Locale {
  const segment =
    pathname
      .split("/")
      .filter(Boolean)[0];

  if (
    segment &&
    isLocalizedLocale(segment)
  ) {
    return segment;
  }

  return defaultLocale;
}

export function stripLocaleFromPathname(
  pathname: string,
) {
  const segments =
    pathname
      .split("/")
      .filter(Boolean);

  if (
    segments[0] &&
    isLocalizedLocale(
      segments[0],
    )
  ) {
    segments.shift();
  }

  return segments.length > 0
    ? `/${segments.join("/")}`
    : "/";
}

export function localizePath(
  pathname: string,
  locale: Locale,
) {
  const cleanPath =
    stripLocaleFromPathname(
      pathname,
    );

  if (
    locale ===
    defaultLocale
  ) {
    return cleanPath;
  }

  return cleanPath === "/"
    ? `/${locale}`
    : `/${locale}${cleanPath}`;
}