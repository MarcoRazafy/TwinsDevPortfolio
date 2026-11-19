import type { Metadata } from "next";

/* Page privée : elle ne reprend ni la description, ni le lien canonique, ni l'aperçu de partage de l'accueil. */
export const metadata: Metadata = {
  title: "Administration — TwinsDev",
  description: "Espace d'administration réservé à l'équipe TwinsDev.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
  openGraph: null,
  twitter: null,
};

/** Espace d'administration : fond sombre uni, hors du décor du site public. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh w-full bg-[#05070c] text-white">{children}</div>;
}
