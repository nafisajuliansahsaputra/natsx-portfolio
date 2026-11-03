import type { Locale } from "@/i18n/config";

/** Ground each title in a published project's actual work and technology. */
const titles: Record<string, Record<Locale, string>> = {
  "smart-attendance-system": {
    en: "Smart Attendance System | RFID & Face Verification",
    id: "Smart Attendance System | Absensi RFID & Verifikasi Wajah",
    de: "Smart Attendance System | RFID & Gesichtsprüfung",
  },
  "bast-management-system": {
    en: "BAST | Laravel Document Management System",
    id: "BAST | Sistem Pengelolaan Dokumen Laravel",
    de: "BAST | Dokumentenverwaltung mit Laravel",
  },
  "natsx-controller": {
    en: "NATSX Controller | Android to Windows Gamepad",
    id: "NATSX Controller | Gamepad Android ke Windows",
    de: "NATSX Controller | Android-zu-Windows-Gamepad",
  },
  "spall-spill": {
    en: "Spall Spill | Full-Stack Product Platform",
    id: "Spall Spill | Platform Produk Full-Stack",
    de: "Spall Spill | Full-Stack-Produktplattform",
  },
  "5am-vision": {
    en: "5AM Vision | Brand Identity & Art Direction",
    id: "5AM Vision | Identitas Brand & Art Direction",
    de: "5AM Vision | Markenidentität & Art Direction",
  },
};

export function getProjectSeoTitle(slug: string, title: string, locale: Locale) {
  return titles[slug]?.[locale] || title;
}
