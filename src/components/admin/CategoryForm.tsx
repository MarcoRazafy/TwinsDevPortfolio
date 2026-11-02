"use client";

import { useActionState, useEffect, useRef } from "react";
import { LoaderCircle } from "lucide-react";
import { saveCategory, type ActionState } from "@/app/admin/actions";
import { CATEGORY_ICON } from "@/components/projects/category-icons";
import { CATEGORY_ICONS, type Category } from "@/lib/projects";
import { Status, inputClass } from "./ui";

type Props = {
  /** Catégorie modifiée, ou `null` pour en créer une. */
  category: Category | null;
  onClose: () => void;
  onSaved: (message: string) => void;
};

/** Création / modification d'une catégorie : nom et icône (légende du globe). */
export default function CategoryForm({ category, onClose, onSaved }: Props) {
  const [state, action, pending] = useActionState<ActionState, FormData>(async (prev, fd) => {
    const result = await saveCategory(prev, fd);
    if (result?.ok) onSaved(result.message);
    return result;
  }, null);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => input.current?.focus(), []);

  return (
    <form
      action={action}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      aria-label={category ? `Modifier la catégorie ${category.label}` : "Nouvelle catégorie"}
      className="flex flex-col gap-4 rounded-2xl border border-accent/30 bg-accent/[0.04] p-4"
    >
      <input type="hidden" name="originalKey" value={category?.key ?? ""} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="cat-label" className="text-[13px] font-medium text-white/75">
          {category ? "Nom de la catégorie" : "Nouvelle catégorie"}
        </label>
        <input
          ref={input}
          id="cat-label"
          name="label"
          required
          maxLength={24}
          defaultValue={category?.label}
          placeholder="E-commerce, Application mobile…"
          className={inputClass}
        />
      </div>

      <fieldset>
        <legend className="mb-2 text-[13px] font-medium text-white/75">Icône sur le globe</legend>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORY_ICONS.map((key, i) => {
            const { Icon, label } = CATEGORY_ICON[key];
            return (
              <label key={key} title={label} className="cursor-pointer">
                <input
                  type="radio"
                  name="icon"
                  value={key}
                  defaultChecked={category ? category.icon === key : i === CATEGORY_ICONS.length - 1}
                  className="peer sr-only"
                />
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/12 text-white/55 transition-colors hover:border-white/30 hover:text-white peer-checked:border-accent/70 peer-checked:bg-accent/20 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                  <Icon size={17} aria-hidden />
                  <span className="sr-only">{label}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-accent px-4 text-[13.5px] font-semibold text-[#052e16] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070c]"
        >
          {pending && <LoaderCircle size={15} aria-hidden className="animate-spin" />}
          {category ? "Enregistrer" : "Créer la catégorie"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="h-10 rounded-xl px-3.5 text-[13.5px] text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Annuler
        </button>
      </div>
      {state && !state.ok && <Status state={state} />}
    </form>
  );
}
