import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administration — TwinsDev",
  robots: { index: false, follow: false },
};

/** Espace d'administration : fond sombre uni, hors du décor du site public. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh w-full bg-[#05070c] text-white">{children}</div>;
}
