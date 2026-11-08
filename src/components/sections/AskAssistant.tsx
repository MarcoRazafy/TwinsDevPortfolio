"use client";

import { ArrowUpRight, MessageCircle } from "lucide-react";
import { openAssistant } from "@/components/phone/assistant-bridge";
import { INSET, RAISED, SURFACE } from "./neumorphism";

/** Sous la FAQ : « Une autre question ? » et un bouton qui ouvre l'assistant TwinsDev dans le téléphone. */
export default function AskAssistant() {
  return (
    <div
      className={`mt-10 flex max-w-[820px] flex-col gap-5 rounded-[28px] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 ${SURFACE} ${RAISED}`}
    >
      <div className="flex items-center gap-4">
        <span
          aria-hidden
          className={`relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-accent-strong ${INSET}`}
          style={{ background: "radial-gradient(circle at 30% 25%, rgba(74,222,128,0.2), transparent 65%), #0a0f13" }}
        >
          <MessageCircle size={22} strokeWidth={2} />
          {/* Voyant « en ligne » */}
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(74,222,128,0.9)]" />
        </span>
        <p className="font-[family-name:var(--font-display)] text-[1.15rem] font-semibold">Une autre question ?</p>
      </div>

      <button
        type="button"
        onClick={openAssistant}
        className="group inline-flex h-12 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-accent px-5 text-[14.5px] font-semibold text-[#03140c] shadow-[0_10px_30px_-10px_rgba(34,197,94,0.8),inset_0_1px_0_rgba(255,255,255,0.35)] transition-[background-color,translate,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-accent-strong hover:shadow-[0_14px_34px_-10px_rgba(34,197,94,0.95),inset_0_1px_0_rgba(255,255,255,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1116] active:translate-y-0"
      >
        Discuter avec l&apos;assistant TwinsDev
        <ArrowUpRight size={17} aria-hidden className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </button>
    </div>
  );
}
