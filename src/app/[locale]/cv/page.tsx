import CVPage from "@/app/cv/page";

type LocalizedCVPageProps = {
  searchParams: Promise<{
    lang?:
      | string
      | string[];
  }>;
};

export default function LocalizedCVPage({
  searchParams,
}: LocalizedCVPageProps) {
  return (
    <CVPage
      searchParams={
        searchParams
      }
    />
  );
}