"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, LoaderCircle, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { deleteTestimonial, moveTestimonial, saveTestimonial, type ActionState } from "@/app/admin/actions";
import { TESTIMONIAL_MAX, initials, type Testimonial } from "@/lib/testimonials";
import { Field, Fieldset, ImageInput, Status, inputClass, keepValuesOnSubmit } from "./ui";

/** Onglet « Avis » : liste (ordre d'affichage, modification, suppression) + éditeur. */
export default function TestimonialsPanel({ testimonials }: { testimonials: Testimonial[] }) {
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [status, setStatus] = useState<ActionState>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const current = editing && editing !== "new" ? (testimonials.find((t) => t.id === editing) ?? null) : null;

  useEffect(() => {
    if (!confirm) return;
    const t = setTimeout(() => setConfirm(null), 4000);
    return () => clearTimeout(t);
  }, [confirm]);

  const run = (task: () => Promise<ActionState>) =>
    startTransition(async () => {
      setStatus(await task());
    });

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] text-white/50">L&apos;ordre de la liste est celui du site.</p>
          <button
            type="button"
            disabled={testimonials.length >= TESTIMONIAL_MAX}
            onClick={() => setEditing("new")}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-accent px-4 text-[13.5px] font-semibold text-[#052e16] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070c]"
          >
            <Plus size={16} aria-hidden />
            Nouvel avis
          </button>
        </div>
        <Status state={status} />
        {testimonials.length === 0 && (
          <p className="rounded-2xl border border-dashed border-white/12 p-6 text-center text-[13.5px] text-white/45">
            Aucun avis : la section est masquée sur le site.
          </p>
        )}
        <ul className="flex flex-col gap-2" aria-busy={pending}>
          {testimonials.map((t, i) => (
            <li
              key={t.id}
              className={`flex items-center gap-3 rounded-2xl border p-2.5 transition-colors ${
                editing === t.id ? "border-accent/50 bg-accent/[0.06]" : "border-white/10 bg-white/[0.02]"
              }`}
            >
              <div className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/[0.06] font-semibold text-white/70">
                {t.logo ? <Image src={t.logo} alt="" fill sizes="48px" className="object-contain p-1.5" /> : initials(t.company)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium">{t.company}</p>
                <p className="truncate text-[12px] text-white/45">
                  {t.author}
                  {t.example && " · exemple"}
                </p>
              </div>
              <div className="flex shrink-0 items-center">
                <Action label={`Monter ${t.company}`} disabled={i === 0 || pending} onClick={() => run(() => moveTestimonial(t.id, -1))}>
                  <ArrowUp size={15} aria-hidden />
                </Action>
                <Action label={`Descendre ${t.company}`} disabled={i === testimonials.length - 1 || pending} onClick={() => run(() => moveTestimonial(t.id, 1))}>
                  <ArrowDown size={15} aria-hidden />
                </Action>
                <Action label={`Modifier ${t.company}`} onClick={() => setEditing(t.id)}>
                  <Pencil size={15} aria-hidden />
                </Action>
                {confirm === t.id ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      run(async () => {
                        const r = await deleteTestimonial(t.id);
                        if (editing === t.id) setEditing(null);
                        setConfirm(null);
                        return r;
                      })
                    }
                    className="ml-1 h-9 rounded-lg bg-red-500/90 px-2.5 text-[12.5px] font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                  >
                    Confirmer
                  </button>
                ) : (
                  <Action label={`Supprimer ${t.company}`} danger onClick={() => setConfirm(t.id)}>
                    <Trash2 size={15} aria-hidden />
                  </Action>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="lg:sticky lg:top-6 lg:self-start">
        {editing ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
            <TestimonialEditor
              key={editing}
              testimonial={current}
              onClose={() => setEditing(null)}
              onSaved={(message) => {
                setEditing(null);
                setStatus({ ok: true, message });
              }}
            />
          </div>
        ) : (
          <div className="grid min-h-60 place-items-center rounded-3xl border border-dashed border-white/12 p-8 text-center text-[14px] text-white/45">
            Choisissez un avis à modifier, ou ajoutez-en un nouveau.
          </div>
        )}
      </div>
    </div>
  );
}

function TestimonialEditor({
  testimonial: t,
  onClose,
  onSaved,
}: {
  testimonial: Testimonial | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(async (prev, fd) => {
    const result = await saveTestimonial(prev, fd);
    if (result?.ok) onSaved(result.message);
    return result;
  }, null);

  return (
    <form action={action} onSubmit={keepValuesOnSubmit(action)} className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-[1.25rem] font-semibold">
          {t ? `Modifier l'avis de ${t.company}` : "Nouvel avis"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer l'éditeur"
          className="grid h-9 w-9 place-items-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X size={18} aria-hidden />
        </button>
      </div>
      <input type="hidden" name="originalId" value={t?.id ?? ""} />

      <Fieldset legend="Entreprise">
        <Field label="Nom de l'entreprise *" htmlFor="t-company">
          <input id="t-company" name="company" required maxLength={80} defaultValue={t?.example ? "" : t?.company} className={inputClass} placeholder="La Canopée" />
        </Field>
        <ImageInput name="logo" current={t?.logo} label="Logo (PNG ou WebP transparent conseillé)" aspect="aspect-[3/2]" removable />
        <Field label="Site de l'entreprise" htmlFor="t-website">
          <input id="t-website" name="website" type="url" maxLength={300} defaultValue={t?.website} className={inputClass} placeholder="https://…" />
        </Field>
      </Fieldset>

      <Fieldset legend="Avis">
        <Field label="Texte de l'avis *" htmlFor="t-quote" hint="Avec l'accord du client. 600 caractères maximum.">
          <textarea id="t-quote" name="quote" required maxLength={600} rows={5} defaultValue={t?.quote} className={inputClass} />
        </Field>
        <Field label="Nom du responsable *" htmlFor="t-author">
          <input id="t-author" name="author" required maxLength={80} defaultValue={t?.example ? "" : t?.author} className={inputClass} placeholder="Prénom Nom" />
        </Field>
      </Fieldset>

      <div className="sticky bottom-0 -mx-1 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[#05070c]/95 px-1 py-4 backdrop-blur">
        <Status state={state} />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-5 text-[14px] font-semibold text-[#052e16] transition-opacity disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070c]"
        >
          {pending ? <LoaderCircle size={17} className="animate-spin" aria-hidden /> : <Save size={17} aria-hidden />}
          {pending ? "Enregistrement…" : t ? "Enregistrer" : "Ajouter l'avis"}
        </button>
      </div>
    </form>
  );
}

function Action({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`grid h-9 w-9 place-items-center rounded-lg text-white/55 transition-colors disabled:opacity-25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        danger ? "hover:bg-red-500/15 hover:text-red-300" : "hover:bg-white/10 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}
