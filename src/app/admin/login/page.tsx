import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import LoginForm from "@/components/admin/LoginForm";
import { getAdmin } from "@/lib/admin/auth";

/** /admin/login — connexion hors du téléphone (accès direct, ou session expirée). */
export default function AdminLoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[radial-gradient(80%_60%_at_50%_0%,#0f2a1d_0%,#05070c_65%)] px-4 py-16">
      <div className="w-full max-w-[380px]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 shadow-[0_40px_100px_-40px_rgba(34,197,94,0.35)]">
          <div className="mb-6 flex flex-col items-center text-center">
            <Image src="/brand/twinsdev-mark-v2.webp" alt="" width={480} height={244} className="mb-4 h-auto w-11" />
            <h1 className="font-[family-name:var(--font-display)] text-[1.5rem] font-semibold tracking-[-0.015em]">
              Espace admin
            </h1>
            <p className="mt-1 text-[13px] text-white/55">Réservé à l&apos;équipe TwinsDev</p>
          </div>
          <Suspense fallback={null}>
            <AlreadyConnected />
          </Suspense>
          <LoginForm autoFocus />
        </div>
        <Link
          href="/"
          className="mx-auto mt-6 flex w-fit items-center gap-1.5 rounded-lg px-2 py-1 text-[13px] text-white/55 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft size={15} aria-hidden />
          Retour au site
        </Link>
      </div>
    </main>
  );
}

/** Déjà connecté : direction le tableau de bord. */
async function AlreadyConnected() {
  if (await getAdmin()) redirect("/admin");
  return null;
}
