"use client";

import Image from "next/image";
import { ArrowUpRight, Download } from "lucide-react";
import { TWINSCHAT_FICHIERS, TWINSCHAT_URL, usePlateforme } from "@/lib/twinschat";
import { INSET, RAISED, RAISED_SM, SURFACE } from "./neumorphism";

const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1116]";

/**
 * Sous « Une autre question ? » : TwinsChat, notre messagerie. Lien vers l'application web et téléchargement
 * de l'appli du visiteur (Windows ou Android), avec un lien discret vers l'autre système.
 * iPhone, Mac et Linux (« autre ») reçoivent l'appli Android en principal : elle sert depuis le téléphone.
 */
export default function TwinsChatCard() {
  const plateforme = usePlateforme();
  const principal = TWINSCHAT_FICHIERS[plateforme === "windows" ? "windows" : "android"];
  const secondaire = TWINSCHAT_FICHIERS[plateforme === "windows" ? "android" : "windows"];

  return (
    <div
      className={`mt-5 flex max-w-[820px] flex-col gap-5 rounded-[28px] p-5 sm:p-6 md:flex-row md:items-center md:justify-between ${SURFACE} ${RAISED}`}
    >
      <div className="flex items-center gap-4">
        <span
          aria-hidden
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${INSET}`}
          style={{ background: "radial-gradient(circle at 30% 25%, rgba(74,222,128,0.16), transparent 65%), #0a0f13" }}
        >
          <Image src="/brand/twinschat.webp" alt="" width={407} height={330} className="h-auto w-8" />
        </span>
        <div>
          <p className="font-[family-name:var(--font-display)] text-[1.15rem] font-semibold">TwinsChat</p>
          <p className="mt-0.5 text-[13.5px] leading-snug text-white/60">Notre messagerie pour échanger avec nous, sur le web ou en appli.</p>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={TWINSCHAT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`group inline-flex h-12 items-center justify-center gap-2 rounded-full px-5 text-[14.5px] font-semibold text-accent-strong transition-[color,translate] duration-200 hover:-translate-y-0.5 hover:text-white active:translate-y-0 ${SURFACE} ${RAISED_SM} ${FOCUS}`}
          >
            Application web
            <ArrowUpRight size={17} aria-hidden className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            <span className="sr-only">(twinschat.ucan-mih.com, nouvel onglet)</span>
          </a>
          <a
            href={principal.href}
            download={principal.fichier}
            className={`group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-5 text-[14.5px] font-semibold text-[#03140c] shadow-[0_10px_30px_-10px_rgba(34,197,94,0.8),inset_0_1px_0_rgba(255,255,255,0.35)] transition-[background-color,translate,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-accent-strong hover:shadow-[0_14px_34px_-10px_rgba(34,197,94,0.95),inset_0_1px_0_rgba(255,255,255,0.35)] active:translate-y-0 ${FOCUS}`}
          >
            <Download size={17} aria-hidden className="transition-transform duration-200 group-hover:translate-y-0.5" />
            Télécharger pour {principal.systeme}
          </a>
        </div>
        <a
          href={secondaire.href}
          download={secondaire.fichier}
          className="self-center rounded-md px-1 text-[12.5px] text-white/50 underline-offset-4 transition-colors duration-200 hover:text-white/80 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:self-end"
        >
          Aussi disponible pour {secondaire.systeme}
        </a>
      </div>
    </div>
  );
}
