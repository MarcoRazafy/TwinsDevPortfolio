"use client";

import Image from "next/image";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  CircleAlert,
  FolderKanban,
  LoaderCircle,
  Mail,
  MessageCircle,
  PenLine,
  RotateCcw,
  SendHorizontal,
} from "lucide-react";
import { SITE } from "@/lib/site";
import { INSET, RAISED, RAISED_SM, SURFACE } from "./neumorphism";
import SectionHead from "./SectionHead";

const EXPO_OUT = [0.16, 1, 0.3, 1] as const;
/** Suggestions pour le type de projet ; le visiteur écrit ce qu'il veut. */
const TYPE_IDEAS = ["Site vitrine", "Boutique en ligne", "Application web ou mobile", "Refonte d'un site existant", "Plateforme sur mesure"];

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string };
type Control = HTMLInputElement | HTMLTextAreaElement;
type FieldName = "name" | "company" | "phone" | "email" | "message";

/** Message d'erreur d'un champ (cause + comment corriger), ou "" s'il est valide. */
function problem(el: Control): string {
  const v = el.validity;
  if (v.valid) return "";
  switch (el.name as FieldName) {
    case "name":
      return "Indiquez votre nom pour qu'on sache à qui répondre.";
    case "email":
      return v.valueMissing
        ? "Indiquez votre e-mail : c'est par là qu'on vous répond."
        : "Adresse incomplète : vérifiez le @ et le domaine (ex. nom@exemple.com).";
    case "phone":
      return "Numéro invalide : chiffres, espaces et + uniquement.";
    case "message":
      return "Décrivez votre projet en quelques mots (10 caractères minimum).";
    default:
      return "Champ invalide.";
  }
}

/** Heure courante côté navigateur (`null` avant le premier rendu client : l'heure du serveur n'est pas celle du visiteur). */
function useNow(everyMs: number) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, everyMs);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [everyMs]);
  return now;
}

/**
 * Section « Contact » en tableau de widgets à relief doux : date et heure, choix du type de projet,
 * horloge, raccourcis, puis les champs du message et l'envoi (vers /api/contact).
 */
export default function ContactSection() {
  const reduce = useReducedMotion() ?? false;
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  // Validation au départ du champ : erreur affichée sous le champ, coche quand il est valide et rempli
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [valid, setValid] = useState<Partial<Record<FieldName, boolean>>>({});

  const reveal = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-10% 0px" },
    transition: reduce ? { duration: 0.3 } : { duration: 0.8, ease: EXPO_OUT, delay },
  });

  const check = (el: Control) => {
    const name = el.name as FieldName;
    const message = problem(el);
    setErrors((e) => ({ ...e, [name]: message }));
    setValid((s) => ({ ...s, [name]: !message && el.value.trim() !== "" }));
    return message;
  };
  // Une erreur déjà affichée disparaît dès que la saisie est corrigée (sans en afficher de nouvelle en cours de frappe)
  const recheck = (el: Control) => {
    if (errors[el.name as FieldName]) check(el);
  };
  const clear = () => {
    setErrors({});
    setValid({});
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const controls = [...form.querySelectorAll<Control>("input[data-check], textarea[data-check]")];
    const invalid = controls.filter((el) => check(el));
    if (invalid.length) {
      invalid[0].focus();
      setStatus({ kind: "idle" });
      return;
    }

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
      clear();
      setStatus({ kind: "sent" });
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "Envoi impossible, réessayez dans un instant." });
    }
  };

  const fieldProps = (name: FieldName) => ({
    name,
    "data-check": "",
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `c-${name}-erreur` : undefined,
    onBlur: (e: { currentTarget: Control }) => check(e.currentTarget),
    onInput: (e: { currentTarget: Control }) => recheck(e.currentTarget),
  });

  return (
    <section id="contact" aria-labelledby="contact-titre" className="relative scroll-mt-24 px-4 py-24 sm:px-8 lg:py-32">
      <div className="mx-auto w-full max-w-[1180px]">
        <SectionHead
          id="contact-titre"
          title={
            <>
              Parlons de <span className="text-glow">votre projet</span>
            </>
          }
          lede="Une question, une idée ? On vous répond franchement, avec des questions précises et, si le projet nous correspond, un devis."
        />

        <form
          onSubmit={submit}
          onReset={() => {
            clear();
            setStatus({ kind: "idle" });
          }}
          noValidate
          aria-label="Formulaire de contact"
          className="grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:grid-rows-[1fr_auto] lg:gap-7"
        >
          {/* ── Tableau de widgets (gauche) ── */}
          <motion.div {...reveal(0.05)} className={`order-1 flex flex-col gap-4 rounded-[36px] p-4 ${SURFACE} ${RAISED} lg:row-start-1`}>
            {/* Date, heure et type de projet */}
            <div className={`rounded-[28px] p-5 ${SURFACE} ${RAISED_SM}`}>
              <DateTime />
              {/* Type de projet : écrit par le visiteur (suggestions proposées pendant la saisie) */}
              <div className={`mt-5 flex items-center gap-2 rounded-full py-2 pl-4 pr-2 transition-[box-shadow] focus-within:ring-2 focus-within:ring-accent/50 ${INSET}`}>
                <div className="min-w-0 flex-1">
                  <label htmlFor="c-type" className="block text-[11.5px] text-white/50">
                    Votre projet
                  </label>
                  <input
                    id="c-type"
                    name="type"
                    list="c-type-idees"
                    maxLength={60}
                    autoComplete="off"
                    placeholder="Site vitrine, boutique, application…"
                    className="w-full bg-transparent font-[family-name:var(--font-display)] text-[15px] font-semibold text-white placeholder:font-normal placeholder:text-white/35 focus:outline-none"
                  />
                  <datalist id="c-type-idees">
                    {TYPE_IDEAS.map((t) => (
                      <option key={t} value={t} />
                    ))}
                  </datalist>
                </div>
                <span aria-hidden className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${SURFACE} ${RAISED_SM} text-accent-strong`}>
                  <PenLine size={17} />
                </span>
              </div>
            </div>

            {/* Horloge + tuile TwinsDev et raccourcis */}
            <div className="grid grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-4">
              <AnalogClock reduce={reduce} />
              <div className="flex min-w-0 flex-col gap-3">
                <div className={`relative grid aspect-square place-items-center overflow-hidden rounded-[22px] ${INSET} bg-[radial-gradient(circle_at_30%_25%,rgba(74,222,128,0.18),transparent_60%),#0a0f13]`}>
                  <Image src="/brand/twinsdev-mark-v2.webp" alt="" width={480} height={244} className="h-auto w-[62%] drop-shadow-[0_6px_18px_rgba(34,197,94,0.45)]" />
                  <span aria-hidden className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_rgba(74,222,128,0.9)]" />
                </div>
                <p className="truncate px-1 text-[12px] text-white/55">TwinsDev · Marco &amp; Loïc</p>
                <div className={`flex items-center justify-center gap-2 rounded-full p-1.5 ${INSET}`}>
                  <RoundLink href="#accueil" label="Écrire à l'assistant sur le téléphone">
                    <MessageCircle size={17} aria-hidden />
                  </RoundLink>
                  <RoundLink href="#projets" label="Voir nos projets">
                    <FolderKanban size={17} aria-hidden />
                  </RoundLink>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Envoi (sous le tableau sur ordinateur, en dernier sur mobile) ── */}
          <motion.div {...reveal(0.15)} className={`order-3 flex items-center gap-4 rounded-[30px] p-3 ${SURFACE} ${RAISED} lg:order-none lg:col-start-1 lg:row-start-2`}>
            <button
              type="submit"
              disabled={status.kind === "sending"}
              className={`group flex h-14 flex-1 cursor-pointer items-center justify-center gap-2.5 rounded-full text-[15px] font-semibold text-white transition-[color,box-shadow] duration-200 ${INSET} hover:text-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default disabled:opacity-60`}
            >
              {status.kind === "sending" ? (
                <>
                  <LoaderCircle size={18} aria-hidden className="animate-spin text-accent-strong" /> Envoi en cours…
                </>
              ) : (
                <>
                  <SendHorizontal size={18} aria-hidden className="text-accent-strong transition-transform duration-200 group-hover:translate-x-0.5" />
                  Envoyer le message
                </>
              )}
            </button>
            {SITE.email ? (
              <RoundLink href={`mailto:${SITE.email}`} label={`Écrire à ${SITE.email}`} size="lg">
                <Mail size={20} aria-hidden />
              </RoundLink>
            ) : (
              <button
                type="reset"
                aria-label="Effacer le formulaire"
                title="Effacer le formulaire"
                className={`grid h-14 w-14 shrink-0 cursor-pointer place-items-center rounded-full ${SURFACE} ${RAISED_SM} text-white/70 transition-colors hover:text-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
              >
                <RotateCcw size={19} aria-hidden />
              </button>
            )}
          </motion.div>

          {/* ── Champs du message (droite) ── */}
          <motion.div
            {...reveal(0.1)}
            className={`order-2 flex flex-col gap-5 rounded-[36px] p-5 sm:p-7 ${SURFACE} ${RAISED} lg:order-none lg:col-start-2 lg:row-span-2 lg:row-start-1`}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-[family-name:var(--font-display)] text-[1.15rem] font-semibold">Nouveau message</p>
              <p id="contact-aide" className="text-[12.5px] text-white/50">
                <span className="text-accent-strong">*</span> obligatoire
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Well id="c-name" label="Nom" required error={errors.name} valid={valid.name}>
                <input id="c-name" required autoComplete="name" placeholder="Votre nom et prénom" className={INPUT} {...fieldProps("name")} />
              </Well>
              <Well id="c-email" label="E-mail" required error={errors.email} valid={valid.email}>
                <input
                  id="c-email"
                  type="email"
                  inputMode="email"
                  required
                  autoComplete="email"
                  placeholder="vous@exemple.com"
                  className={INPUT}
                  {...fieldProps("email")}
                />
              </Well>
              <Well id="c-phone" label="Téléphone" hint="facultatif" error={errors.phone} valid={valid.phone}>
                <input
                  id="c-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  pattern="[+0-9 \(\)\.\-]{6,20}"
                  placeholder="+261 34 00 000 00"
                  className={INPUT}
                  {...fieldProps("phone")}
                />
              </Well>
              <Well id="c-company" label="Entreprise" hint="facultatif" error={errors.company} valid={valid.company}>
                <input
                  id="c-company"
                  autoComplete="organization"
                  maxLength={120}
                  placeholder="Vide si particulier"
                  className={INPUT}
                  {...fieldProps("company")}
                />
              </Well>
            </div>

            <Well id="c-message" label="Votre projet" required error={errors.message} valid={valid.message} grow>
              <textarea
                id="c-message"
                required
                minLength={10}
                maxLength={4000}
                rows={6}
                placeholder="Ce que fait votre activité, ce que vous attendez du site, des exemples que vous aimez…"
                className={`${FIELD} min-h-[160px] flex-1 resize-y rounded-[22px] py-3.5 leading-relaxed`}
                {...fieldProps("message")}
              />
            </Well>

            {/* Champ piège pour les robots : invisible, doit rester vide */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

            <p className="text-[12.5px] leading-relaxed text-white/50">
              On vous répond par e-mail ; vos informations ne servent qu&apos;à traiter votre demande.
              {SITE.linkedin && (
                <>
                  {" "}
                  <a href={SITE.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-accent-strong hover:underline">
                    LinkedIn <ArrowUpRight size={12} aria-hidden />
                  </a>
                </>
              )}
            </p>

            <div role="status" aria-live="polite" className="text-[14px] empty:hidden">
              {status.kind === "sent" && (
                <motion.p
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-accent-strong ${INSET}`}
                >
                  <CheckCircle2 size={17} aria-hidden /> Message envoyé. On vous répond rapidement par e-mail.
                </motion.p>
              )}
              {status.kind === "error" && (
                <p className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-red-200 ${INSET}`}>
                  <CircleAlert size={17} aria-hidden /> {status.message}
                </p>
              )}
            </div>
          </motion.div>
        </form>
      </div>
    </section>
  );
}

/* ── Widgets ── */

/** Date et heure du visiteur, en grands chiffres. */
function DateTime() {
  const now = useNow(15_000);
  const date = now ? now.toLocaleDateString("fr-FR", { day: "numeric", month: "numeric" }) : "--/--";
  const time = now ? now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "--:--";
  const day = now ? now.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", "") : "";
  return (
    <div className="flex items-start justify-between gap-3">
      <p className="font-[family-name:var(--font-display)] text-[2.1rem] font-semibold leading-[1.05] tracking-[-0.02em] tabular-nums">
        <span className="block">{date}</span>
        <span className="block text-white/80">{time}</span>
      </p>
      <span aria-hidden>
        <span className="grid h-7 min-w-7 place-items-center rounded-full border border-white/15 px-1.5 font-mono text-[10.5px] uppercase text-white/60">
          {day}
        </span>
      </span>
    </div>
  );
}

/** Horloge analogique creusée : aiguilles des heures, des minutes et des secondes (verte). */
function AnalogClock({ reduce }: { reduce: boolean }) {
  const now = useNow(1_000);
  const s = now ? now.getSeconds() : 0;
  const m = now ? now.getMinutes() + s / 60 : 10;
  const h = now ? (now.getHours() % 12) + m / 60 : 10;
  const hand = (deg: number) => ({ transform: `rotate(${deg}deg)`, transition: reduce || deg === 0 ? "none" : "transform 0.3s ease-out" });
  return (
    <div role="img" aria-label={now ? `Horloge : ${now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}` : "Horloge"} className={`relative aspect-square self-start rounded-full ${INSET}`}>
      <div className={`absolute inset-[9%] rounded-full ${SURFACE} ${RAISED_SM}`}>
        {/* Repères des heures (12, 3, 6, 9) */}
        {[0, 90, 180, 270].map((deg) => (
          <span key={deg} aria-hidden className="absolute inset-0" style={{ transform: `rotate(${deg}deg)` }}>
            <span className="absolute left-1/2 top-[7%] h-[9%] w-[2px] -translate-x-1/2 rounded-full bg-white/35" />
          </span>
        ))}
        <span aria-hidden className="absolute inset-0" style={hand(h * 30)}>
          <span className="absolute bottom-1/2 left-1/2 h-[26%] w-[3px] -translate-x-1/2 rounded-full bg-white/90" />
        </span>
        <span aria-hidden className="absolute inset-0" style={hand(m * 6)}>
          <span className="absolute bottom-1/2 left-1/2 h-[36%] w-[2px] -translate-x-1/2 rounded-full bg-white/75" />
        </span>
        {now && (
          <span aria-hidden className="absolute inset-0" style={hand(s * 6)}>
            <span className="absolute bottom-[42%] left-1/2 h-[42%] w-px -translate-x-1/2 bg-accent-strong shadow-[0_0_6px_rgba(74,222,128,0.9)]" />
          </span>
        )}
        <span aria-hidden className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-strong" />
      </div>
    </div>
  );
}

function RoundLink({ href, label, size = "md", children }: { href: string; label: string; size?: "md" | "lg"; children: ReactNode }) {
  return (
    <a
      href={href}
      aria-label={label}
      title={label}
      className={`grid shrink-0 place-items-center rounded-full ${size === "lg" ? "h-14 w-14" : "h-11 w-11"} ${SURFACE} ${RAISED_SM} text-white/70 transition-colors hover:text-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
    >
      {children}
    </a>
  );
}

/* ── Champs ── */

const FIELD = `w-full border border-transparent ${SURFACE} ${INSET} py-3 pl-5 pr-11 text-[15px] text-white placeholder:text-white/35 transition-[border-color] duration-200 focus:border-accent/60 focus:outline-none aria-[invalid=true]:border-red-400/60`;
const INPUT = `${FIELD} rounded-full`;

/** Champ creusé : libellé au-dessus, coche verte si valide, alerte et message si invalide (jamais la couleur seule). */
function Well({
  id,
  label,
  required,
  hint,
  error,
  valid,
  grow,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  valid?: boolean;
  grow?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`flex min-w-0 flex-col gap-2 ${grow ? "flex-1" : ""}`}>
      <label htmlFor={id} className="flex items-center gap-1.5 px-2 text-[13px] font-medium text-white/75">
        {label}
        {required && (
          <span aria-hidden className="text-accent-strong">
            *
          </span>
        )}
        {hint && <span className="font-normal text-white/60">· {hint}</span>}
      </label>
      <div className={`relative flex ${grow ? "flex-1" : ""}`}>
        {children}
        {(valid || error) && (
          <span aria-hidden className={`pointer-events-none absolute right-4 ${grow ? "top-3.5" : "top-1/2 -translate-y-1/2"}`}>
            {error ? (
              <CircleAlert size={18} className="text-red-300" />
            ) : (
              <span className="grid h-5 w-5 place-items-center rounded-full bg-accent text-[#03140c]">
                <Check size={13} strokeWidth={3} />
              </span>
            )}
          </span>
        )}
      </div>
      {error && (
        <p id={`${id}-erreur`} className="px-2 text-[12.5px] leading-snug text-red-200">
          {error}
        </p>
      )}
    </div>
  );
}
