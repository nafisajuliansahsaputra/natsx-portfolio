import Home from "@/app/page";

export const revalidate =
  3600;

export default function LocalizedHomePage() {
  return <Home />;
}