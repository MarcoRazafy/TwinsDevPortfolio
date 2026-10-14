"use client";

import { useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, CheckCircle2, LoaderCircle, Mail, MapPin, MessageCircle, SendHorizontal } from "lucide-react";
import { SITE } from "@/lib/site";
import SectionHead from "./SectionHead";

const EXPO_OUT = [0.16, 1, 0.3, 1] as const;
const TYPES = ["Site vitrine", "Boutique en ligne", "Application web ou mobile", "Refonte d'un site existant", "Autre"];

const FIELD =
  "w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-[15px] text-white placeholder:text-white/35 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string };

/** Section « Contact » : coordonnées d'un côté, formulaire de l'autre (envoyé à /api/contact). */
export default function ContactSection() {
  const reduce = useReducedMotion() ?? false;
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const reveal = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-10% 0px" },
    transition: reduce ? { duration: 0.3 } : { duration: 0.8, ease: EXPO_OUT, delay },
  });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Envoi impossible, réessayez dans un instant.");
      form.reset();
      setStatus({ kind: "sent" });
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "Envoi impossible." });
    }
  };

  return (
    <section
      id="contact"
      aria-labelledby="contact-titre"
      className="relative scroll-mt-24 px-4 py-24 sm:px-8 lg:py-32"
    >
      <div className="mx-auto grid w-full max-w-[1180px] gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
        <div className="min-w-0">
          <SectionHead
            path="/contact"
            id="contact-titre"
            title={
              <>
                Parlons de <span className="text-glow">votre projet</span>
              </>
            }
            lede="Décrivez votre besoin en quelques lignes : on vous répond avec des questions précises et, si le projet nous correspond, un devis."
          />
          <motion.dl {...reveal(0.1)} className="flex flex-col border-t border-white/10">
            {SITE.email && (
              <Row label="E-mail" icon={<Mail size={16} aria-hidden />}>
                <a href={`mailto:${SITE.email}`} className="text-accent-strong hover:underline">
                  {SITE.email}
                </a>
              </Row>
            )}
            {SITE.location && (
              <Row label="Où" icon={<MapPin size={16} aria-hidden />}>
                {SITE.location}
              </Row>
            )}
            {SITE.linkedin && (
              <Row label="LinkedIn" icon={<ArrowUpRight size={16} aria-hidden />}>
                <a href={SITE.linkedin} target="_blank" rel="noopener noreferrer" className="text-accent-strong hover:underline">
                  {SITE.linkedin.replace(/^https?:\/\//, "")}
                </a>
              </Row>
            )}
            <Row label="Assistant" icon={<MessageCircle size={16} aria-hidden />}>
              <a href="#accueil" className="text-accent-strong hover:underline">
                Écrire sur le téléphone ↑
              </a>
            </Row>
          </motion.dl>
        </div>

        <motion.form
          {...reveal(0.15)}
          onSubmit={submit}
          className="flex min-w-0 flex-col gap-5 rounded-[26px] border border-white/10 bg-[linear-gradient(165deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))] p-6 sm:p-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nom" id="c-name">
              <input id="c-name" name="name" required autoComplete="name" placeholder="Votre nom" className={FIELD} />
            </Field>
            <Field label="E-mail" id="c-email">
              <input id="c-email" name="email" type="email" required autoComplete="email" placeholder="vous@exemple.com" className={FIELD} />
            </Field>
          </div>
          <Field label="Type de projet" id="c-type">
            <select id="c-type" name="type" className={`${FIELD} appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2394a3b8'%3E%3Cpath d='M5.5 7.5l4.5 4.5 4.5-4.5'/%3E%3C/svg%3E")] bg-[length:18px] bg-[right_14px_center] bg-no-repeat pr-11`}>
              {TYPES.map((t) => (
                <option key={t} className="bg-surface">
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Votre projet" id="c-message">
            <textarea
              id="c-message"
              name="message"
              required
              minLength={10}
              rows={5}
              placeholder="Ce que fait votre activité, ce que vous attendez du site, des exemples que vous aimez…"
              className={`${FIELD} resize-y`}
            />
          </Field>
          {/* Champ piège pour les robots : invisible, doit rester vide */}
          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="max-w-[32ch] text-[13px] text-muted">
              On vous répond par e-mail. Vos informations ne servent qu&apos;à traiter votre demande.
            </p>
            <button
              type="submit"
              disabled={status.kind === "sending"}
              className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-full bg-accent pl-6 pr-5 text-[15px] font-semibold text-[#052e16] shadow-[0_18px_40px_-16px_rgba(34,197,94,0.75)] transition-[transform,background-color,opacity] duration-200 hover:bg-[#2fd96a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.97] disabled:cursor-default disabled:opacity-60"
            >
              {status.kind === "sending" ? (
                <>
                  Envoi… <LoaderCircle size={18} aria-hidden className="animate-spin" />
                </>
              ) : (
                <>
                  Envoyer la demande <SendHorizontal size={18} aria-hidden />
                </>
              )}
            </button>
          </div>

          <p role="status" aria-live="polite" className="min-h-[1.5em] text-[14px]">
            {status.kind === "sent" && (
              <span className="inline-flex items-center gap-2 text-accent-strong">
                <CheckCircle2 size={17} aria-hidden /> Demande envoyée. On vous répond rapidement.
              </span>
            )}
            {status.kind === "error" && <span className="text-red-300">{status.message}</span>}
          </p>
        </motion.form>
      </div>
    </section>
  );
}

function Row({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 py-4 text-[15px]">
      <dt className="flex items-center gap-2.5 text-muted">
        <span className="text-white/40">{icon}</span>
        {label}
      </dt>
      <dd className="m-0 text-right">{children}</dd>
    </div>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={id} className="text-[14px] font-medium text-white/85">
        {label}
      </label>
      {children}
    </div>
  );
}
