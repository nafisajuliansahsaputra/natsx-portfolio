import type {
  Metadata,
} from "next";

export const dynamic =
  "force-dynamic";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nocache: true,
  },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children:
    React.ReactNode;
}>) {
  return children;
}