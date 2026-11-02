"use client";

import { useActionState, useCallback, useRef, useState } from "react";
import { LoaderCircle, Save, X } from "lucide-react";
import { discardGalleryUploads, saveProject, uploadGalleryImage, type ActionState } from "@/app/admin/actions";
import type { Category, Project } from "@/lib/projects";
import GalleryEditor from "./GalleryEditor";
import { ChipCheckbox, Field, Fieldset, ImageInput, Status, TechPicker, inputClass, keepValuesOnSubmit } from "./ui";

type Props = {
  /** Projet modifié, ou `null` pour un nouveau projet. */
  project: Project | null;
  /** Catégories enregistrées (pastilles à cocher). */
  categories: Category[];
  /** Catégorie cochée d'office pour un nouveau projet (filtre actif de la liste). */
  defaultCategory?: string;
  onClose: () => void;
  onSaved: (message: string) => void;
};

/** Formulaire d'ajout / de modification d'un projet. */
export default function ProjectEditor({ project, categories, defaultCategory, onClose, onSaved }: Props) {
  // Nouvelles images de galerie (choisies dans GalleryEditor), envoyées une par une avant l'enregistrement
  const newFiles = useRef<File[]>([]);
  const setNewFiles = useCallback((files: File[]) => {
    newFiles.current = files;
  }, []);
  const [progress, setProgress] = useState<string | null>(null);

  const [state, action, pending] = useActionState<ActionState, FormData>(async (prev, fd) => {
    const files = newFiles.current;
    if (files.length) {
      // Inutile d'envoyer les images si l'enregistrement sera refusé de toute façon
      if (!fd.getAll("categories").length) return { ok: false, message: "Choisissez au moins une catégorie." };
      const slug = String(fd.get("slug") || fd.get("title") || "");
      const sent: string[] = [];
      for (const [i, file] of files.entries()) {
        setProgress(`Envoi des images ${i + 1} / ${files.length}…`);
        const body = new FormData();
        body.append("file", file);
        body.append("slug", slug);
        const r = await uploadGalleryImage(body).catch(() => ({ error: "envoi interrompu." }));
        if ("error" in r) {
          setProgress(null);
          await discardGalleryUploads(sent).catch(() => undefined);
          return { ok: false, message: `Image ${i + 1} (${file.name}) : ${r.error}` };
        }
        sent.push(r.src);
        fd.append("galleryUploaded", r.src);
      }
    }
    setProgress(files.length ? "Enregistrement…" : null);
    const result = await saveProject(prev, fd);
    setProgress(null);
    if (result?.ok) onSaved(result.message);
    return result;
  }, null);
  const p = project;

  return (
    <form action={action} onSubmit={keepValuesOnSubmit(action)} className="flex flex-col gap-5" aria-labelledby="editeur-projet">
      <div className="flex items-center justify-between gap-3">
        <h2 id="editeur-projet" className="font-[family-name:var(--font-display)] text-[1.25rem] font-semibold">
          {p ? `Modifier « ${p.title.split(",")[0]} »` : "Nouveau projet"}
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

      <input type="hidden" name="originalSlug" value={p?.slug ?? ""} />

      <Fieldset legend="Présentation">
        <Field label="Titre *" htmlFor="p-title">
          <input id="p-title" name="title" required maxLength={120} defaultValue={p?.title} className={inputClass} placeholder="La Canopée, restaurant & rooftop" />
        </Field>
        <Field label="Secteur · type de projet" htmlFor="p-kind">
          <input id="p-kind" name="kind" maxLength={80} defaultValue={p?.kind} className={inputClass} placeholder="Restauration · site vitrine" />
        </Field>
        <Field label="Description" htmlFor="p-problem" hint="Une ou deux phrases : le besoin du client ou ce que fait le projet.">
          <textarea id="p-problem" name="problem" maxLength={400} rows={3} defaultValue={p?.problem} className={inputClass} />
        </Field>
        <Field label="Ce qui a été livré" hint="Jusqu'à 3 points, affichés en pastilles.">
          {[0, 1, 2].map((i) => (
            <input key={i} name="delivered" maxLength={120} defaultValue={p?.delivered[i]} aria-label={`Point livré ${i + 1}`} className={inputClass} />
          ))}
        </Field>
      </Fieldset>

      <Fieldset legend="Classement">
        <Field label="Catégories * (légendes du globe)">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <ChipCheckbox key={c.key} name="categories" value={c.key} label={c.label} defaultChecked={p ? p.categories.includes(c.key) : c.key === defaultCategory} />
            ))}
          </div>
        </Field>
        <Field label="Technologies utilisées">
          <TechPicker name="stack" initial={p?.stack ?? []} label="Technologies utilisées" />
        </Field>
      </Fieldset>

      <Fieldset legend="Visuel et liens">
        <ImageInput name="image" current={p?.image} label="Visuel du projet (16:10 conseillé)" removable />
        <GalleryEditor initial={p?.gallery ?? []} onNewFiles={setNewFiles} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Lien du site" htmlFor="p-site">
            <input id="p-site" name="site" type="url" maxLength={300} defaultValue={p?.links.site} className={inputClass} placeholder="https://…" />
          </Field>
          <Field label="Lien du code" htmlFor="p-code">
            <input id="p-code" name="code" type="url" maxLength={300} defaultValue={p?.links.code} className={inputClass} placeholder="https://github.com/…" />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Couleur d'accent" htmlFor="p-accent">
            <input id="p-accent" name="accent" type="color" defaultValue={p?.accent ?? "#22c55e"} className="h-11 w-full cursor-pointer rounded-xl border border-white/12 bg-white/[0.05] p-1.5" />
          </Field>
          <Field label="Identifiant" htmlFor="p-slug" hint="Généré depuis le titre si vide.">
            <input id="p-slug" name="slug" maxLength={60} pattern="[a-z0-9]+(-[a-z0-9]+)*" defaultValue={p?.slug} className={`${inputClass} font-mono`} placeholder="la-canopee" />
          </Field>
        </div>
      </Fieldset>

      <div className="sticky bottom-0 -mx-1 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[#05070c]/95 px-1 py-4 backdrop-blur">
        <Status state={state} />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-5 text-[14px] font-semibold text-[#052e16] transition-opacity disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070c]"
        >
          {pending ? <LoaderCircle size={17} className="animate-spin" aria-hidden /> : <Save size={17} aria-hidden />}
          {pending ? (progress ?? "Enregistrement…") : p ? "Enregistrer" : "Ajouter le projet"}
        </button>
      </div>
    </form>
  );
}
