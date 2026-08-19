export type CvVersion = {
  id: string;
  number: string;
  language: string;
  shortLabel: string;
  file: string;
  downloadName: string;
};

export const cvVersions: CvVersion[] = [
  {
    id: "id",
    number: "01",
    language: "Bahasa Indonesia",
    shortLabel: "CV / ID",
    file:
      "/cv/nafisa-juliansah-saputra-cv-id.pdf",
    downloadName:
      "Nafisa-Juliansah-Saputra-CV-Indonesia.pdf",
  },
  {
    id: "en",
    number: "02",
    language: "English",
    shortLabel: "CV / EN",
    file:
      "/cv/nafisa-juliansah-saputra-cv-en.pdf",
    downloadName:
      "Nafisa-Juliansah-Saputra-CV-English.pdf",
  },
  {
    id: "de",
    number: "03",
    language: "Deutsch",
    shortLabel: "CV / DE",
    file:
      "/cv/nafisa-juliansah-saputra-cv-de.pdf",
    downloadName:
      "Nafisa-Juliansah-Saputra-CV-Deutsch.pdf",
  },
];

export function getCvVersion(
  id?: string,
) {
  return (
    cvVersions.find(
      (version) =>
        version.id === id,
    ) ?? cvVersions[0]
  );
}