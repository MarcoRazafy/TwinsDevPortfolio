"use client";

import { useActionState, useState } from "react";
import { LoaderCircle, Plus, Save, Trash2 } from "lucide-react";
import { saveProfile, type ActionState } from "@/app/admin/actions";
import type { SkillGroup, Twin } from "@/lib/team";
import { Field, Fieldset, ImageInput, Status, TechPicker, inputClass } from "./ui";

/** Formulaire de modification d'un profil (section « À propos »). */
export default function ProfileEditor({ twin }: { twin: Twin }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveProfile, null);
  // Les groupes de compétences sont édités ici puis envoyés en JSON (champ caché « skills »)
  const [groups, setGroups] = useState<(SkillGroup & { id: number })[]>(() => (twin.skills ?? []).map((g, id) => ({ ...g, id })));
  const [nextId, setNextId] = useState(groups.length);

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="slug" value={twin.slug} />
      <input type="hidden" name="skills" value={JSON.stringify(groups.map(({ label, items }) => ({ label, items })))} />

      <Fieldset legend="Identité">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Prénom *" htmlFor="t-name">
            <input id="t-name" name="name" required maxLength={40} defaultValue={twin.name} className={inputClass} />
          </Field>
          <Field label="Nom complet" htmlFor="t-full">
            <input id="t-full" name="fullName" maxLength={120} defaultValue={twin.fullName} className={inputClass} />
          </Field>
        </div>
        <Field label="Formation" htmlFor="t-studies">
          <input id="t-studies" name="studies" maxLength={120} defaultValue={twin.studies} className={inputClass} />
        </Field>
        <Field label="Rôle *" htmlFor="t-role">
          <input id="t-role" name="role" required maxLength={120} defaultValue={twin.role} className={inputClass} />
        </Field>
        <Field label="Phrase d'accroche *" htmlFor="t-tagline">
          <input id="t-tagline" name="tagline" required maxLength={200} defaultValue={twin.tagline} className={inputClass} />
        </Field>
      </Fieldset>

      <Fieldset legend="Parcours">
        <Field label="Parcours *" htmlFor="t-bio" hint="Séparez les paragraphes par une ligne vide (4 au maximum).">
          <textarea id="t-bio" name="bio" required rows={7} maxLength={2400} defaultValue={twin.bio.join("\n\n")} className={inputClass} />
        </Field>
        <Field label="Ce qu'il fait sur un projet *" hint="3 points, affichés en cartes.">
          {[0, 1, 2].map((i) => (
            <input key={i} name="does" maxLength={120} defaultValue={twin.does[i]} aria-label={`Point ${i + 1}`} className={inputClass} />
          ))}
        </Field>
      </Fieldset>

      <Fieldset legend="Compétences">
        <Field label="Spécialités" hint="Les 3 premières tournent autour du portrait.">
          <TechPicker name="stack" initial={twin.stack} max={Infinity} label="Spécialités" />
        </Field>
        <div className="flex flex-col gap-3">
          <p className="text-[13px] font-medium text-white/75">Compétences par catégorie</p>
          {groups.map((g) => (
            <div key={g.id} className="flex flex-col gap-3 rounded-xl border border-white/10 p-3">
              <div className="flex items-center gap-2">
                <input
                  value={g.label}
                  onChange={(e) => setGroups((all) => all.map((x) => (x.id === g.id ? { ...x, label: e.target.value } : x)))}
                  maxLength={40}
                  aria-label="Nom de la catégorie"
                  placeholder="Front-end"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setGroups((all) => all.filter((x) => x.id !== g.id))}
                  aria-label={`Supprimer la catégorie ${g.label || "sans nom"}`}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white/50 transition-colors hover:bg-red-500/15 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Trash2 size={16} aria-hidden />
                </button>
              </div>
              <TechPicker
                initial={g.items}
                max={Infinity}
                label={g.label || "Catégorie"}
                onChange={(items) => setGroups((all) => all.map((x) => (x.id === g.id ? { ...x, items } : x)))}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              setGroups((all) => [...all, { id: nextId, label: "", items: [] }]);
              setNextId((n) => n + 1);
            }}
            className="inline-flex w-fit items-center gap-1.5 rounded-xl border border-dashed border-white/20 px-3.5 py-2 text-[13px] text-white/70 transition-colors hover:border-white/40 hover:text-white disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Plus size={15} aria-hidden />
            Ajouter une catégorie
          </button>
        </div>
      </Fieldset>

      <Fieldset legend="Portrait, liens et couleur">
        <ImageInput name="image" current={twin.image.src} label="Portrait détouré (PNG ou WebP transparent)" aspect="aspect-square" withSize />
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="LinkedIn" htmlFor="t-in">
            <input id="t-in" name="linkedin" type="url" maxLength={300} defaultValue={twin.links.linkedin?.startsWith("http") ? twin.links.linkedin : ""} className={inputClass} placeholder="https://linkedin.com/in/…" />
          </Field>
          <Field label="GitHub" htmlFor="t-gh">
            <input id="t-gh" name="github" type="url" maxLength={300} defaultValue={twin.links.github?.startsWith("http") ? twin.links.github : ""} className={inputClass} placeholder="https://github.com/…" />
          </Field>
          <Field label="E-mail" htmlFor="t-mail">
            <input id="t-mail" name="email" type="email" maxLength={200} defaultValue={twin.links.email} className={inputClass} />
          </Field>
        </div>
        <Field label="Couleur du halo" htmlFor="t-accent">
          <input id="t-accent" name="accent" type="color" defaultValue={twin.accent} className="h-11 w-full max-w-[200px] cursor-pointer rounded-xl border border-white/12 bg-white/[0.05] p-1.5" />
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
          {pending ? "Enregistrement…" : "Enregistrer le profil"}
        </button>
      </div>
    </form>
  );
}
