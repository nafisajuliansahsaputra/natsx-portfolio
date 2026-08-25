export type CvVersionId =
  | "id"
  | "en"
  | "de";

export type CvVersion = {
  id: CvVersionId;

  number: string;

  language: string;

  shortLabel: string;

  file: string;

  downloadName: string;
};

const DEFAULT_CV_VERSION_ID:
  CvVersionId =
    "en";

export const cvVersions:
  CvVersion[] = [
    {
      id:
        "id",

      number:
        "01",

      language:
        "Bahasa Indonesia",

      shortLabel:
        "CV / ID",

      file:
        "/cv/nafisa-juliansah-saputra-cv-id.pdf",

      downloadName:
        "Nafisa-Juliansah-Saputra-CV-Indonesia.pdf",
    },

    {
      id:
        "en",

      number:
        "02",

      language:
        "English",

      shortLabel:
        "CV / EN",

      file:
        "/cv/nafisa-juliansah-saputra-cv-en.pdf",

      downloadName:
        "Nafisa-Juliansah-Saputra-CV-English.pdf",
    },

    {
      id:
        "de",

      number:
        "03",

      language:
        "Deutsch",

      shortLabel:
        "CV / DE",

      file:
        "/cv/nafisa-juliansah-saputra-cv-de.pdf",

      downloadName:
        "Nafisa-Juliansah-Saputra-CV-Deutsch.pdf",
    },
  ];

function getDefaultCvVersion() {
  const version =
    cvVersions.find(
      (
        candidate,
      ) =>
        candidate.id ===
        DEFAULT_CV_VERSION_ID,
    );

  if (!version) {
    throw new Error(
      "Default CV version is missing.",
    );
  }

  return version;
}

export function getCvVersion(
  id?: string,
  fallbackId:
    CvVersionId =
      DEFAULT_CV_VERSION_ID,
) {
  const requestedVersion =
    cvVersions.find(
      (
        version,
      ) =>
        version.id ===
        id,
    );

  if (requestedVersion) {
    return requestedVersion;
  }

  const fallbackVersion =
    cvVersions.find(
      (
        version,
      ) =>
        version.id ===
        fallbackId,
    );

  return (
    fallbackVersion ??
    getDefaultCvVersion()
  );
}