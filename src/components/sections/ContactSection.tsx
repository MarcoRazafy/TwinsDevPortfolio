"use client";

import Image from "next/image";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  BatteryFull,
  Calendar,
  Check,
  CheckCircle2,
  CircleAlert,
  CodeXml,
  FolderKanban,
  Globe,
  LoaderCircle,
  Mail,
  MapPin,
  MessageCircle,
  Search,
  SendHorizontal,
  Settings,
  Wifi,
} from "lucide-react";
import DesktopWallpaper from "@/components/contact/DesktopWallpaper";
import LaptopMockup from "@/components/contact/LaptopMockup";
import { SITE } from "@/lib/site";
import SectionHead from "./SectionHead";

const EXPO_OUT = [0.16, 1, 0.3, 1] as const;
const TYPES = ["Site vitrine", "Boutique en ligne", "Application web ou mobile", "Refonte d'un site existant", "Autre"];

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

/** Section « Contact » : grand titre, puis un ordinateur portable dont l'écran affiche le formulaire dans une fenêtre. */
export default function ContactSection() {
  const reduce = useReducedMotion() ?? false;
  const reveal = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-10% 0px" },
    transition: reduce ? { duration: 0.3 } : { duration: 0.8, ease: EXPO_OUT, delay },
  });

  const channels = [
    SITE.email && { label: SITE.email, href: `mailto:${SITE.email}`, icon: <Mail size={15} aria-hidden /> },
    SITE.linkedin && { label: "LinkedIn", href: SITE.linkedin, icon: <ArrowUpRight size={15} aria-hidden />, external: true },
    { label: "Écrire à l'assistant sur le téléphone", href: "#accueil", icon: <MessageCircle size={15} aria-hidden /> },
  ].filter(Boolean) as { label: string; href: string; icon: ReactNode; external?: boolean }[];

  return (
    <section id="contact" aria-labelledby="contact-titre" className="relative scroll-mt-24 px-4 py-24 sm:px-8 lg:py-32">
      <div className="mx-auto w-full max-w-[1180px]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHead
            path="/contact"
            id="contact-titre"
            title={
              <>
                Parlons de <span className="text-glow">votre projet</span>
              </>
            }
            lede="Une question, une idée ? On vous répond franchement, avec des questions précises et, si le projet nous correspond, un devis."
          />
          {/* Autres moyens de nous joindre */}
          <motion.ul {...reveal(0.05)} className="mb-12 flex flex-wrap gap-2 lg:mb-16 lg:justify-end">
            {SITE.location && (
              <li className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 text-[13.5px] text-white/70">
                <MapPin size={15} aria-hidden className="text-accent-strong" />
                {SITE.location}
              </li>
            )}
            {channels.map((c) => (
              <li key={c.href}>
                <a
                  href={c.href}
                  {...(c.external && { target: "_blank", rel: "noopener noreferrer" })}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 text-[13.5px] text-white/75 transition-colors hover:border-accent/50 hover:bg-accent/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="text-accent-strong">{c.icon}</span>
                  {c.label}
                </a>
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.div {...reveal(0.12)}>
          <LaptopMockup>
            {/* Bureau : fond d'écran, barre de menu, fenêtre « Nouveau message », dock */}
            <div className="relative isolate flex min-h-[560px] flex-col">
              <DesktopWallpaper />
              <MenuBar />
              <div className="relative z-10 flex flex-1 items-center justify-center px-3 pb-4 pt-3 sm:px-8 sm:pb-6 sm:pt-6 lg:px-14">
                <ContactWindow reduce={reduce} />
              </div>
              <Dock />
            </div>
          </LaptopMockup>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Bureau ── */

/** Barre de menu du bureau : logo, menus (décoratifs), icônes d'état et horloge. */
function MenuBar() {
  const [now, setNow] = useState<Date | null>(null);
  // Horloge affichée côté navigateur seulement (l'heure du serveur ne correspond pas à celle du visiteur)
  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 30_000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, []);
  const time = now
    ? now.toLocaleString("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div
      aria-hidden
      className="relative z-20 hidden h-8 items-center justify-between bg-[#03140f]/45 px-4 text-[12.5px] text-white/90 backdrop-blur-xl sm:flex"
    >
      <div className="flex items-center gap-4">
        <Image src="/brand/twinsdev-mark-v2.webp" alt="" width={480} height={244} className="h-auto w-[18px]" />
        <span className="font-semibold">TwinsDev</span>
        <span className="hidden gap-4 text-white/75 lg:flex">
          <span>Fichier</span>
          <span>Édition</span>
          <span>Affichage</span>
          <span>Fenêtre</span>
          <span>Aide</span>
        </span>
      </div>
      <div className="flex items-center gap-3.5 text-white/85">
        <Wifi size={14} />
        <BatteryFull size={16} />
        <Search size={13} />
        <span className="min-w-[9.5em] text-right tabular-nums">{time}</span>
      </div>
    </div>
  );
}

/** Dock du bureau (décoratif) : l'application Messages est ouverte. */
function Dock() {
  const apps = [
    { Icon: FolderKanban, bg: "linear-gradient(150deg,#38bdf8,#0369a1)" },
    { Icon: Globe, bg: "linear-gradient(150deg,#2dd4bf,#0f766e)" },
    { Icon: Mail, bg: "linear-gradient(150deg,#4ade80,#15803d)", open: true },
    { Icon: MessageCircle, bg: "linear-gradient(150deg,#86efac,#16a34a)" },
    { Icon: Calendar, bg: "linear-gradient(150deg,#f8fafc,#cbd5e1)", dark: true },
    { Icon: CodeXml, bg: "linear-gradient(150deg,#334155,#0f172a)" },
    { Icon: Settings, bg: "linear-gradient(150deg,#94a3b8,#475569)" },
  ];
  return (
    <div aria-hidden className="relative z-20 hidden justify-center pb-3 sm:flex">
      <div className="flex items-end gap-2 rounded-[20px] border border-white/20 bg-white/15 px-2.5 py-2 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        {apps.map(({ Icon, bg, open, dark }, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span
              className={`grid h-10 w-10 place-items-center rounded-[11px] shadow-[0_4px_10px_-4px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.35)] transition-transform duration-200 hover:-translate-y-1.5 hover:scale-110 lg:h-11 lg:w-11 ${
                dark ? "text-slate-700" : "text-white"
              }`}
              style={{ background: bg }}
            >
              <Icon size={20} strokeWidth={2} />
            </span>
            <span className={`h-1 w-1 rounded-full ${open ? "bg-white/85" : "bg-transparent"}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Fenêtre du formulaire ── */

function ContactWindow({ reduce }: { reduce: boolean }) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  // Validation au départ du champ : erreur affichée sous le champ, coche quand il est valide et rempli
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [valid, setValid] = useState<Partial<Record<FieldName, boolean>>>({});
  const [type, setType] = useState(TYPES[0]);

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
      setType(TYPES[0]);
      setErrors({});
      setValid({});
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
    <motion.div
      initial={reduce ? false : { opacity: 0, scale: 0.96, y: 16 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-15% 0px" }}
      transition={{ duration: 0.7, ease: EXPO_OUT, delay: reduce ? 0 : 0.35 }}
      className="w-full max-w-[980px] overflow-hidden rounded-2xl border border-white/15 bg-[#07110e]/80 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl"
    >
      {/* Barre de titre de la fenêtre */}
      <div className="relative flex h-11 items-center border-b border-white/10 bg-white/[0.04] px-4">
        <span aria-hidden className="flex gap-2">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]/90" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]/90" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]/90" />
        </span>
        <p className="absolute inset-x-20 truncate text-center text-[13px] font-medium text-white/80">
          <Mail size={13} aria-hidden className="mr-1.5 inline -translate-y-px text-accent-strong" />
          Nouveau message — TwinsDev
        </p>
      </div>

      <form onSubmit={submit} noValidate aria-label="Formulaire de contact" aria-describedby="contact-aide" className="flex flex-col gap-3.5 p-3.5 sm:p-5">
        <div className="grid gap-3.5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          {/* Colonne gauche : qui vous êtes */}
          <div className="grid content-start gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <FieldCard id="c-name" label="Nom" required error={errors.name} valid={valid.name}>
              <input id="c-name" required autoComplete="name" placeholder="Votre nom et prénom" className={INPUT} {...fieldProps("name")} />
            </FieldCard>
            <FieldCard id="c-company" label="Entreprise" hint="facultatif" error={errors.company} valid={valid.company}>
              <input
                id="c-company"
                autoComplete="organization"
                maxLength={120}
                placeholder="Laissez vide si vous êtes particulier"
                className={INPUT}
                {...fieldProps("company")}
              />
            </FieldCard>
            <FieldCard id="c-phone" label="Téléphone" hint="facultatif" error={errors.phone} valid={valid.phone}>
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
            </FieldCard>
            <FieldCard id="c-email" label="E-mail" required error={errors.email} valid={valid.email}>
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
            </FieldCard>
          </div>

          {/* Colonne droite : le projet */}
          <div className="flex min-w-0 flex-col gap-3">
            <fieldset className={`${CARD} border-white/10 bg-white/[0.045] focus-within:border-accent/55`}>
              <legend className="sr-only">Type de projet</legend>
              <p aria-hidden className={LABEL}>
                Type de projet
              </p>
              <div className="flex flex-wrap gap-1.5">
                {TYPES.map((t) => (
                  <label key={t} className="cursor-pointer">
                    <input type="radio" name="type" value={t} checked={type === t} onChange={() => setType(t)} className="peer sr-only" />
                    <span className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.04] px-3 text-[13px] text-white/70 transition-colors hover:border-white/30 hover:text-white peer-checked:border-accent/70 peer-checked:bg-accent/20 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                      {type === t && <Check size={13} strokeWidth={2.6} aria-hidden className="text-accent-strong" />}
                      {t}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <FieldCard id="c-message" label="Votre projet" required error={errors.message} valid={valid.message} grow>
              <textarea
                id="c-message"
                required
                minLength={10}
                maxLength={4000}
                rows={6}
                placeholder="Ce que fait votre activité, ce que vous attendez du site, des exemples que vous aimez…"
                className={`${INPUT} min-h-[150px] flex-1 resize-y leading-relaxed`}
                {...fieldProps("message")}
              />
            </FieldCard>
          </div>
        </div>

        {/* Champ piège pour les robots : invisible, doit rester vide */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

        <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-3.5 sm:flex-row sm:items-center sm:justify-between">
          <p id="contact-aide" className="max-w-[46ch] text-[12.5px] leading-relaxed text-white/55">
            <span className="text-accent-strong">*</span> champs obligatoires. On vous répond par e-mail ; vos informations ne servent
            qu&apos;à traiter votre demande.
          </p>
          <button
            type="submit"
            disabled={status.kind === "sending"}
            className="group inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[linear-gradient(120deg,#22c55e,#14b8a6)] pl-5 pr-4 text-[14.5px] font-semibold text-[#03140c] shadow-[0_14px_34px_-12px_rgba(20,184,166,0.8)] transition-[transform,filter,opacity] duration-200 hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[#07110e] active:translate-y-0 active:scale-[0.98] disabled:cursor-default disabled:opacity-60"
          >
            {status.kind === "sending" ? (
              <>
                Envoi en cours… <LoaderCircle size={17} aria-hidden className="animate-spin" />
              </>
            ) : (
              <>
                Envoyer le message
                <SendHorizontal size={17} aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </div>

        <div role="status" aria-live="polite" className="text-[14px] empty:hidden">
          {status.kind === "sent" && (
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-3.5 py-2 text-accent-strong"
            >
              <CheckCircle2 size={17} aria-hidden /> Message envoyé. On vous répond rapidement par e-mail.
            </motion.p>
          )}
          {status.kind === "error" && (
            <p className="inline-flex items-center gap-2 rounded-xl border border-red-400/40 bg-red-500/10 px-3.5 py-2 text-red-200">
              <CircleAlert size={17} aria-hidden /> {status.message}
            </p>
          )}
        </div>
      </form>
    </motion.div>
  );
}

/* Carte translucide d'un champ : libellé en petites capitales, champ plus clair à l'intérieur. */
const CARD = "flex min-w-0 flex-col gap-2 rounded-xl border p-3 transition-colors duration-200";
const LABEL = "flex items-center gap-1.5 px-0.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white/65";
const INPUT =
  "w-full rounded-lg border border-transparent bg-white/[0.07] py-2.5 pl-3 pr-10 text-[14.5px] text-white placeholder:italic placeholder:text-white/40 transition-colors duration-200 hover:bg-white/[0.09] focus:border-accent/60 focus:bg-white/[0.11] focus:outline-none aria-[invalid=true]:border-red-400/60";

function FieldCard({
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
    <div
      className={`${CARD} ${grow ? "flex-1" : ""} ${
        error
          ? "border-red-400/50 bg-red-500/[0.07]"
          : valid
            ? "border-accent/40 bg-white/[0.045]"
            : "border-white/10 bg-white/[0.045] focus-within:border-accent/55"
      }`}
    >
      <label htmlFor={id} className={LABEL}>
        {label}
        {required && (
          <span aria-hidden className="text-accent-strong">
            *
          </span>
        )}
        {hint && <span className="normal-case tracking-normal text-white/35">· {hint}</span>}
      </label>
      <div className={`relative flex ${grow ? "flex-1" : ""}`}>
        {children}
        {/* Coche quand le champ est valide, alerte quand il ne l'est pas (icône + texte, jamais la couleur seule) */}
        {(valid || error) && (
          <span aria-hidden className={`pointer-events-none absolute right-3 ${grow ? "top-3" : "top-1/2 -translate-y-1/2"}`}>
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
        <p id={`${id}-erreur`} className="px-0.5 text-[12.5px] leading-snug text-red-200">
          {error}
        </p>
      )}
    </div>
  );
}
