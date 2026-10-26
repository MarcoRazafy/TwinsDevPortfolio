"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, ImagePlus, Trash2 } from "lucide-react";
import { GALLERY_MAX, GALLERY_NEW_PER_SAVE, type GalleryImage } from "@/lib/projects";
import { inputClass } from "./ui";

type Kept = GalleryImage & { id: number };
type Added = { id: number; preview: string | null };

/**
 * Galerie d'un projet : images existantes (description modifiable, ordre, retrait) et nouvelles images.
 * Champs envoyés : galleryKeep + galleryCaption (existantes, dans l'ordre), galleryFile + galleryNewCaption (nouvelles).
 */
export default function GalleryEditor({ initial }: { initial: GalleryImage[] }) {
  const [kept, setKept] = useState<Kept[]>(() => initial.map((g, id) => ({ ...g, id })));
  const [added, setAdded] = useState<Added[]>([]);
  const nextId = useRef(initial.length);
  const previews = useRef(new Set<string>());

  // Libère les aperçus à la fermeture de l'éditeur
  useEffect(() => {
    const urls = previews.current;
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  const total = kept.length + added.length;
  const canAdd = total < GALLERY_MAX && added.length < GALLERY_NEW_PER_SAVE;
  const move = (id: number, dir: -1 | 1) =>
    setKept((all) => {
      const i = all.findIndex((k) => k.id === id);
      const j = i + dir;
      if (j < 0 || j >= all.length) return all;
      const next = [...all];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[13px] font-medium text-white/75">Galerie</p>
        <p className="font-mono text-[11.5px] text-white/40">
          {total} / {GALLERY_MAX}
        </p>
      </div>
      <p className="-mt-2 text-[12px] text-white/40">
        Captures et détails du projet, chacun avec sa description. Affichés dans le panneau sous le globe.
      </p>

      {kept.map((g, i) => (
        <div key={g.id} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-2.5">
          <input type="hidden" name="galleryKeep" value={g.src} />
          <div className="relative aspect-[16/10] w-28 shrink-0 overflow-hidden rounded-lg bg-white/5">
            <Image src={g.src} alt="" fill sizes="112px" className="object-cover" />
          </div>
          <textarea
            name="galleryCaption"
            defaultValue={g.caption}
            maxLength={300}
            rows={3}
            aria-label={`Description de l'image ${i + 1}`}
            placeholder="Description de l'image"
            className={`${inputClass} min-h-0 resize-none py-2 text-[13px]`}
          />
          <div className="flex shrink-0 flex-col">
            <SmallButton label={`Monter l'image ${i + 1}`} disabled={i === 0} onClick={() => move(g.id, -1)}>
              <ArrowUp size={14} aria-hidden />
            </SmallButton>
            <SmallButton label={`Descendre l'image ${i + 1}`} disabled={i === kept.length - 1} onClick={() => move(g.id, 1)}>
              <ArrowDown size={14} aria-hidden />
            </SmallButton>
            <SmallButton label={`Retirer l'image ${i + 1}`} danger onClick={() => setKept((all) => all.filter((k) => k.id !== g.id))}>
              <Trash2 size={14} aria-hidden />
            </SmallButton>
          </div>
        </div>
      ))}

      {added.map((a, i) => (
        <div key={a.id} className="flex gap-3 rounded-xl border border-dashed border-accent/40 bg-accent/[0.04] p-2.5">
          <div className="flex w-28 shrink-0 flex-col gap-1.5">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-white/5">
              {a.preview ? (
                <Image src={a.preview} alt="" fill sizes="112px" unoptimized className="object-cover" />
              ) : (
                <span className="absolute inset-0 grid place-items-center text-white/30">
                  <ImagePlus size={20} aria-hidden />
                </span>
              )}
            </div>
            <input
              name="galleryFile"
              type="file"
              accept="image/webp,image/png,image/jpeg"
              aria-label={`Nouvelle image ${i + 1}`}
              onChange={(e) => {
                const file = e.target.files?.[0];
                const url = file ? URL.createObjectURL(file) : null;
                if (url) previews.current.add(url);
                setAdded((all) => all.map((x) => (x.id === a.id ? { ...x, preview: url } : x)));
              }}
              className="w-full text-[11px] text-white/50 file:mr-2 file:rounded-md file:border-0 file:bg-white/10 file:px-2 file:py-1 file:text-[11px] file:text-white"
            />
          </div>
          <textarea
            name="galleryNewCaption"
            maxLength={300}
            rows={3}
            aria-label={`Description de la nouvelle image ${i + 1}`}
            placeholder="Description de l'image"
            className={`${inputClass} min-h-0 resize-none py-2 text-[13px]`}
          />
          <SmallButton label={`Annuler la nouvelle image ${i + 1}`} danger onClick={() => setAdded((all) => all.filter((x) => x.id !== a.id))}>
            <Trash2 size={14} aria-hidden />
          </SmallButton>
        </div>
      ))}

      <button
        type="button"
        disabled={!canAdd}
        onClick={() => setAdded((all) => [...all, { id: nextId.current++, preview: null }])}
        className="inline-flex w-fit items-center gap-1.5 rounded-xl border border-dashed border-white/20 px-3.5 py-2 text-[13px] text-white/70 transition-colors hover:border-white/40 hover:text-white disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ImagePlus size={15} aria-hidden />
        Ajouter une image
      </button>
      {added.length >= GALLERY_NEW_PER_SAVE && (
        <p className="text-[12px] text-white/45">
          {GALLERY_NEW_PER_SAVE} nouvelles images par enregistrement : enregistrez, puis ajoutez les suivantes.
        </p>
      )}
    </div>
  );
}

function SmallButton({
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
      className={`grid h-8 w-8 place-items-center rounded-lg text-white/55 transition-colors disabled:opacity-25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        danger ? "hover:bg-red-500/15 hover:text-red-300" : "hover:bg-white/10 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}
