"use client";

import { startTransition, useEffect, useId, useState, type FormEvent, type ReactNode } from "react";
import Image from "next/image";
import { CheckCircle2, ImagePlus, Search, TriangleAlert, X } from "lucide-react";
import { TECH, TECH_GROUPS, techColor, techLabel, type TechKey } from "@/lib/tech";
import type { ActionState } from "@/app/admin/actions";

export const inputClass =
  "w-full rounded-xl border border-white/12 bg-white/[0.05] px-3.5 py-2.5 text-[14px] text-white placeholder:text-white/30 transition-colors focus:border-accent/70 focus:bg-white/[0.08] focus:outline-none";

/** Champ avec libellé et aide facultative. */
export function Field({ label, hint, htmlFor, children }: { label: string; hint?: string; htmlFor?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[13px] font-medium text-white/75">
        {label}
      </label>
      {children}
      {hint && <p className="text-[12px] text-white/40">{hint}</p>}
    </div>
  );
}

/** Groupe de champs titré. */
export function Fieldset({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <legend className="px-1.5 font-mono text-[11.5px] uppercase tracking-[0.12em] text-accent-strong">{legend}</legend>
      {children}
    </fieldset>
  );
}

/** Message de résultat d'une action (succès / erreur), annoncé aux lecteurs d'écran. */
export function Status({ state }: { state: ActionState }) {
  return (
    <p role="status" aria-live="polite" className="min-h-6 text-[13.5px]">
      {state && (
        <span className={`inline-flex items-center gap-1.5 ${state.ok ? "text-accent-strong" : "text-red-300"}`}>
          {state.ok ? <CheckCircle2 size={15} aria-hidden /> : <TriangleAlert size={15} aria-hidden />}
          {state.message}
        </span>
      )}
    </p>
  );
}

/**
 * Choix de technologies dans un ordre donné (l'ordre compte : premières affichées en premier).
 * Avec `name`, la sélection part avec le formulaire (champs cachés) ; `onChange` la remonte au parent.
 */
export function TechPicker({
  name,
  initial,
  max = 12,
  label,
  onChange,
}: {
  name?: string;
  initial: TechKey[];
  max?: number;
  label: string;
  onChange?: (selected: TechKey[]) => void;
}) {
  const [selected, setSelectedState] = useState<TechKey[]>(initial);
  const [query, setQuery] = useState("");
  const setSelected = (update: (s: TechKey[]) => TechKey[]) => {
    const next = update(selected);
    setSelectedState(next);
    onChange?.(next);
  };
  // Recherche sans accents ni casse, sur le nom affiché et la catégorie
  const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const q = norm(query.trim());
  const available = (Object.keys(TECH) as TechKey[]).filter(
    (k) => !selected.includes(k) && (!q || norm(techLabel(k)).includes(q) || norm(TECH[k].group).includes(q) || k.includes(q)),
  );
  const groups = TECH_GROUPS.map((g) => ({ group: g, keys: available.filter((k) => TECH[k].group === g) })).filter((g) => g.keys.length);
  return (
    <div className="flex flex-col gap-3">
      {name && selected.map((k) => <input key={k} type="hidden" name={name} value={k} />)}
      <ul aria-label={`${label} : sélection`} className="flex min-h-11 flex-wrap gap-1.5 rounded-xl border border-dashed border-white/15 p-2">
        {selected.length === 0 && <li className="px-1.5 py-1 text-[12.5px] text-white/35">Aucune technologie choisie</li>}
        {selected.map((k, i) => (
          <li key={k}>
            <button
              type="button"
              onClick={() => setSelected((s) => s.filter((x) => x !== k))}
              aria-label={`Retirer ${techLabel(k)}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 py-1 pl-1.5 pr-2 text-[12.5px] text-white transition-colors hover:border-red-400/60 hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="grid h-4 w-4 place-items-center rounded-full bg-white/10 font-mono text-[9.5px] text-white/70">{i + 1}</span>
              <TechIcon k={k} />
              {techLabel(k)}
              <X size={12} aria-hidden className="text-white/50" />
            </button>
          </li>
        ))}
      </ul>
      <div className="relative">
        <Search size={15} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            // Entrée : ajoute la première technologie trouvée (sans envoyer le formulaire)
            if (e.key !== "Enter") return;
            e.preventDefault();
            if (available[0] && selected.length < max) {
              setSelected((s) => [...s, available[0]]);
              setQuery("");
            }
          }}
          aria-label={`${label} : rechercher une technologie`}
          placeholder={`Rechercher parmi ${Object.keys(TECH).length} technologies (Entrée pour ajouter)`}
          className={`${inputClass} py-2 pl-9 text-[13px]`}
        />
      </div>
      <div
        role="group"
        aria-label={`${label} : ajouter`}
        className="flex max-h-72 flex-col gap-3 overflow-y-auto rounded-xl border border-white/[0.06] bg-white/[0.015] p-3 [scrollbar-width:thin]"
      >
        {groups.length === 0 && <p className="text-[12.5px] text-white/40">Aucune technologie ne correspond.</p>}
        {groups.map(({ group, keys }) => (
          <div key={group} className="flex flex-col gap-1.5">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-white/40">
              {group} <span className="text-white/25">· {keys.length}</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {keys.map((k) => (
                <button
                  key={k}
                  type="button"
                  disabled={selected.length >= max}
                  onClick={() => setSelected((s) => [...s, k])}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] py-1 pl-2 pr-2.5 text-[12px] text-white/65 transition-colors hover:border-white/30 hover:text-white disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <TechIcon k={k} />
                  {techLabel(k)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TechIcon({ k }: { k: TechKey }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" style={{ fill: techColor(k) }}>
      <path d={TECH[k].icon.path} />
    </svg>
  );
}

/**
 * Choix d'une image avec aperçu. Renseigne aussi largeur et hauteur (champs `<name>Width` / `<name>Height`)
 * quand `withSize` est actif. `onRemove` : affiche une case « retirer l'image ».
 */
export function ImageInput({
  name,
  current,
  label,
  aspect = "aspect-[16/10]",
  withSize = false,
  removable = false,
}: {
  name: string;
  current?: string;
  label: string;
  aspect?: string;
  withSize?: boolean;
  removable?: boolean;
}) {
  const id = useId();
  const [preview, setPreview] = useState<string | null>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [removed, setRemoved] = useState(false);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const shown = preview ?? (removed ? null : current);
  return (
    <Field label={label} htmlFor={id} hint="WebP, PNG ou JPEG, 5 Mo maximum.">
      <div className={`relative ${aspect} w-full overflow-hidden rounded-xl border border-white/10 bg-[#0a0f1a]`}>
        {shown ? (
          <Image src={shown} alt="" fill sizes="480px" unoptimized={Boolean(preview)} className="object-contain" />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-white/30">
            <ImagePlus size={28} aria-hidden />
          </span>
        )}
      </div>
      <input
        id={id}
        name={name}
        type="file"
        accept="image/webp,image/png,image/jpeg"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          setPreview(file ? URL.createObjectURL(file) : null);
          setRemoved(false);
          if (file && withSize) {
            const bitmap = await createImageBitmap(file).catch(() => null);
            setSize(bitmap ? { w: bitmap.width, h: bitmap.height } : null);
            bitmap?.close();
          }
        }}
        className="text-[13px] text-white/60 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-[13px] file:font-medium file:text-white hover:file:bg-white/15"
      />
      {withSize && size && (
        <>
          <input type="hidden" name={`${name}Width`} value={size.w} />
          <input type="hidden" name={`${name}Height`} value={size.h} />
        </>
      )}
      {removable && current && !preview && (
        <label className="flex items-center gap-2 text-[13px] text-white/60">
          <input
            type="checkbox"
            name="removeImage"
            checked={removed}
            onChange={(e) => setRemoved(e.target.checked)}
            className="h-4 w-4 accent-red-500"
          />
          Retirer l&apos;image actuelle
        </label>
      )}
    </Field>
  );
}

/** Pastilles à cocher (catégories). */
export function ChipCheckbox({ name, value, label, defaultChecked }: { name: string; value: string; label: string; defaultChecked: boolean }) {
  return (
    <label className="cursor-pointer">
      <input type="checkbox" name={name} value={value} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="inline-flex items-center rounded-full border border-white/15 px-3.5 py-1.5 text-[13px] text-white/65 transition-colors peer-checked:border-accent/60 peer-checked:bg-accent/15 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-ring hover:border-white/30">
        {label}
      </span>
    </label>
  );
}

/**
 * Envoi d'un formulaire sans la remise à zéro automatique de React 19 (`<form action>`) :
 * si l'enregistrement est refusé, les saisies restent en place pour être corrigées.
 */
export const keepValuesOnSubmit = (action: (fd: FormData) => void) => (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const fd = new FormData(e.currentTarget, (e.nativeEvent as SubmitEvent).submitter);
  startTransition(() => action(fd));
};
